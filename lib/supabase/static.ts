// Cliente Supabase sem cookies — para uso em generateStaticParams e sitemap
// (build time, sem contexto de request HTTP)
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
