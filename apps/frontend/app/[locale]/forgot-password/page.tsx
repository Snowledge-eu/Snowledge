"use client";
import { useAuth } from "@/contexts/auth-context";
import { Button, Input, Logo } from "@repo/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function ForgotPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { validPassword } = useAuth();
  const subTitle = token
    ? `Enter your new password. 
            You will be redirected to log in after.`
    : `Enter the account email address. 
            If your email address exists, an email will be sent to you. 
            Remember to check your spam folder.`;
  const [formData, setFormData] = useState<any>({
    email: "",
    password: "",
    confirmPwd: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };
  const submitInputs = async () => {
    setError("");
    setSuccess("");
    let validationError = null;
    if (token) {
      validationError = validPassword(formData.password, formData.confirmPwd);
    } else {
      if (!formData.email) {
        validationError = "An email is required.";
      }
    }

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const body = token
        ? { password: formData.password, token: token }
        : { email: formData.email };
      const path = token ? "change-password" : "forgot-password";
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/${path}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      if (!response.ok) {
        throw new Error("Registration failed. Please try again.");
      }
      const data = await response.json();

      router.push("/sign-in");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    }
  };
  return (
    <div className="min-h-screen bg-background md:p-16 gap-x-6">
      {/* Content wrapper */}
      <div className="w-full flex items-top justify-center">
        {/* Sign-in form container */}
        <div className="max-w-sm px-6 py-16 md:p-0 w-full ">
          {/* Logo and header section */}
          <div className="space-y-6 mb-6 items-center flex flex-col">
            <Logo />
            <div className="flex flex-col gap-y-3 text-center">
              <h1 className="text-2xl md:text-3xl font-bold">
                Forgot Password
              </h1>
              <p className="text-muted-foreground text-sm">{subTitle}</p>
            </div>
          </div>
          {token ? (
            <>
              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                  />
                  <p className="text-sm text-muted-foreground">
                    Minimum 8 characters.
                  </p>
                  <Input
                    type="password"
                    name="confirmPwd"
                    placeholder="Confirm password"
                    value={formData.confirmPwd}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              {/* Sign-in button and sign-up link section */}
              <div className="flex flex-col space-y-6">
                <Button className="w-full" onClick={submitInputs}>
                  Change password
                </Button>
                {/* Forgot password link */}
                <p className="text-sm text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <Link className="underline text-foreground" href="#">
                    Sign up
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Input fields section */}
              <div className="space-y-4 mb-6">
                <div className="space-y-2">
                  <Input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              {/* Sign-in button and sign-up link section */}
              <div className="flex flex-col space-y-6">
                <Button className="w-full" onClick={submitInputs}>
                  Recovery
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  Don't have an account?{" "}
                  <Link className="underline text-foreground" href="/sign-up">
                    Sign up
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
