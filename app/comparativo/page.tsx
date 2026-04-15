import type { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Comparison, Product } from '@/lib/supabase/types'
import { formatBRL } from '@/lib/utils'
import { SITE_URL } from '@/lib/constants'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Comparativos de Produtos — Qual é o Melhor? | Mercadoai',
  description: 'Compare produtos lado a lado com análises detalhadas de especificações, preços e custo-benefício para fazer a melhor escolha.',
  alternates: { canonical: `${SITE_URL}/comparativo` },
  openGraph: {
    title: 'Comparativos de Produtos | Mercadoai',
    description: 'Compare produtos lado a lado e encontre o melhor custo-benefício.',
    url: `${SITE_URL}/comparativo`,
    siteName: 'Mercadoai',
    locale: 'pt_BR',
    type: 'website',
  },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
}

export default async function ComparativoPage() {
  const supabase = await createClient()

  const { data: comparisons } = await supabase
    .from('comparisons')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(24)

  // Buscar produtos de todas as comparações para montar os cards
  const allProductIds = [...new Set(
    (comparisons ?? []).flatMap((c: Comparison) => c.product_ids ?? [])
  )]

  type ProductPartial = Pick<Product, 'id' | 'name' | 'image_url' | 'price' | 'marketplace' | 'slug'>
  let productMap: Record<string, ProductPartial> = {}
  if (allProductIds.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, image_url, price, marketplace, slug')
      .in('id', allProductIds)
    ;(products ?? []).forEach((p: ProductPartial) => { productMap[p.id] = p })
  }

  return (
    <div className="pt-[104px]">
      {/* Hero */}
      <div className="bg-gray-950 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="text-sm text-gray-400 mb-4 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Início</Link>
            <span>/</span>
            <span className="text-white">Comparativos</span>
          </nav>
          <div className="inline-flex items-center gap-2 bg-teal-500/20 text-teal-400 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            Comparativos
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Comparativos de Produtos</h1>
          <p className="text-gray-400 max-w-2xl">
            Análises lado a lado com critérios objetivos para você encontrar o melhor custo-benefício.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {comparisons && comparisons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {comparisons.map((comparison: Comparison) => {
              const products = (comparison.product_ids ?? [])
                .slice(0, 3)
                .map((id: string) => productMap[id])
                .filter((p): p is ProductPartial => Boolean(p))
              const winner = comparison.winner_id ? productMap[comparison.winner_id] : null

              return (
                <Link
                  key={comparison.id}
                  href={`/comparar/${comparison.slug}`}
                  className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:border-teal-200 hover:shadow-md transition-all duration-200"
                >
                  {/* Imagens dos produtos em VS */}
                  <div className="p-4 bg-gray-50 flex items-center justify-center gap-2 min-h-[120px]">
                    {products.map((product, idx) => (
                      <div key={product.id} className="flex items-center gap-2">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-16 h-16 object-contain"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center text-xs text-gray-400">
                            Sem imagem
                          </div>
                        )}
                        {idx < products.length - 1 && (
                          <span className="text-xs font-black text-gray-300">VS</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="p-5">
                    {winner && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-xs text-amber-600 font-semibold">
                          Vencedor: {winner.name}
                        </span>
                      </div>
                    )}

                    <h2 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-teal-600 transition-colors">
                      {comparison.title}
                    </h2>

                    {comparison.summary && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">{comparison.summary}</p>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{comparison.product_ids?.length ?? 0} produtos</span>
                      <span>
                        {Object.keys(comparison.criteria ?? {}).length} critérios
                      </span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500">Nenhum comparativo publicado ainda. Volte em breve!</p>
          </div>
        )}
      </div>
    </div>
  )
}
