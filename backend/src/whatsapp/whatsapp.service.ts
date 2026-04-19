import { Injectable, OnModuleInit, Logger, ServiceUnavailableException } from '@nestjs/common';
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import * as QRCode from 'qrcode';
import { Recipient } from './dto/send-message.dto';

type ConnectionStatus = 'loading' | 'qr' | 'connected' | 'disconnected';

@Injectable()
export class WhatsAppService implements OnModuleInit {
  private readonly logger = new Logger(WhatsAppService.name);
  private sock: ReturnType<typeof makeWASocket> | null = null;
  private qrCode: string | null = null;
  private connectionStatus: ConnectionStatus = 'loading';

  async onModuleInit() {
    await this.initializeBaileys();
  }

  private async initializeBaileys() {
    const { state, saveCreds } = await useMultiFileAuthState('./whatsapp-session');
    const { version } = await fetchLatestBaileysVersion();

    this.sock = makeWASocket({
      version,
      auth: state,
      printQRInTerminal: true,
      // Silence the verbose pino logger that Baileys uses internally
      logger: require('pino')({ level: 'silent' }),
    });

    this.sock.ev.on('creds.update', saveCreds);

    this.sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this.qrCode = await QRCode.toDataURL(qr);
        this.connectionStatus = 'qr';
        this.logger.log('QR code generated - waiting for scan');
      }

      if (connection === 'open') {
        this.connectionStatus = 'connected';
        this.qrCode = null;
        this.logger.log('WhatsApp connected successfully');
      }

      if (connection === 'close') {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
        this.logger.warn(
          `Connection closed. Status: ${statusCode}. Reconnecting: ${shouldReconnect}`,
        );

        if (shouldReconnect) {
          this.connectionStatus = 'loading';
          this.sock?.ev.removeAllListeners();
          this.sock?.end(undefined);
          await this.initializeBaileys().catch(() =>
            setTimeout(() => this.initializeBaileys(), 5000)
          );
        } else {
          this.connectionStatus = 'disconnected';
        }
      }
    });
  }

  getStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  getQrCode(): string | null {
    return this.qrCode;
  }

  private assertConnected() {
    if (this.connectionStatus !== 'connected' || !this.sock) {
      throw new ServiceUnavailableException(
        'WhatsApp is not connected. Please scan the QR code first.',
      );
    }
  }

  async sendGroupMessage(groupId: string, text: string): Promise<void> {
    this.assertConnected();
    await this.sock!.sendMessage(groupId, { text });
    this.logger.log(`Group message sent to ${groupId}`);
  }

  async sendIndividualMessages(
    recipients: Recipient[],
    messageTemplate: string,
  ): Promise<{ sent: number; failed: number; details: { phone: string; status: string; error?: string }[] }> {
    this.assertConnected();

    const details: { phone: string; status: string; error?: string }[] = [];
    let sent = 0;
    let failed = 0;

    for (const recipient of recipients) {
      if (!recipient.phone?.trim()) {
        this.logger.warn(`Skipping recipient ${recipient.name} — missing phone number`);
        failed++;
        continue;
      }
      try {
        const jid = recipient.phone.replace('+', '') + '@s.whatsapp.net';
        const text = messageTemplate
          .replace(/{name}/g, recipient.name)
          .replace(/{balance}/g, String(recipient.balance ?? ''));

        await this.sock!.sendMessage(jid, { text });
        details.push({ phone: recipient.phone, status: 'sent' });
        sent++;

        // Rate limit: 1 second between messages to avoid WhatsApp throttling
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error';
        details.push({ phone: recipient.phone, status: 'failed', error: msg });
        failed++;
        this.logger.error(`Failed to send to ${recipient.phone}: ${msg}`);
      }
    }

    return { sent, failed, details };
  }

  async getGroups(): Promise<{ id: string; name: string }[]> {
    this.assertConnected();
    const groups = await this.sock!.groupFetchAllParticipating();
    return Object.values(groups).map((g) => ({ id: g.id, name: g.subject }));
  }
}
