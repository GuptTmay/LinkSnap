import React, { useState, useEffect, useCallback } from "react";
import QRCode from "qrcode";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createLink, getLinks } from "@/api/links.api";
import { createQrCode, getQrCodes } from "@/api/qrcode.api";
import { QrCodeDialog } from "@/components/qrcode/QrCodeDialog";
import { Link2, QrCode as QrIcon, ArrowRight, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import type { ShortLink } from "@/types/link";

export const Home: React.FC = () => {
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

  // User Links & QRs State
  const [userLinks, setUserLinks] = useState<ShortLink[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);

  const fetchUserData = useCallback(async () => {
    setIsLoadingLinks(true);
    try {
      const [linksRes, qrsRes] = await Promise.all([getLinks(), getQrCodes()]);

      if (linksRes.ok) {
        const body = await linksRes.json();
        // console.log(body);
        setUserLinks(body.data.links);
      }

      if (qrsRes.ok) {
        // Fetched user QR codes
      }
    } catch {
      // Ignore errors silently on initial fetch
    } finally {
      setIsLoadingLinks(false);
    }
  }, []);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const validateUrl = (url: string): boolean => {
    if (!url || !url.trim()) return false;
    try {
      const parsed = new URL(url);
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleShortenSubmit = async (e: React.SubmitEvent) => {
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
      fetchUserData();
    } catch {
      toast.error("Unable to create short link.");
    } finally {
      setIsShortening(false);
    }
  };

  const handleQrSubmit = async (e: React.SubmitEvent) => {
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
      fetchUserData();
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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 mx-auto container max-w-4xl px-4 py-8 md:py-12 space-y-10">
        {/* Creation Card */}
        <section>
          <Card className="w-full shadow-md border-muted/60">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Create New Link & QR</CardTitle>
              <CardDescription>
                Shorten your URLs or generate QR codes for instant sharing.
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
                          href={createdLinkResult.shortUrl}
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
                        onClick={() => copyToClipboard(createdLinkResult.shortUrl, createdLinkResult.id || "latest")}
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
        </section>

        {/* Dashboard Links List */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight">Your Links</h2>

          {isLoadingLinks ? (
            <div className="text-center py-8 text-muted-foreground text-sm">Loading your links...</div>
          ) : userLinks.length === 0 ? (
            <Card className="text-center py-8 border-dashed">
              <CardContent>
                <p className="text-sm text-muted-foreground">You haven't created any links yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {userLinks.map((link) => (
                <Card key={link.id || link.shortUrl} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <a
                        href={link.shortUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-blue-600 hover:underline flex items-center gap-1 text-sm sm:text-base"
                      >
                        {link.shortUrl}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </div>
                    <p className="text-xs text-muted-foreground truncate max-w-md">
                      {link.longUrl || link.originalUrl || "Original URL"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(link.shortUrl, link.id || link.shortUrl)}
                    className="gap-1 shrink-0"
                  >
                    {copiedLinkId === (link.id || link.shortUrl) ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span>Copy</span>
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

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