import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QrCode, ExternalLink, Tag as TagIcon, Download, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface QrCodeDetailsState {
  shortUrl?: string;
  longUrl?: string;
  title?: string;
  tags?: string[];
}

export const QrCodeDetailsPage: React.FC = () => {
  const { shortUrl } = useParams<{ shortUrl: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const stateData = (location.state as QrCodeDetailsState) || {};
  const details: QrCodeDetailsState = {
    shortUrl: shortUrl || stateData.shortUrl || "",
    longUrl: stateData.longUrl || "",
    title: stateData.title || "",
    tags: stateData.tags || [],
  };

  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "";
  const fullShortUrl = details.shortUrl
    ? `${BACKEND_BASE_URL}/${details.shortUrl}`
    : "";

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Generate QR Code image client-side
  useEffect(() => {
    if (!fullShortUrl) return;

    QRCode.toDataURL(fullShortUrl, { width: 320, margin: 2 })
      .then((url) => setQrDataUrl(url))
      .catch(() => toast.error("Failed to render QR Code image."));
  }, [fullShortUrl]);

  // Handle Download QR PNG
  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `linksnap-qrcode-${details.shortUrl || "download"}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success("QR Code image downloaded!");
  };

  // Handle Copy Short URL
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">QR Code Details</h1>
        <p className="text-sm text-muted-foreground">
          View and download your generated QR Code.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        {/* Scannable QR Code Image Card */}
        <Card className="shadow-sm border-muted/60 flex flex-col items-center justify-center p-6 text-center">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold">Scannable QR Code</CardTitle>
            <CardDescription>
              Scan with any mobile device camera to open destination.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 w-full">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for ${fullShortUrl}`}
                className="h-64 w-64 rounded-xl border bg-white p-3 shadow-sm"
              />
            ) : (
              <div className="h-64 w-64 rounded-xl bg-muted flex items-center justify-center text-sm text-muted-foreground animate-pulse">
                Generating QR Code...
              </div>
            )}

            <Button
              type="button"
              onClick={handleDownload}
              disabled={!qrDataUrl}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 w-full max-w-xs"
            >
              <Download className="h-4 w-4" />
              <span>Download QR Code</span>
            </Button>
          </CardContent>
        </Card>

        {/* Link & QR Configuration Details */}
        <Card className="shadow-sm border-muted/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle>{details.title || details.shortUrl || "QR Code Details"}</CardTitle>
            </div>
            <CardDescription>
              Overview of short URL and target details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Short URL
              </span>
              <div className="mt-1 flex items-center justify-between gap-2 bg-muted/40 p-2.5 rounded-md border">
                <a
                  href={fullShortUrl || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 truncate"
                >
                  {fullShortUrl || "N/A"}
                  <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                </a>
                <Button size="sm" variant="ghost" onClick={handleCopy} className="h-8 px-2 gap-1 shrink-0">
                  {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span className="text-xs">{copied ? "Copied" : "Copy"}</span>
                </Button>
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
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-medium"
                    >
                      <TagIcon className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 border-t flex gap-3">
              <Button variant="outline" size="sm" onClick={() => navigate("/qrcodes")}>
                Back to QR Codes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QrCodeDetailsPage;
