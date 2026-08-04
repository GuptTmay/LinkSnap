import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { signupUser, loginUser } from "@/lib/api";
import type { ApiResponse } from "@/types"; 
import { useNavigate } from "react-router-dom";

export default function AuthDialog({ type = "login" }: { type?: "login" | "signup" }) {
  const navigate = useNavigate();
  const isSignup = type === "signup";
  const [open, setOpen] = useState(false);
 


  async function authSubmitHandler(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string | null;

    if (isSignup && password !== confirmPassword) {
      toast.warning("Passwords do not match");
      return;
    }
    
    const data: Promise<ApiResponse<null>> = isSignup
      ? signupUser(email, password)
      : loginUser(email, password);

    toast.promise(data, {
      loading: isSignup ? "Creating account..." : "Logging in...",
      success: (res: ApiResponse<unknown>) => {
        if (!res.success) {
          // reject so toast.promise shows the error branch instead
          throw new Error(res.message || "Something went wrong");
        }
        setOpen(false);
        navigate("/home");
        return res.message || (isSignup ? "Account created" : "Logged in");
      },
      error: (err: unknown) =>
        err instanceof Error ? err.message : "Something went wrong",
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{isSignup ? "Sign Up" : "Login"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={authSubmitHandler}>
          <DialogHeader>
            <DialogTitle>{isSignup ? "Create an account" : "Login"}</DialogTitle>
            <DialogDescription>
              {isSignup
                ? "Enter your details to create an account."
                : "Enter your credentials to continue."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="pb-1" htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="Enter your email" required />
            </div>
            <div>
              <Label className="pb-1" htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" placeholder="Enter your password" required />
            </div>
            {isSignup && (
              <div>
                <Label className="pb-1" htmlFor="confirmPassword">Confirm Password</Label>
                <Input id="confirmPassword" name="confirmPassword" type="password" placeholder="Confirm your password" required />
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button variant="outline" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit">{isSignup ? "Sign Up" : "Login"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}