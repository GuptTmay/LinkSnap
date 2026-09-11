import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { getFaviconUrl, getDomainFromUrl } from "@/lib/favicon";
import {
  ExternalLink,
  Edit2,
  Trash2,
  Calendar,
  Tag as TagIcon,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import type { LinkWithRelations } from "@/types/api";

interface LinkCardProps {
  link: LinkWithRelations;
  onDeleted: (linkId: string) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({
  link,
  onDeleted,
}) => {
  const navigate = useNavigate();

  const BACKEND_BASE_URL =
    import.meta.env.VITE_BACKEND_BASE_URL || "";

  const fullShortUrl = `${BACKEND_BASE_URL}/${link.shortUrl}`;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const displayTitle =
    link.title ||
    getDomainFromUrl(link.longUrl) ||
    "Untitled Link";

  const faviconUrl = getFaviconUrl(link.longUrl);

  const formattedDate = new Date(link.createdAt).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  );

  const handleCardClick = () => {
    navigate(`/links/${link.shortUrl}/details`);
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
    navigate(`/links/${link.shortUrl}/edit`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);

    try {
      const res = await deleteLinks(link.id);

      toast.success(res.message || "Link deleted successfully");

      onDeleted(link.id);
      setDeleteDialogOpen(false);
    } catch (err) {
      toast.error(
        err instanceof ApiError
          ? err.message
          : "Failed to delete link."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        className="
    group cursor-pointer
    border-border/60
    transition-all duration-200
    hover:border-blue-500/40
    hover:shadow-md
    px-5
  "
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-3 sm:gap-4">

            {/* Favicon */}
            <div className="
        mt-0.5 flex h-11 w-11 shrink-0
        items-center justify-center
        rounded-lg border bg-muted/30
        sm:h-12 sm:w-12
      ">
              {faviconUrl && !faviconError ? (
                <img
                  src={faviconUrl}
                  alt=""
                  onError={() => setFaviconError(true)}
                  className="h-7 w-7 object-contain"
                />
              ) : (
                <Globe className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            {/* Main content */}
            <div className="min-w-0 flex-1">

              {/* Title + Date */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="
            min-w-0 truncate
            text-sm font-semibold
            text-foreground
            group-hover:text-blue-500
            sm:text-base
          ">
                  {displayTitle}
                </h3>

                <span className="
            hidden shrink-0 items-center gap-1
            text-[11px] text-muted-foreground
            sm:flex
          ">
                  <Calendar className="h-3 w-3" />
                  {formattedDate}
                </span>
              </div>

              {/* Short URL */}
              <button
                type="button"
                onClick={handleShortUrlClick}
                className="
            mt-0.5 flex max-w-full items-center gap-1
            text-sm font-medium
            text-blue-500
            hover:underline
          "
              >
                <span className="truncate">
                  {fullShortUrl}
                </span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </button>

              {/* Long URL */}
              <button
                type="button"
                onClick={handleLongUrlClick}
                className="
            mt-1 block max-w-full truncate
            text-xs text-muted-foreground
            hover:text-foreground
            hover:underline
          "
              >
                {link.longUrl}
              </button>

              {/* Mobile date */}
              <div className="
          mt-2 flex items-center gap-1
          text-[11px] text-muted-foreground
          sm:hidden
        ">
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
                  border border-blue-500/20
                  bg-blue-500/5
                  px-2 py-0.5
                  text-[11px] font-medium
                  text-blue-500
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
                title="Edit link"
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
                title="Delete link"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation */}
      <Dialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      >
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Short Link</DialogTitle>

            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {link.shortUrl}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};