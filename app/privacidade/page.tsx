import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Política de Privacidade | Mercadoai',
  description: 'Saiba como o Mercadoai coleta, usa e protege seus dados pessoais em conformidade com a LGPD.',
  alternates: { canonical: `${SITE_URL}/privacidade` },
  robots: { index: true, follow: true },
}

export default function PrivacidadePage() {
  return (
    <div className="pt-[104px]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
        <p className="text-sm text-gray-500 mb-10">Última atualização: abril de 2025</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Dados que Coletamos</h2>
            <p className="text-gray-600 leading-relaxed">
              O Mercadoai pode coletar as seguintes informações:
            </p>
            <ul className="mt-3 space-y-1 text-gray-600 list-disc list-inside">
              <li>Endereço de e-mail (quando você se cadastra na newsletter)</li>
              <li>Dados de navegação coletados por cookies e ferramentas de análise</li>
              <li>Informações de dispositivo e IP (para fins de segurança e desempenho)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Como Usamos os Dados</h2>
            <p className="text-gray-600 leading-relaxed">
              Utilizamos suas informações para:
            </p>
            <ul className="mt-3 space-y-1 text-gray-600 list-disc list-inside">
              <li>Enviar a newsletter com ofertas e novidades (somente com seu consentimento)</li>
              <li>Melhorar o desempenho e a experiência do site</li>
              <li>Analisar o comportamento de uso de forma agregada e anônima</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Cookies</h2>
            <p className="text-gray-600 leading-relaxed">
              Utilizamos cookies para melhorar sua experiência de navegação. Você pode desativá-los nas configurações do seu navegador, mas isso pode afetar algumas funcionalidades do site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Compartilhamento de Dados</h2>
            <p className="text-gray-600 leading-relaxed">
              Não vendemos seus dados pessoais a terceiros. Podemos compartilhar informações com parceiros de análise (como Google Analytics) de forma agregada e anônima.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Seus Direitos (LGPD)</h2>
            <p className="text-gray-600 leading-relaxed">
              Em conformidade com a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018), você tem direito a:
            </p>
            <ul className="mt-3 space-y-1 text-gray-600 list-disc list-inside">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir dados incompletos ou incorretos</li>
              <li>Solicitar a exclusão dos seus dados</li>
              <li>Revogar o consentimento a qualquer momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Contato</h2>
            <p className="text-gray-600 leading-relaxed">
              Para exercer seus direitos ou tirar dúvidas sobre privacidade, entre em contato: <a href="mailto:privacidade@mercadoai.com" className="text-orange-500 hover:text-orange-700">privacidade@mercadoai.com</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
