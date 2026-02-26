import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Disclaimer Financiero | Rosario Finanzas',
  description: 'Descargo de responsabilidad sobre la información financiera publicada en Rosario Finanzas.',
};

export default function DisclaimerPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-dark mb-4">
          <ArrowLeft className="w-3 h-3" />
          Volver al inicio
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Disclaimer Financiero</h1>
        </div>

        {/* Highlighted Warning Box */}
        <Card variant="outlined" className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50 mb-6">
          <CardContent>
            <div className="flex gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-base font-bold text-amber-800 dark:text-amber-300 mb-2">
                  IMPORTANTE: Lea antes de utilizar la información del Portal
                </h2>
                <p className="text-sm text-amber-700 dark:text-amber-400">
                  La información contenida en Rosario Finanzas es de carácter exclusivamente informativo
                  y educativo. <strong>No constituye, bajo ninguna circunstancia, asesoramiento financiero,
                  recomendación de inversión, ni oferta de compra o venta de instrumentos financieros.</strong>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-text-secondary dark:text-slate-300">
              <h2 className="text-lg font-semibold text-text-primary dark:text-white">1. Naturaleza de la Información</h2>
              <p className="text-sm">
                Rosario Finanzas es un portal de información financiera que agrega datos de fuentes
                públicas. La información se presenta con fines informativos y NO debe ser interpretada como:
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>Asesoramiento financiero, legal o impositivo.</li>
                <li>Recomendación de compra, venta o tenencia de activos financieros.</li>
                <li>Oferta o solicitud para transacciones financieras.</li>
                <li>Garantía de rendimiento futuro de ningún instrumento.</li>
              </ul>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">2. Fuentes y Precisión de los Datos</h2>
              <p className="text-sm">
                Los datos se obtienen de las siguientes fuentes:
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li><strong>BCRA:</strong> Datos oficiales del Banco Central. Pueden tener demora en su publicación.</li>
                <li><strong>INDEC:</strong> Índices de precios publicados mensualmente.</li>
                <li><strong>DolarAPI / Ámbito:</strong> Cotizaciones del dólar de fuentes no oficiales. El dólar blue es un mercado informal no regulado.</li>
                <li><strong>CoinGecko:</strong> Precios promedio globales de criptomonedas. Pueden diferir de exchanges locales.</li>
                <li><strong>Yahoo Finance:</strong> Datos bursátiles. Pueden tener demora de 15-20 minutos.</li>
                <li><strong>ArgentinaDatos:</strong> Datos de respaldo que agregan fuentes públicas.</li>
                <li><strong>RSS de medios:</strong> Noticias de terceros con síntesis generada por IA.</li>
              </ul>
              <p className="text-sm">
                <strong>No garantizamos la exactitud, completitud, oportunidad o disponibilidad
                de ningún dato.</strong> Los datos pueden contener errores, omisiones o demoras.
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">3. Datos Referenciales</h2>
              <p className="text-sm">
                Algunos datos se marcan como &quot;referenciales&quot; (bordes punteados, icono de advertencia).
                Estos datos provienen de fuentes de respaldo o son estimaciones y NO deben usarse
                para tomar decisiones financieras. Siempre consulte fuentes oficiales y su agente
                de bolsa (ALyC registrado en CNV) para operar.
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">4. Contenido Generado por IA</h2>
              <p className="text-sm">
                Parte del contenido (resúmenes de noticias, análisis de sentimiento) es generado
                por inteligencia artificial (Google Gemini). Este contenido:
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>Puede contener errores o interpretaciones inexactas.</li>
                <li>No refleja la opinión de Rosario Finanzas.</li>
                <li>Se identifica claramente como &quot;asistido por IA&quot;.</li>
                <li>No debe ser tomado como análisis profesional.</li>
              </ul>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">5. Riesgos de Inversión</h2>
              <p className="text-sm">
                Las inversiones en mercados financieros conllevan riesgos significativos:
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>Las inversiones pueden perder valor parcial o totalmente.</li>
                <li>Rendimientos pasados no garantizan rendimientos futuros.</li>
                <li>Las criptomonedas son activos de alta volatilidad y riesgo.</li>
                <li>El dólar blue opera en un mercado informal no regulado.</li>
                <li>Los commodities están sujetos a volatilidad internacional.</li>
              </ul>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">6. Recomendación</h2>
              <p className="text-sm">
                <strong>Antes de tomar cualquier decisión de inversión, consulte con un profesional
                financiero matriculado.</strong> En Argentina, las operaciones bursátiles deben realizarse
                a través de Agentes de Liquidación y Compensación (ALyC) registrados en la
                Comisión Nacional de Valores (CNV).
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">7. Limitación de Responsabilidad</h2>
              <p className="text-sm">
                Rosario Finanzas, sus desarrolladores, colaboradores y asociados NO serán responsables
                por pérdidas o daños directos, indirectos, incidentales, consecuentes o punitivos
                que resulten del uso o la imposibilidad de uso de la información del Portal.
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">8. Regulación</h2>
              <p className="text-sm">
                Rosario Finanzas NO es un agente de bolsa, asesor financiero registrado, ni entidad
                regulada por la CNV, BCRA o cualquier organismo regulador. El Portal opera
                exclusivamente como medio informativo.
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">9. Aceptación</h2>
              <p className="text-sm">
                Al utilizar Rosario Finanzas, usted reconoce haber leído, comprendido y aceptado
                este disclaimer en su totalidad.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
