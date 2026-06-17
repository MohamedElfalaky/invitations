import { en } from "./en";
import { ar } from "./ar";
import type { Locale } from "@/types/invitation";
import type { Messages } from "./types";

export const messages: Record<Locale, Messages> = { en, ar };

export type { Locale, Messages };
