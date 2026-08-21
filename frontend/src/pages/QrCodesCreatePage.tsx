import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { QrCode } from "lucide-react";

export const QrCodesCreatePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Create QR Code</h1>
        <p className="text-sm text-muted-foreground">
          Dedicated QR code creation page.
        </p>
      </div>

      <Card className="max-w-2xl shadow-sm border-muted/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <CardTitle>Create QR Code Form</CardTitle>
          </div>
          <CardDescription>
            Dedicated creation options will be implemented here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Placeholder form page for /qrcodes/create</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QrCodesCreatePage;
