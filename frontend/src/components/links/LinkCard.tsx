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
import { ExternalLink, Edit2, Trash2, Calendar, Tag as TagIcon, Globe } from "lucide-react";
import { toast } from "sonner";
import type { LinkWithRelations } from "@/types/api";

interface LinkCardProps {
  link: LinkWithRelations;
  onDeleted: (linkId: string) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({ link, onDeleted }) => {
  const navigate = useNavigate();
  const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL || "";
  const fullShortUrl = `${BACKEND_BASE_URL}/${link.shortUrl}`;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [faviconError, setFaviconError] = useState(false);

  const displayTitle = link.title || getDomainFromUrl(link.longUrl) || "Untitled Link";
  const faviconUrl = getFaviconUrl(link.longUrl);

  const formattedDate = new Date(link.createdAt).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  // Card Navigation
  const handleCardClick = () => {
    navigate(`/links/${link.shortUrl}/details`, {
      state: {
        shortUrl: link.shortUrl,
        longUrl: link.longUrl,
        title: link.title,
        tags: link.tags?.map((t) => t.name) || [],
      },
    });
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
    navigate(`/links/${link.shortUrl}/edit`);
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
      toast.success(res.message || "Link deleted successfully");
      onDeleted(link.id);
      setDeleteDialogOpen(false);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to delete link.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card
        onClick={handleCardClick}
        className="group relative cursor-pointer border-muted/60 bg-card transition-all hover:border-blue-500/50 hover:shadow-md"
      >
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 flex-1 min-w-0">
            {/* Favicon / Domain Icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border bg-muted/30 overflow-hidden mt-0.5">
              {faviconUrl && !faviconError ? (
                <img
                  src={faviconUrl}
                  alt={displayTitle}
                  onError={() => setFaviconError(true)}
                  className="h-5 w-5 object-contain"
                />
              ) : (
                <Globe className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            {/* Content Details */}
            <div className="space-y-1.5 flex-1 min-w-0">
              {/* Title & Date */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-bold text-base text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                  {displayTitle}
                </h3>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                  <Calendar className="h-3 w-3" />
                  {formattedDate}
                </span>
              </div>

              {/* Short URL Link */}
              <div>
                <button
                  type="button"
                  onClick={handleShortUrlClick}
                  className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 max-w-full truncate"
                >
                  <span className="truncate">{fullShortUrl}</span>
                  <ExternalLink className="h-3 w-3 shrink-0 opacity-70" />
                </button>
              </div>

              {/* Destination URL */}
              <div>
                <button
                  type="button"
                  onClick={handleLongUrlClick}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors hover:underline inline-flex items-center gap-1 max-w-full truncate"
                >
                  <span className="truncate">{link.longUrl}</span>
                </button>
              </div>

              {/* Tags */}
              {link.tags && link.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {link.tags.map((tag) => (
                    <span
                      key={tag.id || tag.name}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-medium"
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
          <div className="flex items-center gap-1 sm:self-center shrink-0 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-2 sm:pt-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleEditClick}
              className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1"
              title="Edit Link"
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit</span>
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDeleteClick}
              className="h-8 px-2.5 text-xs text-destructive hover:bg-destructive/10 gap-1"
              title="Delete Link"
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
            <DialogTitle>Delete Short Link</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this short link ({link.shortUrl})? This action cannot be undone.
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
