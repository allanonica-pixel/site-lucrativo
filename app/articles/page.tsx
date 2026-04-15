import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Article } from '@/lib/supabase/types'
import { formatDate } from '@/lib/utils'
import { TYPE_COLORS, CATEGORIES } from '@/constants/categories'
import { SITE_URL } from '@/lib/constants'

export const revalidate = 1800

interface ArticlesPageProps {
  searchParams: Promise<{ categoria?: string; subcategoria?: string }>
}

export async function generateMetadata({ searchParams }: ArticlesPageProps): Promise<Metadata> {
  const { categoria } = await searchParams
  const title = categoria
    ? `${categoria} — Artigos | Mercadoai`
    : 'Artigos — Reviews, Guias e Comparativos | Mercadoai'
  const description = categoria
    ? `Leia os melhores artigos sobre ${categoria} no Mercadoai.`
    : 'Explore reviews detalhados, guias de compra, comparativos e notícias sobre tecnologia e produtos.'

  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/articles` },
    openGraph: { title, description, url: `${SITE_URL}/articles`, siteName: 'Mercadoai', locale: 'pt_BR', type: 'website' },
    robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  }
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const { categoria, subcategoria } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('articles')
    .select('*')
    .order('published_at', { ascending: false })
    .limit(24)

  if (categoria) query = query.eq('type', categoria)
  if (subcategoria) query = query.eq('subcategory', subcategoria)

  const { data: articles } = await query

  const types = ['Review', 'Comparativo', 'Guia de Compra', 'Notícias']

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: categoria ?? 'Artigos — Mercadoai',
    url: `${SITE_URL}/articles`,
    description: 'Reviews, guias de compra, comparativos e notícias sobre tecnologia.',
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: (articles ?? []).map((a: Article, i: number) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: { '@type': 'Article', '@id': `${SITE_URL}/artigo/${a.slug}`, headline: a.title },
      })),
    },
  }

  return (
    <div className="pt-[104px]">
      {/* Hero */}
      <div className="bg-gray-950 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-gray-400 mb-4 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <span>/</span>
            <span className="text-white">Artigos</span>
          </nav>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            {categoria ?? 'Todos os Artigos'}
          </h1>
          <p className="text-gray-400 max-w-2xl">
            Reviews detalhados, guias de compra, comparativos e as últimas notícias sobre tecnologia e produtos.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Filtros por tipo */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/articles"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${!categoria ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
          >
            Todos
          </Link>
          {types.map((type) => (
            <Link
              key={type}
              href={`/articles?categoria=${encodeURIComponent(type)}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                categoria === type ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {type}
            </Link>
          ))}
        </div>

        {/* Grid de artigos */}
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: Article) => (
              <Link
                key={article.id}
                href={`/artigo/${article.slug}`}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-orange-200 hover:shadow-md transition-all duration-200"
              >
                {article.cover_image && (
                  <div className="h-48 overflow-hidden bg-gray-100">
                    <img
                      src={article.cover_image}
                      alt={article.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_COLORS[article.type] ?? 'bg-gray-100 text-gray-700'}`}>
                      {article.type}
                    </span>
                    {article.subcategory && (
                      <span className="text-xs text-gray-500">{article.subcategory}</span>
                    )}
                  </div>
                  <h2 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{article.excerpt}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {article.author_avatar && (
                      <img src={article.author_avatar} alt={article.author_name ?? ''} className="w-5 h-5 rounded-full object-cover" />
                    )}
                    <span>{article.author_name ?? 'Equipe Mercadoai'}</span>
                    <span>·</span>
                    <span>{article.read_time} min</span>
                    <span>·</span>
                    <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">Nenhum artigo encontrado.</p>
            <Link href="/articles" className="mt-4 inline-block text-orange-500 font-medium hover:underline">
              Ver todos os artigos
            </Link>
          </div>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
    </div>
  )
}
