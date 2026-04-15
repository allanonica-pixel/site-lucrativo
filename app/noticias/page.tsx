import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Article } from '@/lib/supabase/types'
import { formatDate } from '@/lib/utils'
import { SITE_URL } from '@/lib/constants'

export const revalidate = 1800

export const metadata: Metadata = {
  title: 'Notícias de Tecnologia — Últimas Novidades | Mercadoai',
  description: 'As últimas notícias sobre tecnologia, lançamentos, promoções e tendências do mercado de produtos.',
  alternates: { canonical: `${SITE_URL}/noticias` },
  openGraph: {
    title: 'Notícias de Tecnologia | Mercadoai',
    description: 'As últimas notícias sobre tecnologia e lançamentos.',
    url: `${SITE_URL}/noticias`,
    siteName: 'Mercadoai',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
}

export default async function NoticiasPage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('type', 'Notícias')
    .order('published_at', { ascending: false })
    .limit(25)

  const destaque = articles?.[0]
  const recentes = articles?.slice(1, 4) ?? []
  const demais = articles?.slice(4) ?? []

  return (
    <div className="pt-[104px]">
      {/* Hero */}
      <div className="bg-gray-950 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-gray-400 mb-4 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <span>/</span>
            <span className="text-white">Notícias</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-rose-500/20 text-rose-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            Notícias
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Últimas Notícias de Tecnologia</h1>
          <p className="text-gray-400 max-w-2xl">
            Fique por dentro dos lançamentos, promoções e tendências do mundo tech.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Destaque + Recentes lado a lado */}
        {destaque && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-12">
            {/* Notícia destaque */}
            <Link
              href={`/artigo/${destaque.slug}`}
              className="lg:col-span-3 group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-rose-200 hover:shadow-md transition-all duration-200"
            >
              {destaque.cover_image && (
                <div className="h-64 overflow-hidden bg-gray-100">
                  <img
                    src={destaque.cover_image}
                    alt={destaque.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}
              <div className="p-6">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 mb-3 inline-block">
                  Destaque
                </span>
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-rose-600 transition-colors mb-2 line-clamp-2">
                  {destaque.title}
                </h2>
                {destaque.excerpt && (
                  <p className="text-gray-500 text-sm line-clamp-3 mb-3">{destaque.excerpt}</p>
                )}
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <span>{destaque.author_name ?? 'Equipe Mercadoai'}</span>
                  <span>·</span>
                  <time dateTime={destaque.published_at}>{formatDate(destaque.published_at)}</time>
                </div>
              </div>
            </Link>

            {/* 3 mais recentes — cards horizontais */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {recentes.map((article: Article) => (
                <Link
                  key={article.id}
                  href={`/artigo/${article.slug}`}
                  className="group flex gap-3 bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-rose-200 hover:shadow-sm transition-all duration-200 p-3"
                >
                  {article.cover_image && (
                    <img
                      src={article.cover_image}
                      alt={article.title}
                      className="w-20 h-16 object-cover object-center rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 group-hover:text-rose-600 transition-colors mb-1">
                      {article.title}
                    </h3>
                    <time className="text-xs text-gray-400" dateTime={article.published_at}>
                      {formatDate(article.published_at)}
                    </time>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Demais notícias */}
        {demais.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demais.map((article: Article) => (
              <Link
                key={article.id}
                href={`/artigo/${article.slug}`}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-rose-200 hover:shadow-md transition-all duration-200"
              >
                {article.cover_image && (
                  <div className="h-44 overflow-hidden bg-gray-100">
                    <img
                      src={article.cover_image}
                      alt={article.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-rose-600 transition-colors">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-3">{article.excerpt}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span>{article.author_name ?? 'Equipe Mercadoai'}</span>
                    <span>·</span>
                    <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!articles?.length && (
          <div className="text-center py-20">
            <p className="text-gray-500">Nenhuma notícia publicada ainda.</p>
          </div>
        )}
      </div>
    </div>
  )
}
