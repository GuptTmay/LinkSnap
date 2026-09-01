import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check, QrCode } from "lucide-react";
import { toast } from "sonner";

interface QrCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortUrl: string;
  qrDataUrl: string;
  registrationFailed?: boolean;
}

export const QrCodeDialog: React.FC<QrCodeDialogProps> = ({
  open,
  onOpenChange,
  shortUrl,
  qrDataUrl,
  registrationFailed = false,
}) => {
  const [copied, setCopied] = useState(false);

  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "";
  const fullShortUrl = `${BACKEND_BASE_URL}/${shortUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullShortUrl);
      setCopied(true);
      toast.success("Short URL copied to clipboard");

      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;

    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = `linksnap-${shortUrl}.png`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("QR code downloaded");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg overflow-hidden rounded-2xl p-0">
        {/* Header */}
        <DialogHeader className="border-b bg-muted/20 px-5 py-5 text-center sm:px-7">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <QrCode className="h-6 w-6" />
          </div>

          <DialogTitle className="text-xl font-bold sm:text-2xl">
            Your QR Code is Ready
          </DialogTitle>

          <DialogDescription className="mx-auto max-w-sm text-sm">
            Scan this QR code to open your shortened link.
          </DialogDescription>

          {registrationFailed && (
            <p className="mt-2 text-xs font-medium text-destructive">
              QR generated locally, but registration with the backend failed.
            </p>
          )}
        </DialogHeader>

        {/* QR Section */}
        <div className="flex flex-col items-center px-5 py-6 sm:px-7 sm:py-8">
          <div className="rounded-2xl border bg-white p-3 shadow-md sm:p-4">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Generated QR Code"
                className="h-60 w-60 object-contain sm:h-72 sm:w-72"
              />
            ) : (
              <div className="flex h-60 w-60 items-center justify-center rounded-xl bg-muted text-sm text-muted-foreground animate-pulse sm:h-72 sm:w-72">
                Generating QR code...
              </div>
            )}
          </div>

          {/* URL */}
          <div className="mt-6 w-full">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Short URL
            </p>

            <div className="flex w-full items-center gap-2 rounded-xl border bg-muted/30 p-1.5">
              <div className="min-w-0 flex-1 px-2">
                <p className="truncate font-mono text-sm font-medium text-foreground sm:text-base">
                  {fullShortUrl}
                </p>
              </div>

              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleCopy}
                className="shrink-0 gap-1.5 rounded-lg"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="flex-col gap-2 border-t bg-muted/10 px-5 py-4 sm:flex-row sm:justify-between sm:px-7">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto"
          >
            Close
          </Button>

          <Button
            type="button"
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="w-full gap-2 bg-blue-600 text-white hover:bg-blue-700 sm:w-auto"
          >
            <Download className="h-4 w-4" />
            Download QR Code
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};