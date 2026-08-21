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
import { Copy, Download, Check } from "lucide-react";
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
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
    link.download = "linksnap-qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("QR code downloaded");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">QR Code</DialogTitle>
          <DialogDescription className="text-center">
            {registrationFailed ? (
              <span className="text-destructive font-medium">
                QR generated locally, but registration with the backend failed.
              </span>
            ) : (
              "Scan or download your QR code encoding your short link."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-4 gap-4">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Generated QR Code"
              className="h-48 w-48 rounded-lg border bg-white p-2 shadow-sm"
            />
          ) : (
            <div className="h-48 w-48 animate-pulse rounded-lg bg-muted flex items-center justify-center">
              Generating...
            </div>
          )}

          <div className="flex w-full items-center gap-2">
            <input
              type="text"
              readOnly
              value={shortUrl}
              className="flex-1 text-xs sm:text-sm font-mono px-3 py-2 border rounded-md bg-muted/40 text-foreground text-ellipsis"
            />
            <Button size="sm" variant="outline" onClick={handleCopy} className="gap-1">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only sm:not-sr-only">Copy</span>
            </Button>
          </div>
        </div>

        <DialogFooter className="sm:justify-between flex-row gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 sm:flex-none"
          >
            Close
          </Button>
          <Button
            type="button"
            onClick={handleDownload}
            disabled={!qrDataUrl}
            className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Download</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
