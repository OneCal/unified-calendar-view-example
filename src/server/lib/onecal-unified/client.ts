import { env } from "@/env";
import type { EndUserAccount } from "@/server/lib/onecal-unified/types";
import ky from "ky";

export const onecalUnifiedApi = ky.create({
  prefixUrl: env.NEXT_PUBLIC_ONECAL_UNIFIED_URL,
  headers: {
    "x-api-key": env.ONECAL_UNIFIED_API_KEY,
  },
});

export async function getEndUserAccountById(id: string) {
  const response = await onecalUnifiedApi.get<EndUserAccount>(
    `endUserAccounts/${id}`,
  );
  return response.json();
}
