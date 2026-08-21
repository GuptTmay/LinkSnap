import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const LinksListPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Links</h1>
        <p className="text-sm text-muted-foreground">Manage all your short links.</p>
      </div>

      <Card className="shadow-sm border-muted/60">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Your Short Links</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Placeholder list view for /links</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinksListPage;
