import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Termos de Uso | Mercadoai',
  description: 'Termos de uso do Mercadoai, incluindo política de links de afiliados e responsabilidades.',
  alternates: { canonical: `${SITE_URL}/termos` },
  robots: { index: true, follow: true },
}

export default function TermosPage() {
  return (
    <div className="pt-[104px]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
        <p className="text-sm text-gray-500 mb-10">Última atualização: abril de 2025</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
            <p className="text-gray-600 leading-relaxed">
              Ao acessar e usar o Mercadoai, você concorda com estes Termos de Uso. Se não concordar com algum dos termos, pedimos que não utilize o site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Links de Afiliados</h2>
            <p className="text-gray-600 leading-relaxed">
              O Mercadoai participa de programas de afiliados, incluindo o Programa de Afiliados do Mercado Livre, Amazon, Shopee e outros. Isso significa que podemos receber uma comissão quando você clica em links de produtos e realiza uma compra.
            </p>
            <p className="text-gray-600 leading-relaxed mt-3">
              Esta prática não afeta o preço que você paga pelo produto e não influencia nossas avaliações ou recomendações. Nosso compromisso é sempre com a imparcialidade e a qualidade das informações.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Precisão das Informações</h2>
            <p className="text-gray-600 leading-relaxed">
              Fazemos nosso melhor para manter as informações de preços e disponibilidade atualizadas, mas preços podem mudar a qualquer momento. Sempre verifique o preço final no site do vendedor antes de finalizar a compra.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Propriedade Intelectual</h2>
            <p className="text-gray-600 leading-relaxed">
              Todo o conteúdo do Mercadoai — textos, imagens, logotipos e demais materiais — é de propriedade do Mercadoai ou licenciado por seus respectivos proprietários. É proibida a reprodução sem autorização prévia.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Limitação de Responsabilidade</h2>
            <p className="text-gray-600 leading-relaxed">
              O Mercadoai não se responsabiliza por decisões de compra tomadas com base nas informações do site. As avaliações são baseadas em pesquisas e testes, mas resultados individuais podem variar.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contato</h2>
            <p className="text-gray-600 leading-relaxed">
              Para dúvidas sobre estes termos, entre em contato pelo e-mail: <a href="mailto:contato@mercadoai.com" className="text-orange-500 hover:text-orange-700">contato@mercadoai.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
