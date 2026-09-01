import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import QRCode from "qrcode";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  ExternalLink,
  Tag as TagIcon,
  Download,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { getLinkByShortUrl } from "@/api/links.api";
import { ApiError } from "@/types/error";
import type { LinkWithRelations } from "@/types/api";

export const QrCodeDetailsPage: React.FC = () => {
  const { shortUrl } = useParams<{ shortUrl: string }>();
  const navigate = useNavigate();

  const [details, setDetails] = useState<LinkWithRelations | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

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
          toast.error("Failed to load QR code details.");
        }

        navigate("/qrcodes");
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

  const fullShortUrl = details?.shortUrl
    ? `${BACKEND_BASE_URL}/${details.shortUrl}`
    : "";

  useEffect(() => {
    if (!fullShortUrl) return;

    QRCode.toDataURL(fullShortUrl, {
      width: 320,
      margin: 2,
    })
      .then(setQrDataUrl)
      .catch(() => {
        toast.error("Failed to render QR Code image.");
      });
  }, [fullShortUrl]);

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `linksnap-qrcode-${details?.shortUrl || "download"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success("QR Code image downloaded!");
  };

  const handleCopy = async () => {
    if (!fullShortUrl) return;

    try {
      await navigator.clipboard.writeText(fullShortUrl);

      setCopied(true);
      toast.success("Short URL copied to clipboard!");

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            QR Code Details
          </h1>
          <p className="text-sm text-muted-foreground">
            Loading QR code details...
          </p>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            QR Code Details
          </h1>
          <p className="text-sm text-muted-foreground">
            No QR code details available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <QrCode className="h-5 w-5 text-primary" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            QR Code Details
          </h1>
        </div>

        <p className="mt-2 text-sm text-muted-foreground">
          Manage and download the QR code for your shortened link.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid w-full grid-cols-1 gap-6 lg:grid-cols-[minmax(320px,400px)_minmax(0,1fr)]">
        {/* QR Preview */}
        <Card className="overflow-hidden border-border/60 shadow-sm">
          <div className="bg-gradient-to-br from-primary/5 via-background to-primary/10">
            <CardHeader className="text-center">
              <CardTitle className="text-lg">Your QR Code</CardTitle>
              <CardDescription>
                Scan to instantly open your destination
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col items-center gap-6 pb-7">
              <div className="relative w-full max-w-[300px]">
                <div className="absolute -inset-2 rounded-2xl bg-primary/5 blur-xl" />

                <div className="relative aspect-square w-full rounded-2xl border bg-white p-4 shadow-md">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt={`QR Code for ${fullShortUrl}`}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-xl bg-muted">
                      <div className="text-center">
                        <QrCode className="mx-auto mb-2 h-8 w-8 animate-pulse text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Generating QR Code...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button
                type="button"
                onClick={handleDownload}
                disabled={!qrDataUrl}
                className="w-full max-w-[300px] gap-2"
                size="lg"
              >
                <Download className="h-4 w-4" />
                Download QR Code
              </Button>
            </CardContent>
          </div>
        </Card>

        {/* Link Details */}
        <Card className="min-w-0 border-border/60 shadow-sm">
          <CardHeader className="border-b bg-muted/20">
            <div className="flex min-w-0 items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <ExternalLink className="h-5 w-5 text-primary" />
              </div>

              <div className="min-w-0">
                <CardTitle className="truncate text-lg">
                  {details.title || details.shortUrl}
                </CardTitle>

                <CardDescription className="mt-1">
                  Link information and details
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-6">
            {/* Short URL */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Short URL
                </span>
              </div>

              <div className="flex min-w-0 items-center gap-2 rounded-xl border bg-muted/30 p-2 transition-colors hover:bg-muted/50">
                <a
                  href={fullShortUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-1.5 px-1 text-sm font-semibold text-primary hover:underline"
                >
                  <span className="min-w-0 truncate">
                    {fullShortUrl}
                  </span>

                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                  className="shrink-0 gap-1.5 rounded-lg"
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
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Destination URL
              </span>

              <a
                href={details.longUrl}
                target="_blank"
                rel="noreferrer"
                className="group mt-2 flex items-start gap-2 rounded-xl border bg-muted/30 p-3 text-sm transition-colors hover:bg-muted/50"
              >
                <span className="min-w-0 flex-1 break-all font-mono text-muted-foreground group-hover:text-foreground">
                  {details.longUrl}
                </span>

                <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
              </a>
            </div>

            {/* Title */}
            {details.title && (
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Title
                </span>

                <p className="mt-2 rounded-xl border bg-muted/30 p-3 text-sm">
                  {details.title}
                </p>
              </div>
            )}

            {/* Tags */}
            {details.tags && details.tags.length > 0 && (
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Tags
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {details.tags.map((tag) => (
                    <span
                      key={tag.id || tag.name}
                      className="inline-flex max-w-full items-center gap-1.5 rounded-full border bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary"
                    >
                      <TagIcon className="h-3 w-3 shrink-0" />

                      <span className="truncate">
                        {tag.name}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                onClick={() => navigate("/qrcodes")}
                className="w-full sm:w-auto"
              >
                Back to QR Codes
              </Button>

              <Button
                onClick={handleDownload}
                disabled={!qrDataUrl}
                className="w-full gap-2 sm:w-auto"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QrCodeDetailsPage;