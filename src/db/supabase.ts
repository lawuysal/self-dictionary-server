import process from "process";
import { createClient } from "@supabase/supabase-js";
import { Database } from "./database.types";

const supabaseProjectUrl = process.env.SUPABASE_PROJECT_URL ?? "";
const supabasePublicKey = process.env.SUPABASE_PUBLIC_KEY ?? "";

export const supabase = createClient<Database>(
  supabaseProjectUrl,
  supabasePublicKey,
);
