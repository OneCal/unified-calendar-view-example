"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type RecurringEventDialogProps = {
  title: string;
  open: boolean;
  updateSeries: boolean;
  onUpdateSeriesChange: (value: boolean) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export function RecurringEventDialog({
  title,
  open,
  updateSeries,
  onUpdateSeriesChange,
  onSubmit,
  onClose,
}: RecurringEventDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex min-w-[300px] flex-col gap-4 p-4">
        <DialogTitle className="text-lg font-semibold">{title}</DialogTitle>

        <div className="mt-2 flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="updateSeries"
              checked={!updateSeries}
              onChange={() => onUpdateSeriesChange(false)}
            />
            Only this occurrence
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="updateSeries"
              checked={updateSeries}
              onChange={() => onUpdateSeriesChange(true)}
            />
            Entire series
          </label>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>Update</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
