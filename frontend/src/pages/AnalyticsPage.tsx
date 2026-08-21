import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground">Track link performance and click statistics.</p>
      </div>

      <Card className="shadow-sm border-muted/60">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Analytics Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Placeholder analytics view for /analytics</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsPage;
