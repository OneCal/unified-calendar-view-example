import { env } from "@/env";
import { db } from "@/server/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { headers } from "next/headers";
import { cache } from "react";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
    microsoft: {
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      tenantId: env.MICROSOFT_TENANT_ID,
    },
  },
  user: {
    additionalFields: {
      onboardingCompletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
        input: false,
      },
    },
  },
});

export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

export type Session = typeof auth.$Infer.Session;
