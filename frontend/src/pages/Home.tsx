import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createLink } from "@/api/links.api";
import { createQrCode } from "@/api/qrcode.api";
import { QrCodeDialog } from "@/components/qrcode/QrCodeDialog";
import {
  Link2,
  QrCode as QrIcon,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { ApiError } from "@/types/error";
import { toast } from "sonner";
import type { CreateLinkResponse, Link } from "@/types/api";

export const Home: React.FC = () => {
  const navigate = useNavigate();

  const BACKEND_BASE_URL =
    import.meta.env.VITE_BACKEND_BASE_URL || "";

  const [shortUrlInput, setShortUrlInput] = useState("");
  const [qrUrlInput, setQrUrlInput] = useState("");

  const [isShortening, setIsShortening] = useState(false);
  const [isQrProcessing, setIsQrProcessing] = useState(false);

  const [shortError, setShortError] = useState("");
  const [qrError, setQrError] = useState("");

  const [createdLinkResult, setCreatedLinkResult] =
    useState<Link | null>(null);

  const [copiedLinkId, setCopiedLinkId] =
    useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogShortUrl, setDialogShortUrl] = useState("");
  const [dialogQrDataUrl, setDialogQrDataUrl] = useState("");
  const [dialogRegFailed, setDialogRegFailed] = useState(false);

  const validateUrl = (url: string): boolean => {
    if (!url.trim()) return false;

    try {
      const parsed = new URL(url);
      return (
        parsed.protocol === "http:" ||
        parsed.protocol === "https:"
      );
    } catch {
      return false;
    }
  };

  const handleShortenSubmit = async (
    e: React.SubmitEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setShortError("");

    const url = shortUrlInput.trim();

    if (!url) {
      setShortError("Destination URL is required");
      return;
    }

    if (!validateUrl(url)) {
      setShortError(
        "Please enter a valid URL (e.g. https://example.com)"
      );
      return;
    }

    setIsShortening(true);

    try {
      const body: CreateLinkResponse = await createLink({
        longUrl: url,
      });

      setCreatedLinkResult(body.data);
      setShortUrlInput("");

      toast.success(body.message);
    } catch (err) {
      if (err instanceof ApiError) {
        setShortError(err.message);
        toast.error(err.message);
      } else {
        toast.error("Unable to create short link.");
      }
    } finally {
      setIsShortening(false);
    }
  };

  const handleQrSubmit = async (
    e: React.SubmitEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setQrError("");
    setDialogRegFailed(false);

    const url = qrUrlInput.trim();

    if (!url) {
      setQrError("Destination URL is required");
      return;
    }

    if (!validateUrl(url)) {
      setQrError(
        "Please enter a valid URL (e.g. https://example.com)"
      );
      return;
    }

    setIsQrProcessing(true);

    try {
      // Create short link
      const body = await createLink({
        longUrl: url,
      });

      const linkId = body.data.id;
      const shortUrl = body.data.shortUrl;
      const fullShortUrl = `${BACKEND_BASE_URL}/${shortUrl}`;

      // Generate QR locally
      const dataUrl = await QRCode.toDataURL(
        fullShortUrl,
        {
          width: 500,
          margin: 2,
          errorCorrectionLevel: "H",
        }
      );

      setDialogShortUrl(shortUrl);
      setDialogQrDataUrl(dataUrl);

      // Register QR with backend
      try {
        await createQrCode(linkId, {});
        toast.success("QR code created successfully!");
      } catch (err) {
        setDialogRegFailed(true);

        if (err instanceof ApiError) {
          toast.error(err.message);
        } else {
          toast.error(
            "Unable to register QR code with server."
          );
        }
      }

      setDialogOpen(true);
      setQrUrlInput("");
    } catch (err) {
      if (err instanceof ApiError) {
        setQrError(err.message);
        toast.error(err.message);
      } else {
        toast.error("Unable to create QR code.");
      }
    } finally {
      setIsQrProcessing(false);
    }
  };

  const copyToClipboard = async (
    url: string,
    id: string
  ) => {
    try {
      await navigator.clipboard.writeText(url);

      setCopiedLinkId(id);
      toast.success("Copied to clipboard");

      setTimeout(() => {
        setCopiedLinkId(null);
      }, 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 sm:px-6 lg:py-8">
      {/* Header */}
      <section className="text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Link management made simple
        </div>

        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Create a link in seconds
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Shorten URLs and generate QR codes from one clean,
          simple workspace.
        </p>
      </section>

      {/* Main Creation Card */}
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardHeader className="border-b bg-muted/20 px-4 py-5 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl">
            Quick Create
          </CardTitle>

          <CardDescription className="text-sm">
            Choose what you want to create.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <Tabs
            defaultValue="short-link"
            className="w-full"
          >
            <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl">
              <TabsTrigger
                value="short-link"
                className="gap-2 rounded-lg text-sm sm:text-base"
              >
                <Link2 className="h-4 w-4" />
                Short Link
              </TabsTrigger>

              <TabsTrigger
                value="qr-code"
                className="gap-2 rounded-lg text-sm sm:text-base"
              >
                <QrIcon className="h-4 w-4" />
                QR Code
              </TabsTrigger>
            </TabsList>

            {/* Short Link */}
            <TabsContent
              value="short-link"
              className="mt-6"
            >
              <form
                onSubmit={handleShortenSubmit}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Destination URL
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      type="url"
                      autoComplete="off" 
                      value={shortUrlInput}
                      placeholder="https://example.com/your-long-url"
                      onChange={(e) => {
                        setShortUrlInput(e.target.value);

                        if (shortError) {
                          setShortError("");
                        }
                      }}
                      className="h-11 flex-1"
                    />

                    <Button
                      type="submit"
                      disabled={isShortening}
                      size="lg"
                      className="h-11 gap-2 sm:min-w-[150px]"
                    >
                      {isShortening
                        ? "Creating..."
                        : "Shorten URL"}

                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {shortError && (
                    <p className="text-sm text-destructive">
                      {shortError}
                    </p>
                  )}
                </div>
              </form>

              {/* Created Link */}
              {createdLinkResult && (
                <div className="mt-6 rounded-xl border bg-muted/30 p-4 sm:p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Your shortened URL
                      </p>

                      <a
                        href={`${BACKEND_BASE_URL}/${createdLinkResult.shortUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 flex min-w-0 items-center gap-1.5 text-sm font-semibold text-primary hover:underline sm:text-base"
                      >
                        <span className="min-w-0 truncate">
                          {`${BACKEND_BASE_URL}/${createdLinkResult.shortUrl}`}
                        </span>

                        <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                      </a>
                    </div>

                    <div className="flex w-full gap-2 sm:w-auto">
                      <Button
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(
                            `${BACKEND_BASE_URL}/${createdLinkResult.shortUrl}`,
                            createdLinkResult.id
                          )
                        }
                        className="flex-1 gap-2 sm:flex-none"
                      >
                        {copiedLinkId ===
                        createdLinkResult.id ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}

                        {copiedLinkId ===
                        createdLinkResult.id
                          ? "Copied"
                          : "Copy"}
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() =>
                          navigate(
                            `/links/${createdLinkResult.shortUrl}/details`
                          )
                        }
                        className="flex-1 sm:flex-none"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* QR Code */}
            <TabsContent
              value="qr-code"
              className="mt-6"
            >
              <form
                onSubmit={handleQrSubmit}
                className="space-y-5"
              >
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Destination URL
                  </label>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                      type="url"
                      value={qrUrlInput}
                      autoComplete="off" 
                      placeholder="https://example.com/your-long-url"
                      onChange={(e) => {
                        setQrUrlInput(e.target.value);

                        if (qrError) {
                          setQrError("");
                        }
                      }}
                      className="h-11 flex-1"
                    />

                    <Button
                      type="submit"
                      disabled={isQrProcessing}
                      size="lg"
                      className="h-11 gap-2 sm:min-w-[170px]"
                    >
                      {isQrProcessing
                        ? "Generating..."
                        : "Generate QR Code"}

                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>

                  {qrError && (
                    <p className="text-sm text-destructive">
                      {qrError}
                    </p>
                  )}
                </div>

                <div className="rounded-xl border border-dashed bg-muted/20 p-4 text-center sm:p-6">
                  <QrIcon className="mx-auto h-8 w-8 text-muted-foreground" />

                  <p className="mt-2 text-sm font-medium">
                    Generate a QR code instantly
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Your QR code will use your LinkSnap short URL.
                  </p>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

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