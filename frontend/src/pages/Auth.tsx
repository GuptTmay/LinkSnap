import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { googleOauth } from "@/api/auth.api";
import { useAuth } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, checkAuth } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 mx-auto container max-w-6xl px-4 flex items-center justify-center py-12">
        <Card className="w-full max-w-md shadow-md border-muted/60">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome to LinkSnap</CardTitle>
            <CardDescription>
              Sign in to manage your short links and custom QR codes
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center gap-4 py-6">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                try {
                  const res = await googleOauth(credentialResponse);
                  // const res = await fetch("http://localhost:3000/api/v1/auth/google", {
                  //   method: "POST",
                  //   headers: {
                  //     "Content-Type": "application/json",
                  //   },
                  //   body: JSON.stringify({
                  //     credential: credentialResponse.credential,
                  //   }),
                  // });
                  console.log(res);

                  if (res.ok) {
                    toast.success("Successfully logged in!");
                    await checkAuth();
                    navigate("/home", { replace: true });
                  } else {
                    toast.error("Authentication failed. Please try again.");
                  }
                } catch (err) {
                  console.log(err);
                  toast.error("An error occurred during authentication." + err);
                }
              }}
              onError={() => {
                toast.error("Google Login failed. Please try again.");
              }}
            />
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default AuthPage;