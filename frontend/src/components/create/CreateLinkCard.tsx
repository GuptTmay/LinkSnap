import React from "react";
import { Link2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface CreateLinkCardProps {
  onClick: () => void;
}

export const CreateLinkCard: React.FC<CreateLinkCardProps> = ({ onClick }) => {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-all hover:border-blue-500 hover:shadow-md border-muted/60 p-6 flex items-center gap-4 bg-card"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
        <Link2 className="h-6 w-6" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-foreground">Short Link</h3>
      </div>
    </Card>
  );
};
