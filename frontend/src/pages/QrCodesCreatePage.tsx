import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createLink } from "@/api/links.api";
import { ApiError } from "@/types/error";
import {
  QrCode,
  ArrowRight,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import type {
  CreateLinkPayload,
  CreateLinkResponse,
  Tag,
} from "@/types/api";
import { TagComboboxMultiple } from "@/components/TagComboboxMultiple";

export const QrCodesCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [longUrl, setLongUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);

  const [longUrlError, setLongUrlError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setLongUrlError("");

    const trimmedLongUrl = longUrl.trim();
    const trimmedTitle = title.trim();

    if (!trimmedLongUrl) {
      setLongUrlError("Destination URL is required.");
      return;
    }

    try {
      new URL(trimmedLongUrl);
    } catch {
      setLongUrlError(
        "Please enter a valid URL, such as https://example.com"
      );
      return;
    }

    setIsSubmitting(true);

    const payload: CreateLinkPayload = {
      longUrl: trimmedLongUrl,
      ...(trimmedTitle && { title: trimmedTitle }),
      ...(tags.length > 0 && {
        tags: tags.map((tag) => tag.name),
      }),
      customization: {},
    };

    try {
      const res: CreateLinkResponse = await createLink(payload);

      toast.success(res.message || "QR Code generated successfully!");
      navigate(`/qrcodes/${res.data.shortUrl}/details`);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to generate QR Code. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:py-10">
      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border bg-indigo-500/5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" />
          Create a QR code
        </div>

        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Create QR Code
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Generate a trackable QR code for your destination URL with an
          optional title and tags.
        </p>
      </div>

      {/* Form Card */}
      <Card className="overflow-hidden border-muted/60 shadow-sm">
        <CardHeader className="border-b bg-muted/10 px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10">
              <QrCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>

            <div className="min-w-0">
              <CardTitle className="text-lg sm:text-xl">
                QR Code Details
              </CardTitle>

              <CardDescription className="mt-1 leading-5">
                Add your destination and organize your QR code with optional
                information.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 py-6 sm:px-7 sm:py-8">
          <form
            className="space-y-7"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
          >
            {/* Destination URL */}
            <div className="space-y-2">
              <Label
                htmlFor="long-url"
                className="text-sm font-semibold"
              >
                Destination URL{" "}
                <span className="text-destructive">*</span>
              </Label>

              <div className="relative">
                <Input
                  id="long-url"
                  type="url"
                  placeholder="https://example.com/my-destination"
                  value={longUrl}
                  onChange={(e) => {
                    setLongUrl(e.target.value);

                    if (longUrlError) {
                      setLongUrlError("");
                    }
                  }}
                  className={`h-11 ${
                    longUrlError
                      ? "border-destructive focus-visible:ring-destructive"
                      : ""
                  }`}
                  aria-invalid={!!longUrlError}
                />

                {longUrl && !longUrlError && (
                  <CheckCircle2 className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                )}
              </div>

              {longUrlError ? (
                <p className="text-xs font-medium text-destructive">
                  {longUrlError}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  The QR code will redirect visitors to this URL.
                </p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="title"
                  className="text-sm font-semibold"
                >
                  Title{" "}
                  <span className="font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </Label>

                <span className="text-xs text-muted-foreground">
                  {title.length}/64
                </span>
              </div>

              <Input
                id="title"
                type="text"
                maxLength={64}
                placeholder="e.g. Product QR Code"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11"
              />

              <p className="text-xs text-muted-foreground">
                Give your QR code a recognizable name for easier management.
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Tags{" "}
                <span className="font-normal text-muted-foreground">
                  (Optional)
                </span>
              </Label>

              <TagComboboxMultiple
                selectedTags={tags}
                setSelectedTags={setTags}
              />

              <p className="text-xs text-muted-foreground">
                Use tags to organize and filter your QR codes later.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/home")}
                disabled={isSubmitting}
                className="h-11 w-full sm:w-auto"
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full gap-2 bg-indigo-600 px-6 text-white hover:bg-indigo-700 sm:w-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    Generate QR Code
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Hint */}
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Your QR code will be linked to a trackable LinkSnap URL.
      </p>
    </div>
  );
};

export default QrCodesCreatePage;