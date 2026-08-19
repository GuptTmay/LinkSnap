import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createLink } from "@/api/links.api";

const Home = () => {
  const [longUrl, setLongUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();

    if (!longUrl.trim()) {
      setError("Please enter a URL");
      return;
    }

    setLoading(true);
    setError("");
    setShortUrl("");

    try {
      const res = await createLink(longUrl);
      const body = await res?.json();

      if (!res?.ok || !body?.success) {
        setError(body?.message || "Failed to create short URL");
        return;
      }

      setShortUrl(body.data.shortUrl);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-4">
        <div className="w-full space-y-8 text-center">
          {/* Header */}
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Shorten your links
            </h1>

            <p className="mx-auto max-w-xl text-muted-foreground">
              Create short, easy-to-share links in seconds.
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row"
          >
            <Input
              type="url"
              placeholder="https://example.com/your-long-url"
              value={longUrl}
              onChange={(e) => setLongUrl(e.target.value)}
              className="h-12 flex-1"
            />

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="h-12 px-6"
            >
              {loading ? "Shortening..." : "Shorten URL"}
            </Button>
          </form>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">
              {error}
            </p>
          )}

          {/* Result */}
          {shortUrl && (
            <div className="mx-auto w-full max-w-2xl rounded-lg border bg-card p-5 text-left shadow-sm">
              <p className="mb-2 text-sm font-medium text-muted-foreground">
                Your shortened URL
              </p>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={shortUrl}
                  readOnly
                  className="h-11"
                />

                <Button
                  variant="outline"
                  onClick={() =>
                    navigator.clipboard.writeText(shortUrl)
                  }
                >
                  Copy
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;