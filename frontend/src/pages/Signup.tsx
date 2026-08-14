import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signup } from "@/lib/api";
import { toast } from "sonner";

import { GoogleLogin } from "@react-oauth/google";
const Signup = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await signup(email, password);
      const body = await response.json();

      if (
        body.error?.code === "VALIDATION_ERROR" &&
        Array.isArray(body.error.details)
      ) {
        toast.error("Validation failed", {
          description: (
            <ul className="list-disc pl-4">
              {body.error.details.map(
                (e: { field: string; message: string }, i: number) => (
                  <li key={i}>
                    {e.field}: {e.message}
                  </li>
                )
              )}
            </ul>
          ),
        });
        setError(body.error.message);
        return;
      }

      if (!body.success) {
        setError(body.message);
        toast.error(body.message);
        return;
      }

      toast.success(body.message);

      navigate("/home");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <GoogleLogin
        onSuccess={async (credentialResponse) => {
          const res = await fetch("http://localhost:3000/api/v1/auth/google", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              credential: credentialResponse.credential,
            }),
          });
          const body = await res.json();
          console.log(body);
          console.log("success");
        }}
        onError={() => {
          console.log("Login Failed");
        }}
      />
    </div>
  );
};

export default Signup;