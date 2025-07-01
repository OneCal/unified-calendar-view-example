"use client";
import { authClient } from "@/lib/auth-client";
import type { Session } from "@/server/auth";
import Link from "next/link";

export function AuthButton({ session }: { session?: Session | null }) {
  if (session) {
    return (
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
        onClick={() => authClient.signOut()}
      >
        Sign out
      </button>
    );
  }
  return (
    <Link
      href="/login"
      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
    >
      Sign in
    </Link>
  );
}
