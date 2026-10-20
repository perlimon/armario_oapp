import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigurado = Boolean(url && key);

let cliente: SupabaseClient | undefined;

export function supabase(): SupabaseClient {
  if (!url || !key) throw new Error("Falta configurar Supabase");
  cliente ??= createClient(url, key);
  return cliente;
}
