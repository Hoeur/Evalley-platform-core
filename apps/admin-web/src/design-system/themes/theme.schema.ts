import { z } from "zod";
import { themeTokenKeys } from "./theme.types";

const entries = Object.fromEntries(themeTokenKeys.map((key) => [key, z.string().min(1)]));
export const themeTokensSchema = z.object({ ...entries, radius: z.string().min(1) });
