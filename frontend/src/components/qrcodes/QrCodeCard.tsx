import React, { useEffect, useState } from "react";
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
import {
  ExternalLink,
  Edit2,
  Trash2,
  Calendar,
  Tag as TagIcon,
  QrCode as QrIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { LinkWithRelations } from "@/types/api";

interface QrCodeCardProps {
  link: LinkWithRelations;
  onDeleted: (linkId: string) => void;
}

export const QrCodeCard: React.FC<QrCodeCardProps> = ({
  link,
  onDeleted,
}) => {
  const navigate = useNavigate();

  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "";
  const fullShortUrl = `${BACKEND_BASE_URL}/${link.shortUrl}`;

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const displayTitle =
    link.title ||
    getDomainFromUrl(link.longUrl) ||
    "Untitled QR Code";

  const formattedDate = new Date(link.createdAt).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  useEffect(() => {
    if (!fullShortUrl) return;

    QRCode.toDataURL(fullShortUrl, {
      width: 240,
      margin: 1,
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [fullShortUrl]);

  const handleCardClick = () => {
    navigate(`/qrcodes/${link.shortUrl}/details`);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  const handleShortUrlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(fullShortUrl, "_blank", "noopener,noreferrer");
  };

  const handleLongUrlClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(link.longUrl, "_blank", "noopener,noreferrer");
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/qrcodes/${link.shortUrl}/edit`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

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
        className="
          group cursor-pointer
          border-border/60
          bg-card
          transition-all duration-200
          hover:border-indigo-500/40
          hover:shadow-md
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-indigo-500
        "
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">

            {/* QR Preview */}
            <div
              className="
              flex shrink-0
              h-28 w-28
              sm:h-32 sm:w-32
              md:h-48 md:w-48 
              items-center justify-center
              overflow-hidden
              rounded-xl
              border
              bg-white
              p-1.5
              shadow-sm
              transition-transform duration-200
              group-hover:scale-[1.03]
            "
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR code for ${displayTitle}`}
                  className="h-full w-full object-contain"
                />
              ) : (
                <QrIcon className="h-7 w-7 text-muted-foreground" />
              )}
            </div>

            {/* Main Content */}
            <div className="min-w-0 flex-1">

              {/* Title + Date */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3
                    className="
                      truncate
                      text-sm font-semibold
                      text-foreground
                      transition-colors
                      group-hover:text-indigo-500
                      sm:text-base
                      md:text-2xl
                    "
                  >
                    {displayTitle}
                  </h3>

                  <button
                    type="button"
                    onClick={handleShortUrlClick}
                    className="
                      mt-0.5
                      flex max-w-full items-center gap-1
                      text-sm font-medium
                      text-indigo-500
                      hover:underline
                    "
                  >
                    <span className="truncate">
                      {fullShortUrl}
                    </span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </button>
                </div>

                {/* Date */}
                <span
                  className="
                    hidden shrink-0
                    items-center gap-1
                    text-[11px]
                    text-muted-foreground
                    sm:flex
                  "
                >
                  <Calendar className="h-3 w-3" />
                  {formattedDate}
                </span>
              </div>

              {/* Long URL */}
              <button
                type="button"
                onClick={handleLongUrlClick}
                className="
                  mt-1
                  block max-w-full
                  truncate
                  text-xs
                  text-muted-foreground
                  transition-colors
                  hover:text-foreground
                  hover:underline
                  md:text-
                "
              >
                {link.longUrl}
              </button>

              {/* Mobile Date */}
              <div
                className="
                  mt-2
                  flex items-center gap-1
                  text-[11px]
                  text-muted-foreground
                  sm:hidden
                "
              >
                <Calendar className="h-3 w-3" />
                {formattedDate}
              </div>

              {/* Tags */}
              {link.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {link.tags.map((tag) => (
                    <span
                      key={tag.id || tag.name}
                      className="
                        inline-flex items-center gap-1
                        rounded-full
                        border border-indigo-500/20
                        bg-indigo-500/5
                        px-2 py-0.5
                        text-[11px] font-medium
                        text-indigo-500
                      "
                    >
                      <TagIcon className="h-2.5 w-2.5" />
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="
                flex shrink-0 items-center gap-0.5
                opacity-100
                sm:opacity-0
                sm:transition-opacity
                sm:group-hover:opacity-100
              "
            >
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleEditClick}
                className="h-8 w-8"
                title="Edit QR code"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleDeleteClick}
                className="
                  h-8 w-8
                  text-destructive
                  hover:bg-destructive/10
                "
                title="Delete QR code"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete QR code</DialogTitle>

            <DialogDescription>
              Are you sure you want to delete this QR code (
              {link.shortUrl})? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
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