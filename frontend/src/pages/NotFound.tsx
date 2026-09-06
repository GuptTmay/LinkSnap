import React from "react";
import { Link2, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-background text-foreground">
      <Navbar />
      <main className="flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
          {/* Icon */}
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-500/10">
            <Link2 className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Error Code */}
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Error 404
          </p>

          {/* Heading */}
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
            Link Not Found
          </h1>

          {/* Description */}
          <div className="mt-5 max-w-xl space-y-3 text-sm leading-6 text-muted-foreground sm:text-base">
            <p>
              The shortened URL you're trying to access doesn't exist.
            </p>

            <p>
              The URL may have been typed incorrectly, deleted, or it may be an
              old/outdated link.
            </p>

            <p>
              Please check the URL and try again.
            </p>
          </div>

          {/* Actions */}
          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="h-11 w-full gap-2 sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>

            <Button
              onClick={() => navigate("/")}
              className="h-11 w-full gap-2 bg-blue-600 px-6 text-white hover:bg-blue-700 sm:w-auto"
            >
              <Home className="h-4 w-4" />
              Go to Home
            </Button>
          </div>

          {/* Decorative divider */}
          <div className="mt-10 flex w-full max-w-md items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">
              LinkSnap
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>
        </div>
      </main>
      <Footer />
    </div>

  );
};

export default NotFound;