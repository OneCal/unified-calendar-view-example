import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </RadixDialog.Root>
  );
}

export function DialogTrigger({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactNode;
}) {
  return (
    <RadixDialog.Trigger asChild={asChild}>{children}</RadixDialog.Trigger>
  );
}

export function DialogContent({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
      <RadixDialog.Content
        className={
          "fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-6 shadow-lg " +
          className
        }
      >
        {children}
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

export function DialogTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RadixDialog.Title
      className={"text-lg font-semibold " + className}
    >
      {children}
    </RadixDialog.Title>
  );
}

export function DialogDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <RadixDialog.Description
      className={"text-sm text-gray-600 " + className}
    >
      {children}
    </RadixDialog.Description>
  );
}

export function DialogClose({
  asChild,
  children,
}: {
  asChild?: boolean;
  children: React.ReactNode;
}) {
  return <RadixDialog.Close asChild={asChild}>{children}</RadixDialog.Close>;
}