import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const CtaCard: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleAction = () => {
    if (isAuthenticated) {
      navigate("/home");
    } else {
      navigate("/auth");
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-md border-muted/60 bg-muted/20">
      <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8">
        <div className="space-y-2 text-center sm:text-left">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Get Started Free</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Ready to simplify your links?
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Join LinkSnap to create custom short links and trackable QR codes in seconds.
          </p>
        </div>

        <Button
          onClick={handleAction}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shrink-0 px-6"
        >
          <span>{isAuthenticated ? "Go to Dashboard" : "Get Started Now"}</span>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
};
