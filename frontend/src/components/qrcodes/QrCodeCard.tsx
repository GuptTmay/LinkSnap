import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import QRCode from "qrcode";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteLinks } from "@/api/links.api";
import { ApiError } from "@/types/error";
import { getDomainFromUrl } from "@/lib/favicon";
import { ExternalLink, Edit2, Trash2, Calendar, Tag as TagIcon, QrCode as QrIcon } from "lucide-react";
import { toast } from "sonner";
import type { LinkWithRelations } from "@/types/api";

interface QrCodeCardProps {
  link: LinkWithRelations;
  onDeleted: (linkId: string) => void;
}

export const QrCodeCard: React.FC<QrCodeCardProps> = ({ link, onDeleted }) => {
  const navigate = useNavigate();
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "";
  const fullShortUrl = `${BACKEND_BASE_URL}/${link.shortUrl}`;

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayTitle = link.title || getDomainFromUrl(link.longUrl) || "Untitled QR Code";

  const formattedDate = new Date(link.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Generate QR Code image client-side for base_url/shortUrl
  useEffect(() => {
    if (!fullShortUrl) return;
    QRCode.toDataURL(fullShortUrl, { width: 240, margin: 1 })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(""));
  }, [fullShortUrl]);

  // Card Navigation
  const handleCardClick = () => {
    navigate(`/qrcodes/${link.shortUrl}/details`, {
      state: {
        shortUrl: link.shortUrl,
        longUrl: link.longUrl,
        title: link.title,
        tags: link.tags?.map((t) => t.name) || [],
      },
    });
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  // Short URL Click
  const handleShortUrlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(fullShortUrl, "_blank", "noopener,noreferrer");
  };

  // Destination URL Click
  const handleLongUrlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(link.longUrl, "_blank", "noopener,noreferrer");
  };

  // Edit Click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/qrcodes/${link.shortUrl}/edit`);
  };

  // Delete Click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteLinks(link.id);
      toast.success(res.message || "QR code deleted successfully");
      onDeleted(link.id);
      setDeleteDialogOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to delete QR code.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        className="group relative cursor-pointer border-muted/60 bg-card transition-all duration-200 hover:border-indigo-500/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2"
      >
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
          <div className="flex min-w-0 flex-1 flex-col items-start gap-4 sm:flex-row">
            {/* QR Code Image Preview — scales down on small screens instead of a fixed 224px */}
            <div className="mx-auto flex h-42 w-42 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-white p-1 shadow-sm transition-transform duration-200 group-hover:scale-[1.02] sm:mx-0 sm:h-48 sm:w-48 md:h-56 md:w-56">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${displayTitle}`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <QrIcon className="h-6 w-6 text-muted-foreground" />
              )}
            </div>

            {/* Content Details */}
            <div className="min-w-0 flex-1 space-y-1.5">
              {/* Title & Date */}
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                <h3 className="min-w-0 flex-1 truncate font-bold text-base text-foreground transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {displayTitle}
                </h3>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {formattedDate}
                </span>
              </div>

              {/* Short URL Link */}
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={handleShortUrlClick}
                  className="inline-flex min-w-0 max-w-full items-center gap-1 rounded text-sm font-semibold text-indigo-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-400"
                >
                  <span className="min-w-0 truncate">{fullShortUrl}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                </button>
              </div>

              {/* Destination URL */}
              <div className="min-w-0">
                <button
                  type="button"
                  onClick={handleLongUrlClick}
                  className="inline-flex min-w-0 max-w-full items-center gap-1 rounded text-xs text-muted-foreground transition-colors hover:text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  <span className="min-w-0 truncate">{link.longUrl}</span>
                </button>
              </div>

              {/* Tags */}
              {link.tags && link.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {link.tags.map((tag) => (
                    <span
                      key={tag.id || tag.name}
                      className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400"
                    >
                      <TagIcon className="h-2.5 w-2.5" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex w-full shrink-0 items-center justify-end gap-1 border-t pt-2 sm:w-auto sm:self-center sm:border-t-0 sm:pt-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              className="h-8 gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-indigo-500"
              title="Edit QR code"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="h-8 gap-1 px-2.5 text-xs text-destructive hover:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-destructive"
              title="Delete QR code"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete QR code</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this QR code ({link.shortUrl})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
