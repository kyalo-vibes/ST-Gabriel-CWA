export interface Recipient {
  name: string;
  phone: string;
  balance?: number;
}

export interface SendMessageDto {
  mode: 'group' | 'individual';
  groupId?: string;
  recipients?: Recipient[];
  message: string;
  notificationType?: string;
  targetGroup?: string;
}
