import React, { useState } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createLink } from "@/api/links.api";
import { createQrCode } from "@/api/qrcode.api";
import { QrCodeDialog } from "@/components/qrcode/QrCodeDialog";
import { Link2, QrCode as QrIcon, ArrowRight, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { ShortLink } from "@/types/link";

export const Home: React.FC = () => {
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
  const [shortUrlInput, setShortUrlInput] = useState("");
  const [qrUrlInput, setQrUrlInput] = useState("");
  
  const [isShortening, setIsShortening] = useState(false);
  const [isQrProcessing, setIsQrProcessing] = useState(false);
  
  const [shortError, setShortError] = useState("");
  const [qrError, setQrError] = useState("");

  const [createdLinkResult, setCreatedLinkResult] = useState<ShortLink | null>(null);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogShortUrl, setDialogShortUrl] = useState("");
  const [dialogQrDataUrl, setDialogQrDataUrl] = useState("");
  const [dialogRegFailed, setDialogRegFailed] = useState(false);

  const validateUrl = (url: string): boolean => {
    if (!url || !url.trim()) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleShortenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShortError("");

    if (!shortUrlInput.trim()) {
      setShortError("Please enter a URL");
      return;
    }

    if (!validateUrl(shortUrlInput.trim())) {
      setShortError("Please enter a valid URL (starting with http:// or https://)");
      return;
    }

    setIsShortening(true);

    try {
      const res = await createLink(shortUrlInput.trim());
      const body = await res.json();

      if (!res.ok || !body.success) {
        toast.error("Unable to create short link.");
        setShortError(body.message || "Unable to create short link.");
        return;
      }

      const linkData: ShortLink = body.data;
      setCreatedLinkResult(linkData);
      toast.success("Short link created successfully!");
      setShortUrlInput("");
    } catch {
      toast.error("Unable to create short link.");
    } finally {
      setIsShortening(false);
    }
  };

  const handleQrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setQrError("");

    if (!qrUrlInput.trim()) {
      setQrError("Please enter a URL");
      return;
    }

    if (!validateUrl(qrUrlInput.trim())) {
      setQrError("Please enter a valid URL (starting with http:// or https://)");
      return;
    }

    setIsQrProcessing(true);
    setDialogRegFailed(false);

    try {
      // Step 1: Create short link
      const res = await createLink(qrUrlInput.trim());
      const body = await res.json();

      if (!res.ok || !body.success) {
        toast.error("Unable to create short link.");
        setQrError("Unable to create short link.");
        setIsQrProcessing(false);
        return;
      }

      const linkId = body.data.linkId || body.data.id;
      const shortUrl = body.data.shortUrl;

      // Step 2: Generate QR code locally using qrcode package
      let dataUrl = "";
      try {
        dataUrl = await QRCode.toDataURL(shortUrl, { width: 300, margin: 2 });
      } catch {
        toast.error("Failed to generate QR code image.");
        setIsQrProcessing(false);
        return;
      }

      setDialogShortUrl(shortUrl);
      setDialogQrDataUrl(dataUrl);

      // Step 3: Register QR code with backend
      try {
        const qrRes = await createQrCode(linkId, {});
        if (!qrRes.ok) {
          setDialogRegFailed(true);
          toast.error("Unable to register QR code with server.");
        } else {
          toast.success("QR code created and registered!");
        }
      } catch {
        setDialogRegFailed(true);
        toast.error("Unable to register QR code.");
      }

      setDialogOpen(true);
      setQrUrlInput("");
    } catch {
      toast.error("Unable to create QR code.");
    } finally {
      setIsQrProcessing(false);
    }
  };

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLinkId(id);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedLinkId(null), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Quickly create short links or QR codes.
        </p>
      </div>

      {/* Creation Card */}
      <Card className="w-full shadow-md border-muted/60">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Quick Create</CardTitle>
          <CardDescription>
            Shorten your URLs or generate QR codes instantly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="short-link" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="short-link" className="flex items-center gap-2">
                <Link2 className="h-4 w-4" />
                <span>Short Link</span>
              </TabsTrigger>
              <TabsTrigger value="qr-code" className="flex items-center gap-2">
                <QrIcon className="h-4 w-4" />
                <span>QR Code</span>
              </TabsTrigger>
            </TabsList>

            {/* Short Link Form */}
            <TabsContent value="short-link">
              <form onSubmit={handleShortenSubmit} className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="url"
                      placeholder="https://example.com/long-url"
                      value={shortUrlInput}
                      onChange={(e) => {
                        setShortUrlInput(e.target.value);
                        if (shortError) setShortError("");
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={isShortening}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                      <span>{isShortening ? "Creating..." : "Shorten URL"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  {shortError && <p className="text-xs text-destructive">{shortError}</p>}
                </div>
              </form>

              {/* Created Short Link Display */}
              {createdLinkResult && (
                <div className="mt-4 p-4 rounded-lg border bg-muted/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="overflow-hidden w-full">
                    <p className="text-xs text-muted-foreground font-medium">Shortened URL</p>
                    <a
                      href={`${BACKEND_BASE_URL}/${createdLinkResult.shortUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1 truncate"
                    >
                      {createdLinkResult.shortUrl}
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`${BACKEND_BASE_URL}/${createdLinkResult.shortUrl}`, createdLinkResult.id || "latest")}
                    className="shrink-0 gap-1 w-full sm:w-auto"
                  >
                    {copiedLinkId === (createdLinkResult.id || "latest") ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span>Copy</span>
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* QR Code Form */}
            <TabsContent value="qr-code">
              <form onSubmit={handleQrSubmit} className="space-y-4">
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      type="url"
                      placeholder="https://example.com/long-url"
                      value={qrUrlInput}
                      onChange={(e) => {
                        setQrUrlInput(e.target.value);
                        if (qrError) setQrError("");
                      }}
                      className="flex-1"
                    />
                    <Button
                      type="submit"
                      disabled={isQrProcessing}
                      className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                    >
                      <span>{isQrProcessing ? "Generating..." : "Generate QR Code"}</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                  {qrError && <p className="text-xs text-destructive">{qrError}</p>}
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* QR Code Dialog */}
      <QrCodeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        shortUrl={dialogShortUrl}
        qrDataUrl={dialogQrDataUrl}
        registrationFailed={dialogRegFailed}
      />
    </div>
  );
};

export default Home;