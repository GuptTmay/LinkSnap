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

export type CreateLinkPayload = {
  shortUrl?: string; // 1-20 chars, regex: /^[a-zA-Z0-9_-]+$/
  longUrl: string;   // valid URL
  title?: string;    // 1-64 chars
  tags?: string[];   // array of string (max 50 chars each)
}

