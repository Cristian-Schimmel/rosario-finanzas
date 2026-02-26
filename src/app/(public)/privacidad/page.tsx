import { MainLayout } from '@/components/layout';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Shield, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Política de Privacidad | Rosario Finanzas',
  description: 'Política de privacidad y protección de datos personales de Rosario Finanzas.',
};

export default function PrivacidadPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-1 text-xs text-accent hover:text-accent-dark mb-4">
          <ArrowLeft className="w-3 h-3" />
          Volver al inicio
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <Shield className="w-6 h-6 text-accent" />
          <h1 className="text-2xl font-bold text-text-primary dark:text-white">Política de Privacidad</h1>
        </div>

        <Card>
          <CardContent>
            <div className="prose prose-sm dark:prose-invert max-w-none space-y-4 text-text-secondary dark:text-slate-300">
              <p className="text-xs text-text-muted dark:text-slate-400">Última actualización: Febrero 2026</p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">1. Información que Recopilamos</h2>
              <p className="text-sm">
                Rosario Finanzas recopila información limitada para el funcionamiento del Portal:
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li><strong>Datos de navegación:</strong> Dirección IP, tipo de navegador, páginas visitadas, tiempo de permanencia (datos anónimos de analytics).</li>
                <li><strong>Preferencias del usuario:</strong> Modo oscuro/claro almacenado localmente en su navegador (localStorage).</li>
                <li><strong>Datos de registro (solo administradores):</strong> Email y contraseña cifrada para acceso al panel de administración.</li>
              </ul>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">2. Uso de la Información</h2>
              <p className="text-sm">
                La información recopilada se utiliza exclusivamente para:
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>Mejorar la experiencia de navegación del Portal.</li>
                <li>Generar estadísticas anónimas de uso.</li>
                <li>Gestionar el acceso al panel de administración.</li>
                <li>Garantizar la seguridad del servicio.</li>
              </ul>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">3. Cookies y Almacenamiento Local</h2>
              <p className="text-sm">
                El Portal utiliza:
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li><strong>Cookies de sesión:</strong> Para autenticación de administradores (NextAuth.js JWT).</li>
                <li><strong>localStorage:</strong> Para guardar preferencias de tema (claro/oscuro).</li>
                <li><strong>Caché del navegador:</strong> Para mejorar tiempos de carga de datos financieros.</li>
              </ul>
              <p className="text-sm">
                No utilizamos cookies de tracking de terceros ni publicidad programática con seguimiento.
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">4. Compartir Información</h2>
              <p className="text-sm">
                <strong>No vendemos, comercializamos ni transferimos su información personal a terceros.</strong> Los
                datos anónimos de navegación pueden ser procesados por servicios de analytics para
                fines estadísticos.
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">5. Seguridad</h2>
              <p className="text-sm">
                Implementamos medidas de seguridad estándar de la industria:
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>Contraseñas cifradas con bcrypt.</li>
                <li>Sesiones con tokens JWT firmados.</li>
                <li>Comunicaciones cifradas mediante HTTPS.</li>
                <li>Acceso restringido al panel de administración por roles.</li>
              </ul>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">6. Derechos del Usuario</h2>
              <p className="text-sm">
                De acuerdo con la Ley 25.326 de Protección de Datos Personales de Argentina, usted tiene
                derecho a:
              </p>
              <ul className="text-sm list-disc pl-5 space-y-1">
                <li>Acceder a sus datos personales almacenados.</li>
                <li>Solicitar la rectificación de datos inexactos.</li>
                <li>Solicitar la eliminación de sus datos.</li>
                <li>Oponerse al tratamiento de sus datos.</li>
              </ul>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">7. Menores de Edad</h2>
              <p className="text-sm">
                El Portal no está dirigido a menores de 18 años. No recopilamos conscientemente
                información de menores de edad.
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">8. Modificaciones</h2>
              <p className="text-sm">
                Esta política puede ser actualizada periódicamente. Le notificaremos de cambios
                significativos mediante un aviso visible en el Portal.
              </p>

              <h2 className="text-lg font-semibold text-text-primary dark:text-white">9. Contacto</h2>
              <p className="text-sm">
                Para ejercer sus derechos o consultas sobre privacidad, puede contactarnos
                a través de los canales disponibles en el Portal.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
