import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getLinkByShortUrl, updateLink, checkIfShortUrlExist } from "@/api/links.api";
import { ApiError } from "@/types/error";
import { Link2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { CheckIfShortUrlExistResponse, Tag, UpdateLinkPayload } from "@/types/api";
import { TagComboboxMultiple } from "@/components/TagComboboxMultiple";

// Mirrors the backend's short-URL constraint (see CreateLinkSchema /
// UpdateLinkBodySchema). Duplicated here for instant client-side feedback —
// if you have a shared validation package between FE/BE, move this there so
// the two can't drift.
const SHORT_URL_PATTERN = /^[a-zA-Z0-9_-]{1,20}$/;
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
  // Bumped on every keystroke; a response is only applied if its captured
  // requestId still matches this ref when it resolves. Prevents a slow,
  // stale "taken" response from overwriting a faster, fresher "available"
  // result if responses arrive out of order.
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

  // Unmount cleanup — separate from the "clear previous timer on new
  // keystroke" logic below. Without this, navigating away (e.g. clicking
  // Cancel) within the debounce window still lets the timeout fire later
  // and call setState on an unmounted component.
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

    // Invalidate any in-flight check from a previous keystroke.
    const requestId = ++shortUrlRequestIdRef.current;

    const trimmed = value.trim();
    const originalShortUrl = routeShortUrl || "";

    if (!trimmed || trimmed === originalShortUrl) {
      setShortUrlTaken(false);
      setShortUrlError("");
      setIsCheckingShortUrl(false);
      return;
    }

    if (!SHORT_URL_PATTERN.test(trimmed)) {
      setShortUrlError("Must be 1-20 alphanumeric characters, hyphens, or underscores");
      setShortUrlTaken(false);
      setIsCheckingShortUrl(false);
      return;
    }

    setShortUrlError("");
    setIsCheckingShortUrl(true);

    shortUrlCheckTimerRef.current = window.setTimeout(async () => {
      try {
        const res: CheckIfShortUrlExistResponse = await checkIfShortUrlExist(trimmed);

        // A newer keystroke has already superseded this request — drop it.
        if (requestId !== shortUrlRequestIdRef.current) return;

        const exists = res.data.exists;
        setShortUrlTaken(exists);
        setShortUrlError(exists ? "Short URL is already taken" : "");
      } catch (err) {
        if (requestId !== shortUrlRequestIdRef.current) return;

        setShortUrlTaken(false);
        if (err instanceof ApiError) {
          toast.error(err.message);
        } else {
          toast.error("An error occurred while checking Short URL!");
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
      setLongUrlError("Please enter a valid URL (e.g. https://example.com)");
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

    // NOTE on empty shortUrl: an emptied field sends `shortUrl: undefined`,
    // which the backend treats as "no change" (the field is dropped from
    // the JSON body), not "generate a new random short code". If you want
    // clearing the field to trigger regeneration, that needs an explicit
    // signal (e.g. a separate "Regenerate" button) rather than overloading
    // an empty string — silently doing nothing on an empty field is a
    // confusing trap for users who expect it to reset.
    const payload: Partial<UpdateLinkPayload> = {
      longUrl: trimmedLongUrl,
      shortUrl: trimmedShortUrl || undefined,
      title: trimmedTitle === "" ? undefined : trimmedTitle,
      tags: tags.map((tag) => tag.name),
    };

    try {
      const res = await updateLink(linkId, payload);
      const nextShortUrl = trimmedShortUrl || routeShortUrl || res.data.shortUrl;
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Link</h1>
          <p className="text-sm text-muted-foreground">Loading link details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Link</h1>
        <p className="text-sm text-muted-foreground">
          Update your existing short link details.
        </p>
      </div>

      <Card className="max-w-2xl shadow-sm border-muted/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <CardTitle>Edit Link Details</CardTitle>
          </div>
          <CardDescription>
            Modify destination URL, short code, title, and tags.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <div className="space-y-2">
              <Label htmlFor="long-url" className="text-sm font-semibold">
                Destination URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="long-url"
                type="url"
                placeholder="https://example.com/my-long-url"
                value={longUrl}
                onChange={(e) => {
                  setLongUrl(e.target.value);
                  if (longUrlError) setLongUrlError("");
                }}
                className={longUrlError ? "border-destructive" : ""}
              />
              {longUrlError && (
                <p className="text-xs text-destructive font-medium">{longUrlError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="short-url" className="text-sm font-semibold">
                Short URL <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
              </Label>
              <div className="relative">
                <Input
                  id="short-url"
                  type="text"
                  placeholder="custom-backhalf"
                  value={shortUrl}
                  onChange={(e) => handleShortUrlChange(e.target.value)}
                  className={shortUrlError ? "border-destructive pr-8" : "pr-8"}
                />
                {isCheckingShortUrl && (
                  <div className="absolute right-2.5 top-2.5">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                )}
              </div>
              {shortUrlError && (
                <p className="text-xs text-destructive font-medium">{shortUrlError}</p>
              )}
              {!shortUrlError && !isCheckingShortUrl && shortUrl.trim() && shortUrl.trim() !== (routeShortUrl || "") && !shortUrlTaken && (
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Short URL is available!
                </p>
              )}
              {!shortUrl.trim() && (
                <p className="text-xs text-muted-foreground">
                  Leave blank to keep the current short URL ({routeShortUrl}).
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                Title <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="title"
                type="text"
                maxLength={64}
                placeholder="Campaign Link Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Tags <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
              </Label>
              <TagComboboxMultiple selectedTags={tags} setSelectedTags={setTags} />
            </div>

            <div className="pt-4 border-t flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/links/${routeShortUrl || ""}/details`)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                <span>{isSubmitting ? "Saving..." : "Save Changes"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkEditPage;