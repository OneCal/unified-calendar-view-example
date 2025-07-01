import { GoogleLogoIcon } from "@/components/icons/google-logo";
import { MicrosoftLogoIcon } from "@/components/icons/microsoft-logo";
import { CalendarAccountProvider } from "@prisma/client";
import type { ComponentProps } from "react";

type ProviderLogoIconProps = ComponentProps<"svg"> & {
  provider: CalendarAccountProvider;
};

export function ProviderLogoIcon({
  provider,
  ...props
}: ProviderLogoIconProps) {
  if (provider === CalendarAccountProvider.GOOGLE) {
    return <GoogleLogoIcon {...props} />;
  } else if (provider === CalendarAccountProvider.MICROSOFT) {
    return <MicrosoftLogoIcon {...props} />;
  } else {
    return null;
  }
}
