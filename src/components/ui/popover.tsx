import * as React from "react";
import * as RadixPopover from "@radix-ui/react-popover";

export function Popover({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </RadixPopover.Root>
  );
}

export function PopoverTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactNode;
}) {
  return (
    <RadixPopover.Trigger asChild={asChild}>{children}</RadixPopover.Trigger>
  );
}

export function PopoverContent({
  children,
  className = "",
  align = "center",
  side = "bottom",
  onMouseEnter,
  onMouseLeave,
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  return (
    <RadixPopover.Content
      align={align}
      side={side}
      style={{ color: "black" }}
      className={"z-50 rounded border bg-white p-2 shadow-lg" + className}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      sideOffset={8}
    >
      {children}
    </RadixPopover.Content>
  );
}
