import React from "react";

export const Hero: React.FC = () => {
  return (
    <section className="text-center max-w-4xl mx-auto px-4">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground">
        Turn Every Click Into{" "}
        <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
          Insight
        </span>
      </h1>
      <p className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto font-normal">
        Create short links, generate QR codes, and understand how people interact with every link you share.
      </p>
    </section>
  );
};
