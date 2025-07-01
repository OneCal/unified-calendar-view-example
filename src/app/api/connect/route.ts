import { env } from "@/env";
import { stateFromB64 } from "@/lib/utils";
import { db } from "@/server/db";
import { getEndUserAccountById } from "@/server/lib/onecal-unified/client";

import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const endUserAccountId = params.get("endUserAccountId");
  const state = params.get("state");

  if (!endUserAccountId) {
    return Response.json(
      {
        error: "endUserAccountId is required",
      },
      {
        status: 400,
      },
    );
  } else if (!state) {
    return Response.json({
      error: "externalId is required",
    });
  }

  const { userId } = stateFromB64(state);
  const endUserAccount = await getEndUserAccountById(endUserAccountId);

  await db.calendarAccount.upsert({
    where: {
      email_provider_userId: {
        email: endUserAccount.email,
        userId,
        provider: endUserAccount.providerType,
      },
    },
    update: {
      status: endUserAccount.status,
      unifiedAccountId: endUserAccount.id,
    },
    create: {
      email: endUserAccount.email,
      provider: endUserAccount.providerType,
      userId,
      unifiedAccountId: endUserAccount.id,
      status: endUserAccount.status,
    },
  });

  return Response.redirect(`${env.BETTER_AUTH_URL}/`);
}
