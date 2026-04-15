// Stub for qrcode — prevents import errors in ts-jest when WhatsAppService is compiled.
export const toDataURL = jest.fn().mockResolvedValue('data:image/png;base64,mock');
export const toString = jest.fn().mockResolvedValue('mock-qr-string');
