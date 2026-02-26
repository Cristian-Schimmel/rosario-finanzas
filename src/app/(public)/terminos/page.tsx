import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Términos de Uso | Rosario Finanzas',
  description: 'Términos y condiciones de uso del portal Rosario Finanzas.',
};

export default function TerminosPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-dark mb-4">
          <ArrowLeft className="w-3 h-3" />
          Volver al inicio
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <FileText className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Términos de Uso</h1>
        </div>

        <Card>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-text-secondary dark:text-slate-300">
              <p className="text-xs text-text-muted dark:text-slate-400">Última actualización: Febrero 2026</p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">1. Aceptación de los Términos</h2>
              <p className="text-sm">
                Al acceder y utilizar el sitio web Rosario Finanzas (en adelante, &quot;el Portal&quot;), 
                usted acepta cumplir con estos términos de uso. Si no está de acuerdo con alguna 
                parte de estos términos, le solicitamos que no utilice el sitio.
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">2. Descripción del Servicio</h2>
              <p className="text-sm">
                Rosario Finanzas es un portal informativo que proporciona datos económicos y financieros,
                incluyendo pero no limitado a: cotizaciones del dólar, indicadores del BCRA, precios
                de commodities, criptomonedas, noticias del sector financiero y análisis de mercado enfocados
                en la región de Rosario y Argentina.
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">3. Naturaleza Informativa</h2>
              <p className="text-sm">
                Toda la información publicada en el Portal tiene carácter exclusivamente informativo
                y educativo. <strong>No constituye asesoramiento financiero, recomendación de inversión,
                oferta o solicitud de compra o venta de ningún instrumento financiero.</strong>
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">4. Fuentes de Datos</h2>
              <p className="text-sm">
                Los datos mostrados provienen de fuentes públicas y APIs de terceros, incluyendo:
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>BCRA (Banco Central de la República Argentina) — Tasas, variables monetarias</li>
                <li>INDEC — Índices de precios (vía ArgentinaDatos)</li>
                <li>DolarAPI — Cotizaciones del dólar (no oficial)</li>
                <li>CoinGecko — Precios de criptomonedas</li>
                <li>Yahoo Finance — Datos del mercado bursátil</li>
                <li>ArgentinaDatos.com — Datos de respaldo</li>
              </ul>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">5. Precisión de los Datos</h2>
              <p className="text-sm">
                Si bien nos esforzamos por mantener la información actualizada y precisa, no garantizamos
                la exactitud, completitud o actualidad de los datos. Los datos pueden tener demora
                respecto a los valores en tiempo real de cada mercado. Algunos datos son referenciales
                y se indican como tales en la interfaz.
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">6. Responsabilidad del Usuario</h2>
              <p className="text-sm">
                El usuario es el único responsable de las decisiones financieras que tome basándose
                en la información del Portal. Recomendamos consultar con profesionales financieros
                matriculados antes de tomar decisiones de inversión.
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">7. Propiedad Intelectual</h2>
              <p className="text-sm">
                El contenido editorial, diseño, logotipos y marca &quot;Rosario Finanzas&quot; son propiedad
                del Portal. Los datos de mercado pertenecen a sus respectivas fuentes. Las noticias
                de terceros incluyen atribución a su fuente original.
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">8. Modificaciones</h2>
              <p className="text-sm">
                Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios
                serán efectivos a partir de su publicación en el Portal. El uso continuado del sitio
                después de las modificaciones constituye su aceptación.
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">9. Contacto</h2>
              <p className="text-sm">
                Para consultas sobre estos términos, puede contactarnos a través de los canales
                disponibles en el Portal.
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">10. Legislación Aplicable</h2>
              <p className="text-sm">
                Estos términos se rigen por las leyes de la República Argentina. Cualquier controversia
                será sometida a la jurisdicción de los tribunales ordinarios de la ciudad de Rosario,
                Provincia de Santa Fe.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
