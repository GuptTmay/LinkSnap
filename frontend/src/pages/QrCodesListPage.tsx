import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getLinks } from "@/api/links.api";
import { ApiError } from "@/types/error";
import { QrCodeCard } from "@/components/qrcodes/QrCodeCard";
import { LinkPagination } from "@/components/links/LinkPagination";
import { QrCode, Plus } from "lucide-react";
import { toast } from "sonner";
import type { LinkWithRelations } from "@/types/api";

export const QrCodesListPage: React.FC = () => {
  const navigate = useNavigate();

  // State
  const [links, setLinks] = useState<LinkWithRelations[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  
  const [isLoading, setIsLoading] = useState(true);

  // Fetch QR codes from backend with server-side pagination and qrCode: true
  const fetchQrCodes = useCallback(async (currentPage: number) => {
    setIsLoading(true);
    try {
      const res = await getLinks({
        page: currentPage,
        limit,
        qrCode: true,
      });

      const linkList = res.data?.links || [];
      const pagination = res.data?.pagination || {
        page: currentPage,
        limit,
        total: linkList.length,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      setLinks(linkList);
      setPage(pagination.page);
      setTotalPages(pagination.totalPages);
      setHasNextPage(pagination.hasNextPage);
      setHasPreviousPage(pagination.hasPreviousPage);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error("Failed to load QR codes.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchQrCodes(page);
  }, [fetchQrCodes, page]);

  // Handle local deletion without full page reload
  const handleLinkDeleted = (deletedLinkId: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== deletedLinkId));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">QR Codes</h1>
          <p className="text-sm text-muted-foreground">
            Manage, edit, and view all your generated QR codes.
          </p>
        </div>

        <Button
          onClick={() => navigate("/qrcodes/create")}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Create QR Code</span>
        </Button>
      </div>

      {/* Main List Area */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-5 border-muted/60">
              <div className="flex items-start gap-4">
                <Skeleton className="h-16 w-16 rounded-lg shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-48" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : links.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <QrCode className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold text-lg text-foreground">No QR codes yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Generate your first QR code to share links easily.
              </p>
            </div>
            <Button
              onClick={() => navigate("/qrcodes/create")}
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create QR Code</span>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {links.map((link) => (
            <QrCodeCard
              key={link.id}
              link={link}
              onDeleted={handleLinkDeleted}
            />
          ))}

          {/* Server-side Pagination */}
          <LinkPagination
            page={page}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}
    </div>
  );
};

export default QrCodesListPage;
