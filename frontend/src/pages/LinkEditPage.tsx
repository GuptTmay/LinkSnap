import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import {
  getLinkByShortUrl,
  updateLink,
  checkIfShortUrlExist,
} from "@/api/links.api";

import { ApiError } from "@/types/error";
import { Link2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type {
  CheckIfShortUrlExistResponse,
  Tag,
  UpdateLinkPayload,
} from "@/types/api";

import { TagComboboxMultiple } from "@/components/TagComboboxMultiple";
import { SHORT_URL_CONFIG } from "@/config";

const SHORT_URL_DEBOUNCE_MS = 600;

export const LinkEditPage: React.FC = () => {
  const { shortUrl: routeShortUrl } = useParams<{ shortUrl: string }>();
  const navigate = useNavigate();

  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [linkId, setLinkId] = useState("");

  const [longUrlError, setLongUrlError] = useState("");
  const [shortUrlTaken, setShortUrlTaken] = useState(false);
  const [shortUrlError, setShortUrlError] = useState("");
  const [isCheckingShortUrl, setIsCheckingShortUrl] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shortUrlCheckTimerRef = useRef<number | null>(null);
  const shortUrlRequestIdRef = useRef(0);

  useEffect(() => {
    if (!routeShortUrl) {
      navigate("/links");
      return;
    }

    let isMounted = true;

    const fetchLink = async () => {
      try {
        setIsFetching(true);

        const res = await getLinkByShortUrl(routeShortUrl);

        if (!isMounted) return;

        setLinkId(res.data.id);
        setLongUrl(res.data.longUrl || "");
        setShortUrl(res.data.shortUrl || "");
        setTitle(res.data.title || "");
        setTags(res.data.tags || []);
      } catch (error) {
        if (!isMounted) return;

        if (error instanceof ApiError) {
          toast.error(error.message);
        } else {
          toast.error("Failed to load link details.");
        }

        navigate("/links");
      } finally {
        if (isMounted) {
          setIsFetching(false);
        }
      }
    };

    fetchLink();

    return () => {
      isMounted = false;
    };
  }, [routeShortUrl, navigate]);

  useEffect(() => {
    return () => {
      if (shortUrlCheckTimerRef.current) {
        window.clearTimeout(shortUrlCheckTimerRef.current);
      }
    };
  }, []);

  const handleShortUrlChange = (value: string) => {
    setShortUrl(value);

    if (shortUrlCheckTimerRef.current) {
      window.clearTimeout(shortUrlCheckTimerRef.current);
    }

    const requestId = ++shortUrlRequestIdRef.current;

    const trimmed = value.trim();
    const originalShortUrl = routeShortUrl || "";

    if (!trimmed || trimmed === originalShortUrl) {
      setShortUrlTaken(false);
      setShortUrlError("");
      setIsCheckingShortUrl(false);
      return;
    }

    if (!SHORT_URL_CONFIG.PATTERN.test(trimmed)) {
      setShortUrlError(SHORT_URL_CONFIG.ERROR_MESSAGE);
      setShortUrlTaken(false);
      setIsCheckingShortUrl(false);
      return;
    }

    setShortUrlError("");
    setIsCheckingShortUrl(true);

    shortUrlCheckTimerRef.current = window.setTimeout(async () => {
      try {
        const res: CheckIfShortUrlExistResponse =
          await checkIfShortUrlExist(trimmed);

        if (requestId !== shortUrlRequestIdRef.current) {
          return;
        }

        const exists = res.data.exists;

        setShortUrlTaken(exists);
        setShortUrlError(exists ? "Short URL is already taken" : "");
      } catch (err) {
        if (requestId !== shortUrlRequestIdRef.current) {
          return;
        }

        setShortUrlTaken(false);

        if (err instanceof ApiError) {
          toast.error(err.message);
        } else {
          toast.error("An error occurred while checking Short URL.");
        }
      } finally {
        if (requestId === shortUrlRequestIdRef.current) {
          setIsCheckingShortUrl(false);
        }
      }
    }, SHORT_URL_DEBOUNCE_MS);
  };

  const handleSubmit = async () => {
    setLongUrlError("");

    const trimmedLongUrl = longUrl.trim();
    const trimmedShortUrl = shortUrl.trim();
    const trimmedTitle = title.trim();

    if (!trimmedLongUrl) {
      setLongUrlError("Destination URL is required");
      return;
    }

    try {
      new URL(trimmedLongUrl);
    } catch {
      setLongUrlError(
        "Please enter a valid URL (e.g. https://example.com)"
      );
      return;
    }

    if (shortUrlTaken) {
      toast.error("Short URL is already taken. Please choose another.");
      return;
    }

    if (!linkId) {
      toast.error("Link details are not loaded yet.");
      return;
    }

    setIsSubmitting(true);

    const payload: Partial<UpdateLinkPayload> = {
      longUrl: trimmedLongUrl,
      shortUrl: trimmedShortUrl || undefined,
      title: trimmedTitle || undefined,
      tags: tags.map((tag) => tag.name),
    };

    try {
      const res = await updateLink(linkId, payload);

      const nextShortUrl =
        trimmedShortUrl || routeShortUrl || res.data.shortUrl;

      toast.success(res.message || "Link updated successfully");

      navigate(`/links/${nextShortUrl}/details`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to update short link. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isFetching) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Edit Link
          </h1>

          <p className="text-sm text-muted-foreground">
            Loading link details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Link2 className="h-5 w-5 text-primary" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Edit Link
          </h1>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Update your destination, short URL, title, or tags.
        </p>
      </div>

      {/* Edit Form */}
      <Card className="mx-auto w-full max-w-3xl border-border/60 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle>Link Information</CardTitle>

          <CardDescription>
            Make the changes you want and save when you're ready.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-5 sm:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="space-y-6"
          >
            {/* Destination URL */}
            <div className="space-y-2">
              <Label htmlFor="long-url">
                Destination URL{" "}
                <span className="text-destructive">*</span>
              </Label>

              <Input
                id="long-url"
                type="url"
                placeholder="https://example.com/my-long-url"
                value={longUrl}
                onChange={(e) => {
                  setLongUrl(e.target.value);

                  if (longUrlError) {
                    setLongUrlError("");
                  }
                }}
                className={longUrlError ? "border-destructive" : ""}
              />

              {longUrlError && (
                <p className="text-xs text-destructive">
                  {longUrlError}
                </p>
              )}
            </div>

            {/* Short URL */}
            <div className="space-y-2">
              <Label htmlFor="short-url">
                Short URL{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (Optional)
                </span>
              </Label>

              <div className="relative">
                <Input
                  id="short-url"
                  type="text"
                  placeholder="custom-backhalf"
                  value={shortUrl}
                  onChange={(e) =>
                    handleShortUrlChange(e.target.value)
                  }
                  className={
                    shortUrlError ? "border-destructive pr-9" : "pr-9"
                  }
                />

                {isCheckingShortUrl && (
                  <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>

              {shortUrlError && (
                <p className="text-xs text-destructive">
                  {shortUrlError}
                </p>
              )}

              {!shortUrlError &&
                !isCheckingShortUrl &&
                shortUrl.trim() &&
                shortUrl.trim() !== (routeShortUrl || "") &&
                !shortUrlTaken && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Short URL is available.
                  </p>
                )}

              {!shortUrl.trim() && (
                <p className="text-xs text-muted-foreground">
                  Leave blank to keep the current short URL{" "}
                  <span className="font-medium">{routeShortUrl}</span>.
                </p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">
                  Title{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </Label>

                <span className="text-xs text-muted-foreground">
                  {title.length}/64
                </span>
              </div>

              <Input
                id="title"
                type="text"
                maxLength={64}
                placeholder="Campaign Link Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>
                Tags{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  (Optional)
                </span>
              </Label>

              <TagComboboxMultiple
                selectedTags={tags}
                setSelectedTags={setTags}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate(
                    `/links/${routeShortUrl || ""}/details`
                  )
                }
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="gap-2"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}

                {!isSubmitting && (
                  <ArrowRight className="h-4 w-4" />
                )}

                {isSubmitting && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkEditPage;