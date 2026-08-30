import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link2 } from "lucide-react";

export const LinkEditPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Link</h1>
        <p className="text-sm text-muted-foreground">
          Modify your existing short link configuration.
        </p>
      </div>

      <Card className="max-w-2xl shadow-sm border-muted/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <CardTitle>Edit Link Form</CardTitle>
          </div>
          <CardDescription>
            Edit functionality will be implemented here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Placeholder form page for /links/:shortUrl/edit</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LinkEditPage;
