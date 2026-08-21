export interface ShortLink {
  id: string;
  linkId?: string;
  originalUrl?: string;
  longUrl?: string;
  shortUrl: string;
  shortCode?: string;
  createdAt?: string;
  clicks?: number;
  qrCodeUrl?: string;
  hasQrCode?: boolean;
}

export interface CreateLinkResponse {
  linkId: string;
  shortUrl: string;
  originalUrl?: string;
  longUrl?: string;
}
