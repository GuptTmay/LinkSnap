import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Link2,
  ExternalLink,
  Tag as TagIcon,
  Calendar,
  ArrowLeft,
  Copy,
  Check,
} from "lucide-react";
import { getLinkByShortUrl } from "@/api/links.api";
import { ApiError } from "@/types/error";
import type { LinkWithRelations } from "@/types/api";
import { toast } from "sonner";

export const LinkDetailsPage: React.FC = () => {
  const { shortUrl } = useParams<{ shortUrl: string }>();
  const navigate = useNavigate();

  const [details, setDetails] = useState<LinkWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const BACKEND_BASE_URL =
    import.meta.env.VITE_BACKEND_BASE_URL || "";

  useEffect(() => {
    if (!shortUrl) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchLinkDetails = async () => {
      try {
        const res = await getLinkByShortUrl(shortUrl);

        if (isMounted) {
          setDetails(res.data);
        }
      } catch (error) {
        if (!isMounted) return;

        toast.error(
          error instanceof ApiError
            ? error.message
            : "Failed to load link details."
        );

        navigate("/links");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchLinkDetails();

    return () => {
      isMounted = false;
    };
  }, [shortUrl, navigate]);

  const fullShortUrl = details?.shortUrl
    ? `${BACKEND_BASE_URL}/${details.shortUrl}`
    : "";

  const formattedDate = details?.createdAt
    ? new Date(details.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  const handleCopy = async () => {
    if (!fullShortUrl) return;

    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopied(true);
      toast.success("Short URL copied");

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6">
        <div className="space-y-2">
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
          <div className="h-4 w-64 animate-pulse rounded-md bg-muted" />
        </div>

        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <Link2 className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />

        <h1 className="text-xl font-semibold">
          Link not found
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          The requested link could not be found.
        </p>

        <Button
          className="mt-6"
          variant="outline"
          onClick={() => navigate("/links")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Links
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 px-4 py-6 sm:px-6 lg:py-8">

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1 rounded-lg bg-blue-500/10 p-2">
            <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              {details.title || "Link Details"}
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              View and manage your short link.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="w-full sm:w-auto"
          onClick={() => navigate("/links")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Links
        </Button>
      </div>

      {/* Main Card */}
      <Card className="overflow-hidden shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="text-lg">
            Link Information
          </CardTitle>

          <CardDescription>
            Details about your shortened URL and its destination.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 p-4 sm:p-6">

          {/* Short URL */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Short URL
              </span>

              {formattedDate && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {formattedDate}
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-3 sm:flex-row sm:items-center sm:justify-between">
              <a
                href={fullShortUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-0 items-center gap-2 text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                <span className="truncate">
                  {fullShortUrl}
                </span>

                <ExternalLink className="h-4 w-4 shrink-0" />
              </a>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="w-full shrink-0 sm:w-auto"
              >
                {copied ? (
                  <Check className="mr-2 h-4 w-4" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}

                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Destination */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Destination URL
            </span>

            <a
              href={details.longUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start justify-between gap-3 rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
            >
              <span className="min-w-0 break-all font-mono text-sm text-foreground">
                {details.longUrl}
              </span>

              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
            </a>
          </div>

          {/* Title */}
          {details.title && (
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Title
              </span>

              <p className="rounded-lg border bg-muted/30 p-3 text-sm">
                {details.title}
              </p>
            </div>
          )}

          {/* Tags */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Tags
            </span>

            {details.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {details.tags.map((tag) => (
                  <span
                    key={tag.id || tag.name}
                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400"
                  >
                    <TagIcon className="h-3.5 w-3.5" />
                    {tag.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No tags added to this link.
              </p>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default LinkDetailsPage;