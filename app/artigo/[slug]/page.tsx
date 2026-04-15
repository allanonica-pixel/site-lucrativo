import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { createStaticClient } from '@/lib/supabase/static'
import { Article, Product } from '@/lib/supabase/types'
import { formatBRL } from '@/lib/utils'
import { TYPE_COLORS } from '@/constants/categories'
import { notFound } from 'next/navigation'

export const revalidate = 3600 // ISR: revalida a cada 1 hora

const SITE_URL = 'https://mercadoai.com'
const SITE_NAME = 'MercadoAI'

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data: articles } = await supabase
    .from('articles')
    .select('slug')
    .order('published_at', { ascending: false })
    .limit(100)

  return (articles ?? []).map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const supabase = await createClient()
  const { data: article } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle()

  if (!article) {
    return {
      title: 'Artigo não encontrado | MercadoAI',
      description: 'O artigo solicitado não foi encontrado.',
      robots: { index: false, follow: false },
    }
  }

  const metaTitle = article.meta_title
    ? `${article.meta_title} | ${SITE_NAME}`
    : `${article.title} | ${SITE_NAME}`

  const metaDescription = article.meta_description
    ? article.meta_description.slice(0, 160)
    : article.excerpt
    ? article.excerpt.slice(0, 160)
    : `${article.title} — Leia o ${article.type} completo no ${SITE_NAME}.`

  const metaKeywords = article.meta_keywords
    ? article.meta_keywords
    : `${article.title}, ${article.category}${article.subcategory ? `, ${article.subcategory}` : ''}, ${article.type}, ${SITE_NAME}, melhores produtos, comparar preços`

  const canonicalUrl = `${SITE_URL}/artigo/${params.slug}`
  const publishedDate = new Date(article.published_at).toISOString()
  const modifiedDate = new Date(article.updated_at).toISOString()

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: metaKeywords,
    authors: [{ name: article.author_name ?? SITE_NAME }],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'article',
      title: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      siteName: SITE_NAME,
      locale: 'pt_BR',
      images: article.cover_image
        ? [
            {
              url: article.cover_image,
              width: 1200,
              height: 630,
              alt: article.title,
              type: 'image/jpeg',
            },
          ]
        : [],
      publishedTime: publishedDate,
      modifiedTime: modifiedDate,
      authors: [article.author_name ?? SITE_NAME],
      section: article.category,
      tags: [article.type, article.category],
    },
    twitter: {
      card: article.cover_image ? 'summary_large_image' : 'summary',
      title: metaTitle,
      description: metaDescription,
      images: article.cover_image ? [article.cover_image] : [],
      site: '@mercadoai',
      creator: '@mercadoai',
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    other: {
      'Last-modified': modifiedDate,
    },
  }
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()

  // Buscar o artigo
  const { data: article, error: articleError } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', params.slug)
    .maybeSingle()

  if (articleError || !article) {
    notFound()
  }

  // Buscar produtos relacionados (se houver)
  let featuredProducts: Product[] = []
  if (article.featured_product_ids && article.featured_product_ids.length > 0) {
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', article.featured_product_ids)
      .eq('is_active', true)

    if (!productsError && products) {
      featuredProducts = products
    }
  }

  // Buscar artigos relacionados
  let relatedArticles: Article[] = []
  if (article.related_article_ids && article.related_article_ids.length > 0) {
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select('*')
      .in('id', article.related_article_ids)
      .order('published_at', { ascending: false })

    if (!articlesError && articles) {
      relatedArticles = articles
    }
  }

  // Formatar datas
  const publishedDate = new Date(article.published_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  const modifiedDate = new Date(article.updated_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })

  // Gerar Schema.org JSON-LD para Article
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': article.type === 'Review' ? 'Review' : 'Article',
    headline: article.title,
    description: article.excerpt ?? article.title,
    ...(article.cover_image ? {
      image: {
        '@type': 'ImageObject',
        url: article.cover_image,
        width: 1200,
        height: 630,
      },
    } : {}),
    author: {
      '@type': 'Person',
      name: article.author_name ?? 'MercadoAI',
      ...(article.author_avatar ? { image: article.author_avatar } : {}),
    },
    publisher: {
      '@type': 'Organization',
      name: 'MercadoAI',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
        width: 600,
        height: 60,
      },
    },
    datePublished: article.published_at,
    dateModified: article.updated_at,
    mainEntityOfPage: {
      '@id': `${SITE_URL}/artigo/${params.slug}`,
    },
    ...(article.type === 'Review' ? {
      reviewBody: article.content ?? '',
    } : {}),
  }

  // Gerar Schema.org JSON-LD para BreadcrumbList
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Início',
        'item': `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': article.category,
        'item': `${SITE_URL}/categoria/${encodeURIComponent(article.category)}`,
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': article.title,
        'item': `${SITE_URL}/artigo/${params.slug}`,
      },
    ],
  }

  // Gerar Schema.org JSON-LD para Organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    'name': 'MercadoAI',
    'url': SITE_URL,
    'logo': {
      '@type': 'ImageObject',
      'url': `${SITE_URL}/logo.png`,
      'width': 600,
      'height': 60,
      'caption': 'MercadoAI - Comparativos e Reviews de Produtos',
    },
    'sameAs': [
      `${SITE_URL}`,
      'https://www.facebook.com/mercadoai',
      'https://www.instagram.com/mercadoai',
      'https://www.youtube.com/@mercadoai',
    ],
  }

  return (
    <div className="pt-104">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <a href="/" className="hover:text-gray-900 transition-colors">
                Início
              </a>
            </li>
            <li>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <a href={`/categoria/${encodeURIComponent(article.category)}`} className="hover:text-gray-900 transition-colors">
                {article.category}
              </a>
            </li>
            <li>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="text-gray-900 font-medium">
              {article.title}
            </li>
          </ol>
        </nav>

        <article className="prose prose-lg max-w-none mx-auto">
          <header className="mb-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mb-4">
              {article.category}
            </div>

            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium mb-4">
              <span className={`px-2 py-1 rounded ${TYPE_COLORS[article.type] ?? 'bg-stone-100 text-stone-600'}`}>
                {article.type}
              </span>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-6">{article.title}</h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
              <span>{article.author_name ?? 'MercadoAI'}</span>
              <span>•</span>
              <time dateTime={article.published_at}>{publishedDate}</time>
              <span>•</span>
              <span>{article.read_time} min de leitura</span>
              <span>•</span>
              <span>{article.views} visualizações</span>
            </div>

            {article.excerpt && (
              <p className="text-xl text-gray-600 mb-8">{article.excerpt}</p>
            )}
          </header>

          {/* Cover Image */}
          {article.cover_image && (
            <figure className="mb-12 rounded-lg overflow-hidden shadow-lg">
              <img
                src={article.cover_image}
                alt={article.title}
                className="w-full h-auto object-cover"
                width={1200}
                height={630}
              />
              <figcaption className="text-center text-sm text-gray-500 mt-2">
                {article.title}
              </figcaption>
            </figure>
          )}

          {/* Article Content */}
          <div className="article-content">
            {article.content && (
              <div
                dangerouslySetInnerHTML={{ __html: article.content }}
                className="prose prose-lg max-w-none"
              />
            )}
          </div>

          {/* Featured Products */}
          {featuredProducts.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Produtos em destaque</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300">
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {product.image_url && (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                            width={64}
                            height={64}
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{product.brand}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-lg font-bold text-gray-900">{formatBRL(product.price)}</span>
                            {product.original_price && product.original_price > product.price && (
                              <span className="ml-2 text-sm text-gray-500 line-through">
                                {formatBRL(product.original_price)}
                              </span>
                            )}
                            {product.discount_pct && product.discount_pct > 0 && (
                              <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 text-xs font-bold rounded">
                                -{product.discount_pct}%
                              </span>
                            )}
                          </div>
                          {product.affiliate_url && (
                            <a
                              href={product.affiliate_url}
                              target="_blank"
                              rel="nofollow noopener noreferrer"
                              className="mt-3 inline-flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors"
                            >
                              Ver preço no marketplace
                              <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Related Articles */}
          {relatedArticles.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Leia também</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {relatedArticles.map((a) => (
                  <a
                    key={a.id}
                    href={`/artigo/${a.slug}`}
                    className="group block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      {a.cover_image && (
                        <img
                          src={a.cover_image}
                          alt={a.title}
                          className="w-16 h-16 object-cover rounded-lg"
                          width={64}
                          height={64}
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-600 mb-2">
                          {a.category}
                        </div>
                        <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold mb-2">
                          <span className={`px-2 py-0.5 rounded-full ${TYPE_COLORS[a.type] ?? 'bg-stone-100 text-stone-600'}`}>
                            {a.type}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-stone-800 mt-2 line-clamp-2 group-hover:text-orange-600 transition-colors">
                          {a.title}
                        </p>
                        <p className="text-xs text-stone-400 mt-2 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {a.read_time} min de leitura
                        </p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* Article Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">
                  Última atualização: <time dateTime={article.updated_at}>{modifiedDate}</time>
                </p>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(`${SITE_URL}/artigo/${params.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-500 hover:text-blue-400 transition-colors"
                  aria-label="Compartilhar no X (Twitter)"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
              </div>
            </div>
          </footer>
        </article>
      </div>
    </div>
  )
}