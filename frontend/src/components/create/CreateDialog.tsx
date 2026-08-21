import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreateLinkCard } from "./CreateLinkCard";
import { CreateQrCard } from "./CreateQrCard";

interface CreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateDialog: React.FC<CreateDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();

  const handleSelectLink = () => {
    onOpenChange(false);
    navigate("/links/create");
  };

  const handleSelectQr = () => {
    onOpenChange(false);
    navigate("/qrcodes/create");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            What would you like to create?
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          <CreateLinkCard onClick={handleSelectLink} />
          <CreateQrCard onClick={handleSelectQr} />
        </div>
      </DialogContent>
    </Dialog>
  );
};
