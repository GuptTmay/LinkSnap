import React from "react";
import { Link } from "react-router-dom";

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t bg-muted/30 py-6">
      <div className="container mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Link
          to="/"
          className="text-lg font-bold tracking-tight"
        >
          <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
            Link
          </span>
          <span className="text-foreground">Snap</span>
        </Link>

        <p className="text-xs text-muted-foreground text-center sm:text-right">
          © {new Date().getFullYear()} LinkSnap. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
