import React from "react";
import { QrCode } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CreateQrCardProps {
  onClick: () => void;
}

export const CreateQrCard: React.FC<CreateQrCardProps> = ({ onClick }) => {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-all hover:border-indigo-500 hover:shadow-md border-muted/60 p-6 flex items-center gap-4 bg-card"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
        <QrCode className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">QR Code</h3>
      </div>
    </Card>
  );
};
