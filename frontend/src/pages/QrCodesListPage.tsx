import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const QrCodesListPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">QR Codes</h1>
        <p className="text-sm text-muted-foreground">Manage all your generated QR codes.</p>
      </div>

      <Card className="shadow-sm border-muted/60">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Your QR Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Placeholder list view for /qrcodes</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QrCodesListPage;
