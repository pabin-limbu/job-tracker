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
import Link from "next/link";
import { useState } from "react";
import { signUp } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";

function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();

    console.log(name);
    setError("");
    setLoading(true);

    try {
      // this will sign up user for us but how will it signup we havent created any user collection.
      // Better auth will create that collection for us. as we have to connect mongo db client with better auth.

      const result = await signUp.email({
        name,
        email,
        password,
      });
      if (result.error) {
        setError(result.error.message ?? "failed to sign up");
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
            Sign up
          </CardTitle>
          <CardDescription className="text-gray-600">
            Create an account to track your job application
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
              <Label htmlFor="name" className="text-gray-700">
                Name
              </Label>
              <Input
                className="border-gray-300 focus:border-primary focus:ring-primary"
                id="name"
                type="text"
                placeholder="john doe"
                required
                onChange={(e) => setName(e.target.value)}
                value={name}
                autoComplete="off"
              />
            </div>
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
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                autoComplete="off"
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
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                autoComplete="new-password"
                minLength={8}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              type="submit"
              disabled={loading}
            >
              {loading ? "Creating account" : "Sign up"}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                className="font-medium text-primary hover:underline"
                href={"/sign-in"}
              >
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default SignUpPage;
