import type { ComponentProps } from "react";

export function MicrosoftLogoIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="48"
      height="48"
      viewBox="0 0 32 32"
      {...props}
    >
      <path fill="#f25022" d="M0 0h15.206v15.206H0z"></path>
      <path fill="#7fba00" d="M16.794 0H32v15.206H16.794z"></path>
      <path fill="#00a4ef" d="M0 16.794h15.206V32H0z"></path>
      <path fill="#ffb900" d="M16.794 16.794H32V32H16.794z"></path>
    </svg>
  );
}
