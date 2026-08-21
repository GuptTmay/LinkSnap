export interface QrCode {
  id: string;
  linkId: string;
  shortUrl: string;
  qrCodeDataUrl?: string;
  createdAt?: string;
  customization?: Record<string, unknown>;
}

export type QrCreationStatus = "idle" | "creating_link" | "generating_qr" | "registering_qr" | "success" | "error";
