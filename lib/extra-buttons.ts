import "server-only";

import { getPublicExtraButtons } from "@/lib/public-data";
import type { ExtraButton } from "@/lib/site-config";

export type { ExtraButton };

export async function getExtraButtons(): Promise<ExtraButton[]> {
  return getPublicExtraButtons();
}
