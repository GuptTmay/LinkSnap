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
  Copy,
  Check,
} from "lucide-react";
import { deleteLinks, getLinkByShortUrl } from "@/api/links.api";
import { ApiError } from "@/types/error";
import type { LinkWithRelations } from "@/types/api";
import { toast } from "sonner";
import { AnalyticsSection } from "@/components/analytics/AnalyticsSection";

export const LinkDetailsPage: React.FC = () => {
  const { shortUrl } = useParams<{ shortUrl: string }>();
  const navigate = useNavigate();

  const [details, setDetails] = useState<LinkWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(!!shortUrl);
  const [copied, setCopied] = useState(false);

  const BACKEND_BASE_URL =
    import.meta.env.VITE_BACKEND_BASE_URL || "";

  useEffect(() => {
    if (!shortUrl) return;

    let isMounted = true;

    const fetchDetails = async () => {
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

    fetchDetails();

    return () => {
      isMounted = false;
    };
  }, [shortUrl, navigate]);

  const fullShortUrl = details?.shortUrl
    ? `${BACKEND_BASE_URL}/${details.shortUrl}`
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

  const handleEdit = () => {
    if (details?.shortUrl) {
      navigate(`/links/${details.shortUrl}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!details?.id) return;

    try {
      const res = await deleteLinks(details.id);

      toast.success(res.message || "Link deleted successfully");
      navigate("/links");
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to delete link."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-72 animate-pulse rounded bg-muted" />
        </div>

        <Card>
          <CardContent className="space-y-6 p-6">
            <div className="h-6 w-48 animate-pulse rounded bg-muted" />
            <div className="h-12 animate-pulse rounded bg-muted" />
            <div className="h-20 animate-pulse rounded bg-muted" />
            <div className="h-12 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <Link2 className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />

          <h1 className="text-xl font-semibold">
            Link not found
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            The requested link could not be found.
          </p>

          <Button
            className="mt-6"
            variant="outline"
            onClick={() => navigate("/links")}
          >
            Back to Links
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Link2 className="h-5 w-5 text-primary" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Link Details
          </h1>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage your shortened link and view its analytics.
        </p>
      </div>

      {/* Link Information */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <ExternalLink className="h-5 w-5 text-primary" />
            </div>

            <div>
              <CardTitle className="text-lg">
                {details.title || details.shortUrl}
              </CardTitle>

              <CardDescription>
                Information about your shortened link.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-5 sm:p-6">
          {/* Short URL */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Short URL
            </p>

            <div className="mt-2 flex items-center gap-2 rounded-lg border bg-muted/30 p-2">
              <a
                href={fullShortUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 truncate px-1 text-sm font-medium text-primary hover:underline"
              >
                {fullShortUrl}
              </a>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopy}
                className="shrink-0 gap-1.5"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}

                <span className="hidden sm:inline">
                  {copied ? "Copied" : "Copy"}
                </span>
              </Button>
            </div>
          </div>

          {/* Destination */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Destination URL
            </p>

            <a
              href={details.longUrl}
              target="_blank"
              rel="noreferrer"
              className="group mt-2 flex items-start gap-2 rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
            >
              <span className="flex-1 break-all font-mono text-sm text-muted-foreground group-hover:text-foreground">
                {details.longUrl}
              </span>

              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
            </a>
          </div>

          {/* Title */}
          {details.title && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Title
              </p>

              <p className="mt-2 rounded-lg border bg-muted/30 p-3 text-sm">
                {details.title}
              </p>
            </div>
          )}

          {/* Tags */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Tags
            </p>

            {details.tags?.length ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {details.tags.map((tag) => (
                  <span
                    key={tag.id || tag.name}
                    className="inline-flex items-center gap-1.5 rounded-full border bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary"
                  >
                    <TagIcon className="h-3 w-3" />
                    {tag.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                No tags added to this link.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={() => navigate("/links")}
              className="w-full sm:w-auto"
            >
              Back to Links
            </Button>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="flex-1 sm:flex-none"
              >
                Edit
              </Button>

              <Button
                variant="destructive"
                onClick={handleDelete}
                className="flex-1 sm:flex-none"
              >
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics */}
      <AnalyticsSection
        linkId={details.id}
        mode="link"
      />
    </div>
  );
};

export default LinkDetailsPage;