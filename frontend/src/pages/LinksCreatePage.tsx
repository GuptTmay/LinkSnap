import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Link2,
  ArrowRight,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { createLink, checkIfShortUrlExist } from "@/api/links.api";
import { ApiError } from "@/types/error";
import type {
  CheckIfShortUrlExistResponse,
  CreateLinkPayload,
  CreateLinkResponse,
  Tag,
} from "@/types/api";
import { TagComboboxMultiple } from "@/components/TagComboboxMultiple";
import { toast } from "sonner";

export const LinksCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);

  const [longUrlError, setLongUrlError] = useState("");
  const [shortUrlTaken, setShortUrlTaken] = useState(false);
  const [shortUrlError, setShortUrlError] = useState("");
  const [isCheckingShortUrl, setIsCheckingShortUrl] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const trimmed = shortUrl.trim();

    if (!trimmed) {
      setShortUrlTaken(false);
      setShortUrlError("");
      setIsCheckingShortUrl(false);
      return;
    }

    const validPattern = /^[a-zA-Z0-9_-]{1,20}$/;

    if (!validPattern.test(trimmed)) {
      setShortUrlError(
        "Use 1–20 letters, numbers, hyphens, or underscores."
      );
      setShortUrlTaken(false);
      setIsCheckingShortUrl(false);
      return;
    }

    setShortUrlError("");
    setIsCheckingShortUrl(true);

    const timer = setTimeout(async () => {
      try {
        const res: CheckIfShortUrlExistResponse =
          await checkIfShortUrlExist(trimmed);

        const exists = res.data.exists;

        setShortUrlTaken(exists);
        setShortUrlError(exists ? "This short URL is already taken." : "");
      } catch (err) {
        setShortUrlTaken(false);

        if (err instanceof ApiError) {
          toast.error(err.message);
        } else {
          toast.error("Unable to check short URL availability.");
        }
      } finally {
        setIsCheckingShortUrl(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [shortUrl]);

  const handleSubmit = async () => {
    setLongUrlError("");

    const trimmedLongUrl = longUrl.trim();
    const trimmedShortUrl = shortUrl.trim();
    const trimmedTitle = title.trim();

    if (!trimmedLongUrl) {
      setLongUrlError("Destination URL is required.");
      return;
    }

    try {
      new URL(trimmedLongUrl);
    } catch {
      setLongUrlError(
        "Please enter a valid URL, such as https://example.com"
      );
      return;
    }

    if (shortUrlTaken || shortUrlError) {
      toast.error("Please fix the short URL before continuing.");
      return;
    }

    setIsSubmitting(true);

    const payload: CreateLinkPayload = {
      longUrl: trimmedLongUrl,
      ...(trimmedShortUrl && { shortUrl: trimmedShortUrl }),
      ...(trimmedTitle && { title: trimmedTitle }),
      ...(tags.length > 0 && {
        tags: tags.map((tag) => tag.name),
      }),
    };

    try {
      const res: CreateLinkResponse = await createLink(payload);

      toast.success(res.message);
      navigate(`/links/${res.data.shortUrl}/details`);
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

  const isShortUrlAvailable =
    !!shortUrl.trim() &&
    !shortUrlError &&
    !shortUrlTaken &&
    !isCheckingShortUrl;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-blue-500/5 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400">
          <Sparkles className="h-3.5 w-3.5" />
          Create a short link
        </div>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Create Short Link
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Turn a long URL into a clean, shareable link with optional
          customization and tags.
        </p>
      </div>

      {/* Form Card */}
      <Card className="overflow-hidden border-muted/60 shadow-sm">
        <CardHeader className="border-b bg-muted/10 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
              <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl">
                Link Details
              </CardTitle>

              <CardDescription className="mt-1 leading-5">
                Add your destination and customize how your link appears.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 py-6 sm:px-7 sm:py-8">
          <form
            className="space-y-7"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Destination URL */}
            <div className="space-y-2">
              <Label
                htmlFor="long-url"
                className="text-sm font-semibold"
              >
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
                className={`h-11 ${
                  longUrlError
                    ? "border-destructive focus-visible:ring-destructive"
                    : ""
                }`}
                aria-invalid={!!longUrlError}
              />

              {longUrlError ? (
                <p className="text-xs font-medium text-destructive">
                  {longUrlError}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Enter the URL where visitors should be redirected.
                </p>
              )}
            </div>

            {/* Custom Short URL */}
            <div className="space-y-2">
              <Label
                htmlFor="short-url"
                className="text-sm font-semibold"
              >
                Custom Back-Half{" "}
                <span className="font-normal text-muted-foreground">
                  (Optional)
                </span>
              </Label>

              <div className="relative">
                <Input
                  id="short-url"
                  type="text"
                  placeholder="my-campaign"
                  value={shortUrl}
                  onChange={(e) => setShortUrl(e.target.value)}
                  className={`h-11 pr-10 ${
                    shortUrlError
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  aria-invalid={!!shortUrlError}
                />

                {isCheckingShortUrl && (
                  <Loader2 className="absolute right-3 top-3 h-5 w-5 animate-spin text-muted-foreground" />
                )}

                {isShortUrlAvailable && (
                  <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                )}
              </div>

              {shortUrlError ? (
                <p className="text-xs font-medium text-destructive">
                  {shortUrlError}
                </p>
              ) : isCheckingShortUrl ? (
                <p className="text-xs text-muted-foreground">
                  Checking availability...
                </p>
              ) : isShortUrlAvailable ? (
                <p className="text-xs font-medium text-green-600 dark:text-green-400">
                  This short URL is available.
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  1–20 characters. Letters, numbers, hyphens, and underscores.
                </p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title" className="text-sm font-semibold">
                  Title{" "}
                  <span className="font-normal text-muted-foreground">
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
                placeholder="e.g. Summer Campaign"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11"
              />

              <p className="text-xs text-muted-foreground">
                Give your link a recognizable name so it's easier to manage.
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Tags{" "}
                <span className="font-normal text-muted-foreground">
                  (Optional)
                </span>
              </Label>

              <TagComboboxMultiple
                selectedTags={tags}
                setSelectedTags={setTags}
              />

              <p className="text-xs text-muted-foreground">
                Use tags to organize and filter your links later.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/home")}
                disabled={isSubmitting}
                className="h-11 w-full sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={
                  isSubmitting ||
                  shortUrlTaken ||
                  !!shortUrlError ||
                  isCheckingShortUrl
                }
                className="h-11 w-full gap-2 bg-blue-600 px-6 text-white hover:bg-blue-700 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    Create Link
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Small hint below form */}
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Your generated short link will be ready immediately after creation.
      </p>
    </div>
  );
};

export default LinksCreatePage;