import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Article } from '@/lib/supabase/types'
import { formatDate } from '@/lib/utils'
import { TYPE_COLORS } from '@/constants/categories'
import { SITE_URL } from '@/lib/constants'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Guias de Compra — Como Escolher o Melhor Produto | Mercadoai',
  description: 'Guias completos e imparciais para você tomar a melhor decisão de compra. Comparamos especificações, preços e custo-benefício.',
  alternates: { canonical: `${SITE_URL}/guias` },
  openGraph: {
    title: 'Guias de Compra | Mercadoai',
    description: 'Guias completos para você tomar a melhor decisão de compra.',
    url: `${SITE_URL}/guias`,
    siteName: 'Mercadoai',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
}

export default async function GuiasPage() {
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select('*')
    .eq('type', 'Guia de Compra')
    .order('published_at', { ascending: false })
    .limit(24)

  // Subcategorias com conteúdo
  const subcats = [...new Set((articles ?? []).map((a: Article) => a.subcategory).filter(Boolean))] as string[]

  return (
    <div className="pt-[104px]">
      {/* Hero */}
      <div className="bg-gray-950 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-gray-400 mb-4 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <span>/</span>
            <span className="text-white">Guias de Compra</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-sky-500/20 text-sky-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Guias de Compra
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Como Escolher o Melhor Produto</h1>
          <p className="text-gray-400 max-w-2xl">
            Análises imparciais com especificações detalhadas, comparações de preço e recomendações baseadas em dados reais.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Subcategorias */}
        {subcats.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <Link href="/guias" className="px-4 py-2 rounded-full text-sm font-medium bg-sky-500 text-white">
              Todos
            </Link>
            {subcats.map((sub) => (
              <Link
                key={sub}
                href={`/articles?categoria=Guia de Compra&subcategoria=${encodeURIComponent(sub)}`}
                className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
              >
                {sub}
              </Link>
            ))}
          </div>
        )}

        {/* Grid */}
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: Article) => (
              <Link
                key={article.id}
                href={`/artigo/${article.slug}`}
                className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-sky-200 hover:shadow-md transition-all duration-200"
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
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-700">
                      Guia de Compra
                    </span>
                    {article.subcategory && (
                      <span className="text-xs text-gray-500">{article.subcategory}</span>
                    )}
                  </div>
                  <h2 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-sky-600 transition-colors">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">{article.excerpt}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-400">
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
            <p className="text-gray-500">Nenhum guia publicado ainda. Volte em breve!</p>
          </div>
        )}
      </div>
    </div>
  )
}
