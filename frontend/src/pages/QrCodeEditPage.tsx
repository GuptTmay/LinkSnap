import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode } from "lucide-react";

export const QrCodeEditPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit QR Code</h1>
        <p className="text-sm text-muted-foreground">
          Modify your existing QR code configuration.
        </p>
      </div>

      <Card className="max-w-2xl shadow-sm border-muted/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <CardTitle>Edit QR Code Form</CardTitle>
          </div>
          <CardDescription>
            Edit functionality will be implemented here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Placeholder form page for /qrcodes/:shortUrl/edit</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QrCodeEditPage;
