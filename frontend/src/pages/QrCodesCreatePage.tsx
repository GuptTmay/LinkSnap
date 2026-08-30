import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createLink } from "@/api/links.api";
import { ApiError } from "@/types/error";
import { QrCode, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { CreateLinkPayload, CreateLinkResponse, Tag } from "@/types/api";
import { TagComboboxMultiple } from "@/components/TagComboboxMultiple";

export const QrCodesCreatePage: React.FC = () => {
  const navigate = useNavigate();

  // Form State
  const [longUrl, setLongUrl] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);

  // Validation & Loading States
  const [longUrlError, setLongUrlError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Submit Handler
  const handleSubmit = async () => {
    setLongUrlError("");

    const trimmedLongUrl = longUrl.trim();
    const trimmedTitle = title.trim();

    // Validate URL
    if (!trimmedLongUrl) {
      setLongUrlError("Destination URL is required");
      return;
    }

    try {
      new URL(trimmedLongUrl);
    } catch {
      setLongUrlError("Please enter a valid URL (e.g. https://example.com)");
      return;
    }

    setIsSubmitting(true);

    const payload: CreateLinkPayload = {
      longUrl: trimmedLongUrl,
      ...(trimmedTitle && { title: trimmedTitle }),
      ...(tags.length && { tags: tags.map((tag) => tag.name) }),
      customization: {},
    };

    try {
      const res: CreateLinkResponse = await createLink(payload);

      toast.success(res.message || "QR Code generated successfully!");
      navigate(`/qrcodes/${res.data.shortUrl}/details`, {
        state: {
          ...res.data,
          tags: payload.tags,
        },
      });
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create QR Code</h1>
        <p className="text-sm text-muted-foreground">
          Generate a trackable QR code for your destination URL.
        </p>
      </div>

      <Card className="max-w-2xl shadow-sm border-muted/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <CardTitle>QR Code Details</CardTitle>
          </div>
          <CardDescription>
            Enter destination URL, title, and optional tags to generate a QR Code.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            {/* Destination URL */}
            <div className="space-y-2">
              <Label htmlFor="long-url" className="text-sm font-semibold">
                Destination URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="long-url"
                type="url"
                placeholder="https://example.com/my-destination"
                value={longUrl}
                onChange={(e) => {
                  setLongUrl(e.target.value);
                  if (longUrlError) setLongUrlError("");
                }}
                className={longUrlError ? "border-destructive" : ""}
              />
              {longUrlError && (
                <p className="text-xs text-destructive font-medium">{longUrlError}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-semibold">
                Title <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
              </Label>
              <Input
                id="title"
                type="text"
                maxLength={64}
                placeholder="Campaign QR Code Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {/* Tags Combobox Multi-Select */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">
                Tags <span className="text-xs font-normal text-muted-foreground">(Optional)</span>
              </Label>

              <TagComboboxMultiple
                selectedTags={tags}
                setSelectedTags={setTags}
              />
            </div>

            {/* Actions */}
            <div className="pt-4 border-t flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/home")}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
              >
                <span>{isSubmitting ? "Generating..." : "Generate QR Code"}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QrCodesCreatePage;
