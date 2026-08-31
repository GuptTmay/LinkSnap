export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type Tag = {
  id?: string;
  name: string;
  createdAt?: Date;
};


export type GetTagsResponse = ApiSuccess<{
  tags: Tag[];
}>;

export type CheckIfShortUrlExistResponse = ApiSuccess<{
  exists: boolean;
}>;

export type Link = {
  id: string;
  shortUrl: string;
  longUrl: string;
  title: string;
}

export type CreateLinkResponse = ApiSuccess<Link>;

export type GetAllLinks = ApiSuccess<{
}>

export type CreateLinkPayload = {
  shortUrl?: string; // 1-20 chars, regex: /^[a-zA-Z0-9_-]+$/
  longUrl: string;   // valid URL
  title?: string;    // 1-64 chars
  tags?: string[];   // array of string (max 50 chars each)
  customization?: unknown
}
export type QrCode = {
  id: string;
  customization: unknown; // matches repository's `customization: unknown` — tighten if you have a real shape
  createdAt: string;
};

export type LinkWithRelations = Link & {
  createdAt: string;
  updatedAt: string;
  qrCode: QrCode | null;
  tags: Tag[];
};

export type GetLinksPayload = {
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
  qrCode?: boolean;
};

export type GetLinksData = {
  links: LinkWithRelations[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type GetLinksResponse = ApiSuccess<GetLinksData>;

export type DeleteLinkResponse = ApiSuccess<{id: string}>;

export type GetLinkByShortUrlResponse = ApiSuccess<LinkWithRelations>