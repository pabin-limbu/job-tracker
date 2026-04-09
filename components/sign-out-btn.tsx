"use client";

import { useRouter } from "next/navigation";
import { DropdownMenuItem } from "./ui/dropdown-menu";
import { signOut } from "@/lib/auth/auth-client";

function SignOutBtn() {
  const router = useRouter();
  return (
    <DropdownMenuItem
      className="hover:text-primary"
      onClick={async () => {
        const result = await signOut();

        if (result.data) {
          router.push("/sign-in");
        } else {
          alert("Error Logging out");
        }
      }}
    >
      Log out
    </DropdownMenuItem>
  );
}

export default SignOutBtn;
