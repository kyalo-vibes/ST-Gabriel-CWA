// Stub for @whiskeysockets/baileys — prevents ESM parse errors in ts-jest.
// The WhatsAppService is always mocked at the provider level in unit tests,
// so this stub is never actually called.

const makeWASocket = jest.fn();

export default makeWASocket;
export const useMultiFileAuthState = jest.fn();
export const DisconnectReason = { loggedOut: 401 };
export const fetchLatestBaileysVersion = jest.fn();
export const makeCacheableSignalKeyStore = jest.fn();
export const WAProto = {};
