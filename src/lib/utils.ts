import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface State {
  userId: string;
}

export function stateToB64(state: State) {
  return Buffer.from(JSON.stringify(state)).toString("base64");
}

export function stateFromB64(b64: string) {
  return JSON.parse(Buffer.from(b64, "base64").toString("utf-8")) as State;
}
