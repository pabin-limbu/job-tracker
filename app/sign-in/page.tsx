"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // this will sign up user for us but how will it signup we havent created any user collection.
      // Better auth will create that collection for us. as we have to connect mongo db client with better auth.

      const result = await signIn.email({
        email,
        password,
      });
      if (result.error) {
        setError(result.error.message ?? "failed to sign In");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      setError("An unexpected error occoured");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md border-gray-200 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-black">
            Sign In
          </CardTitle>
          <CardDescription className="text-gray-600">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">
                Email
              </Label>
              <Input
                className="border-gray-300 focus:border-primary focus:ring-primary"
                id="email"
                type="text"
                placeholder="john doe"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passowrd" className="text-gray-700">
                Password
              </Label>
              <Input
                className="border-gray-300 focus:border-primary focus:ring-primary"
                id="password"
                type="password"
                placeholder="john doe"
                required
                autoComplete="new-password"
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              type="submit"
              disabled={loading}
            >
              {loading ? "...signing in" : "Sign in"}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Dont have an account?{" "}
              <Link
                className="font-medium text-primary hover:underline"
                href={"/sign-up"}
              >
                Sign Up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default SignInPage;
