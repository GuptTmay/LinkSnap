import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, ExternalLink, Tag as TagIcon } from "lucide-react";
import { getLinkByShortUrl } from "@/api/links.api";
import { ApiError } from "@/types/error";
import type { LinkWithRelations } from "@/types/api";
import { toast } from "sonner";

export const LinkDetailsPage: React.FC = () => {
  const { shortUrl } = useParams<{ shortUrl: string }>();
  const navigate = useNavigate();
  const [details, setDetails] = useState<LinkWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!shortUrl) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchLinkDetails = async () => {
      try {
        setIsLoading(true);
        const res = await getLinkByShortUrl(shortUrl);
        if (isMounted) {
          setDetails(res.data);
        }
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
          setIsLoading(false);
        }
      }
    };

    fetchLinkDetails();

    return () => {
      isMounted = false;
    };
  }, [shortUrl, navigate]);

  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "";
  const fullShortUrl = details?.shortUrl ? `${BACKEND_BASE_URL}/${details.shortUrl}` : "";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Link Details</h1>
          <p className="text-sm text-muted-foreground">Loading link details...</p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Link Details</h1>
          <p className="text-sm text-muted-foreground">No link details available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Link Details</h1>
        <p className="text-sm text-muted-foreground">
          View details of your created short link.
        </p>
      </div>

      <Card className="max-w-2xl shadow-sm border-muted/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>{details.title || details.shortUrl || "Short Link Details"}</CardTitle>
          </div>
          <CardDescription>
            Overview of the short link details.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Short URL
            </span>
            <div className="mt-1 flex items-center gap-2">
              <a
                href={fullShortUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className="text-base font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                {details.shortUrl ? details.shortUrl : "N/A"}
                <ExternalLink className="h-4 w-4 shrink-0" />
              </a>
            </div>
          </div>

          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Destination URL (Long URL)
            </span>
            <p className="mt-1 text-sm font-mono bg-muted/40 p-2.5 rounded-md border break-all">
              {details.longUrl || "N/A"}
            </p>
          </div>

          {details.title && (
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Title
              </span>
              <p className="mt-1 text-sm text-foreground">{details.title}</p>
            </div>
          )}

          {details.tags && details.tags.length > 0 && (
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Tags
              </span>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {details.tags.map((tag) => (
                  <span
                    key={tag.id || tag.name}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-medium"
                  >
                    <TagIcon className="h-3 w-3" />
                    {tag.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4 border-t flex gap-3">
            <Button variant="outline" size="sm" onClick={() => navigate("/links")}>
              Back to Links
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkDetailsPage;
