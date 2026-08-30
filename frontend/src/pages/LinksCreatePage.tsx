import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createLink, checkIfShortUrlExist } from "@/api/links.api";
import { ApiError } from "@/types/error";
import { Link2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { CheckIfShortUrlExistResponse, CreateLinkPayload, CreateLinkResponse, Tag } from "@/types/api";
import { TagComboboxMultiple } from "@/components/TagComboboxMultiple";

export const LinksCreatePage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);

  // Validation & Loading States
  const [longUrlError, setLongUrlError] = useState("");
  const [shortUrlTaken, setShortUrlTaken] = useState(false);
  const [shortUrlError, setShortUrlError] = useState("");
  const [isCheckingShortUrl, setIsCheckingShortUrl] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounced shortUrl check (500ms)
  useEffect(() => {
    const trimmed = shortUrl.trim();
    if (!trimmed) {
      setShortUrlTaken(false);
      setShortUrlError("");
      setIsCheckingShortUrl(false);
      return;
    }

    // Validate regex: /^[a-zA-Z0-9_-]+$/ and length 1-20
    const validPattern = /^[a-zA-Z0-9_-]{1,20}$/;
    if (!validPattern.test(trimmed)) {
      setShortUrlError("Must be 1-20 alphanumeric characters, hyphens, or underscores");
      setShortUrlTaken(false);
      setIsCheckingShortUrl(false);
      return;
    }

    setShortUrlError("");
    setIsCheckingShortUrl(true);

    const timer = setTimeout(async () => {
      try {
        const res: CheckIfShortUrlExistResponse = await checkIfShortUrlExist(trimmed);
        // Correct check for boolean exists property from backend response
        const exists = res.data.exists;
        setShortUrlTaken(exists);
        if (exists) {
          setShortUrlError("Short URL is already taken");
        } else {
          setShortUrlError("");
        }
      } catch (err) {
        setShortUrlTaken(false);
        if (err instanceof ApiError) {
          toast.error(err.message);
        } else {
          toast.error("An error occurred while Checking ShortURL!");
        }
      } finally {
        setIsCheckingShortUrl(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [shortUrl]);

  // Submit Handler
  const handleSubmit = async () => {
    setLongUrlError("");

    const trimmedLongUrl = longUrl.trim();
    const trimmedShortUrl = shortUrl.trim();
    const trimmedTitle = title.trim();

    // Validate URL
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

    // Validate custom short URL
    if (shortUrlTaken) {
      toast.error("Short URL is already taken. Please choose another.");
      return;
    }

    setIsSubmitting(true);

    const payload: CreateLinkPayload = {
      longUrl: trimmedLongUrl,
      ...(trimmedShortUrl && { shortUrl: trimmedShortUrl }),
      ...(trimmedTitle && { title: trimmedTitle }),
      ...(tags.length && { tags: tags.map((tag) => tag.name) }),
    };

    try {
      const res: CreateLinkResponse = await createLink(payload);

      toast.success(res.message);
      // console.log(res.data);
      // console.log(payload.tags);
      navigate(`/links/${res.data.shortUrl}/details`, {
        state: {
          ...res.data,
          tags: payload.tags,
        },
      });
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to create short link. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create Short Link</h1>
        <p className="text-sm text-muted-foreground">
          Configure destination URL, custom back-half, title, and tags.
        </p>
      </div>

      <Card className="max-w-2xl shadow-sm border-muted/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>Link Details</CardTitle>
          </div>
          <CardDescription>
            Enter your destination URL and optional configuration below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            {/* Destination URL */}
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

            {/* Custom Back-Half (shortUrl) */}
            <div className="space-y-2">
              <Label htmlFor="short-url" className="text-sm font-semibold">
                Custom Back-Half <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
              </Label>
              <div className="relative">
                <Input
                  id="short-url"
                  type="text"
                  placeholder="custom-backhalf"
                  value={shortUrl}
                  onChange={(e) => setShortUrl(e.target.value)}
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
              {!shortUrlError && !isCheckingShortUrl && shortUrl.trim() && !shortUrlTaken && (
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  Short URL is available!
                </p>
              )}
            </div>

            {/* Title */}
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

            {/* Tags Combobox Multi-Select */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Tags <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
              </Label>

              <TagComboboxMultiple
                selectedTags={tags}
                setSelectedTags={setTags}
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/home")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || shortUrlTaken || !!shortUrlError}
                className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
              >
                <span>{isSubmitting ? "Creating..." : "Create Link"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinksCreatePage;
