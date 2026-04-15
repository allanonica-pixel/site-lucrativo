import type { MetadataRoute } from 'next'
import { createStaticClient } from '@/lib/supabase/static'
import { CATEGORY_SLUGS } from '@/constants/categories'

const SITE_URL = 'https://mercadoai.com'

function articleChangeFreq(type: string): MetadataRoute.Sitemap[0]['changeFrequency'] {
  return type === 'Notícias' ? 'daily' : 'monthly'
}

function articlePriority(type: string): number {
  switch (type) {
    case 'Notícias': return 0.85
    case 'Review': return 0.82
    case 'Guia de Compra': return 0.80
    case 'Comparativo': return 0.80
    default: return 0.75
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createStaticClient()

  const [
    { data: products },
    { data: articles },
    { data: comparisons },
  ] = await Promise.all([
    supabase.from('products').select('slug, updated_at').eq('is_active', true),
    supabase.from('articles').select('slug, updated_at, type'),
    supabase.from('comparisons').select('slug, published_at').eq('is_published', true),
  ])

  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/articles`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/guias`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/noticias`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/comparativo`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/products`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/ofertas`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/termos`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/privacidade`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    ...Object.values(CATEGORY_SLUGS).map((slug) => ({
      url: `${SITE_URL}/categoria/${slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]

  const productPages: MetadataRoute.Sitemap = (products ?? []).map((p) => ({
    url: `${SITE_URL}/produto/${p.slug}`,
    lastModified: p.updated_at ? new Date(p.updated_at) : now,
    changeFrequency: 'weekly' as const,
    priority: 0.70,
  }))

  const articlePages: MetadataRoute.Sitemap = (articles ?? []).map((a) => ({
    url: `${SITE_URL}/artigo/${a.slug}`,
    lastModified: a.updated_at ? new Date(a.updated_at) : now,
    changeFrequency: articleChangeFreq(a.type),
    priority: articlePriority(a.type),
  }))

  const comparisonPages: MetadataRoute.Sitemap = (comparisons ?? []).map((c) => ({
    url: `${SITE_URL}/comparar/${c.slug}`,
    lastModified: c.published_at ? new Date(c.published_at) : now,
    changeFrequency: 'monthly' as const,
    priority: 0.78,
  }))

  return [...staticPages, ...productPages, ...articlePages, ...comparisonPages]
}
