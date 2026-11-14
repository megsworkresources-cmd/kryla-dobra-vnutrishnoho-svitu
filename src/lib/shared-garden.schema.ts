import { z } from "zod";

/** Only this tiny, explicitly approved projection may leave the device. */
export const sunflowerInput = z
  .object({ stage: z.number().int().min(0).max(5), sharing: z.boolean() })
  .strict();
