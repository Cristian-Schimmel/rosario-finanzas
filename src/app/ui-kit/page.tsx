'use client';

import {
  Button,
  Input,
  Badge,
  VariationBadge,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  SimpleTooltip,
  Skeleton,
  SkeletonCard,
  SkeletonIndicatorCard,
  SkeletonTable,
  Sparkline,
  MiniSparkline,
  IndicatorCard,
  DollarCard,
  Ticker,
  EnhancedTicker,
  DataTable,
  columnRenderers,
  Heatmap,
  MiniHeatmap,
  WeeklyHeatmap,
} from '@/components';
import type { Indicator, TickerItem, TableColumn } from '@/types';
import { designTokens } from '@/lib/design-tokens';
import {
  Search,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  DollarSign,
  BarChart3,
  Newspaper,
  Settings,
  Info,
} from 'lucide-react';

// Sample data
const sampleIndicator: Indicator = {
  id: 'dolar-blue',
  name: 'Dólar Blue',
  shortName: 'USD Blue',
  category: 'cambios',
  value: 1185,
  previousValue: 1175,
  change: 10,
  changePercent: 0.85,
  unit: 'ARS',
  format: 'currency',
  decimals: 0,
  source: 'ambito',
  lastUpdated: new Date().toISOString(),
  frequency: 'realtime',
  sparklineData: [1150, 1155, 1160, 1158, 1170, 1175, 1180, 1185],
};

const sampleIndicatorNegative: Indicator = {
  ...sampleIndicator,
  id: 'riesgo-pais',
  name: 'Riesgo País',
  shortName: 'Riesgo País',
  value: 1850,
  previousValue: 1900,
  change: -50,
  changePercent: -2.63,
  unit: 'pts',
  format: 'number',
  source: 'rava',
  sparklineData: [1950, 1920, 1900, 1880, 1870, 1860, 1855, 1850],
};

const tickerItems: TickerItem[] = [
  { id: '1', label: 'USD Oficial', value: '$1.025', change: '+0.2%', trend: 'up' },
  { id: '2', label: 'USD Blue', value: '$1.185', change: '+0.85%', trend: 'up' },
  { id: '3', label: 'USD MEP', value: '$1.145', change: '-0.3%', trend: 'down' },
  { id: '4', label: 'Riesgo País', value: '1.850', change: '-2.6%', trend: 'down' },
  { id: '5', label: 'Merval', value: '1.825.420', change: '+1.2%', trend: 'up' },
  { id: '6', label: 'BTC', value: '$67.450', change: '+2.1%', trend: 'up' },
  { id: '7', label: 'Soja', value: '$385', change: '-0.5%', trend: 'down' },
  { id: '8', label: 'Inflación', value: '4.2%', trend: 'neutral' },
];

const tableData = [
  { symbol: 'GGAL', name: 'Grupo Financiero Galicia', price: 4850, change: 2.3, volume: 125000000 },
  { symbol: 'YPF', name: 'YPF S.A.', price: 24500, change: -1.2, volume: 89000000 },
  { symbol: 'PAMP', name: 'Pampa Energía', price: 2890, change: 0.8, volume: 45000000 },
  { symbol: 'BMA', name: 'Banco Macro', price: 8900, change: 3.1, volume: 67000000 },
  { symbol: 'TXAR', name: 'Ternium Argentina', price: 1250, change: -0.5, volume: 23000000 },
];

const tableColumns: TableColumn<typeof tableData[0]>[] = [
  { key: 'symbol', header: 'Símbolo', sortable: true },
  { key: 'name', header: 'Nombre' },
  { key: 'price', header: 'Precio', align: 'right', sortable: true, render: columnRenderers.currency() },
  { key: 'change', header: 'Var %', align: 'right', sortable: true, render: columnRenderers.variation },
  { key: 'volume', header: 'Volumen', align: 'right', render: (v) => `${((v as number) / 1000000).toFixed(1)}M` },
];

const heatmapData = [
  { id: '1', label: 'GGAL', value: 2.3 },
  { id: '2', label: 'YPF', value: -1.2 },
  { id: '3', label: 'PAMP', value: 0.8 },
  { id: '4', label: 'BMA', value: 3.1 },
  { id: '5', label: 'TXAR', value: -0.5 },
  { id: '6', label: 'CEPU', value: 1.5 },
  { id: '7', label: 'TECO', value: -2.1 },
  { id: '8', label: 'MIRG', value: 0.3 },
  { id: '9', label: 'SUPV', value: 4.2 },
  { id: '10', label: 'BBAR', value: -0.8 },
];

export default function UIKitPage() {
  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-surface-elevated border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-text-primary">
              Rosario Finanzas
              <span className="ml-2 text-sm font-normal text-text-muted">UI Kit</span>
            </h1>
            <nav className="flex items-center gap-4">
              <a href="/" className="text-sm text-text-secondary hover:text-text-primary">
                Home
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Design Tokens Section */}
        <Section title="Design Tokens" description="Paleta warm/ivory con tokens semánticos">
          {/* Colors */}
          <SubSection title="Colores - Paleta Ivory">
            <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
              {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
                <div key={shade} className="text-center">
                  <div
                    className="w-full aspect-square rounded-lg border border-border-muted"
                    style={{ backgroundColor: `var(--ivory-${shade})` }}
                  />
                  <span className="text-2xs text-text-muted mt-1 block">{shade}</span>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="Colores Semánticos">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorBlock name="Positive" color="var(--positive)" lightColor="var(--positive-light)" />
              <ColorBlock name="Negative" color="var(--negative)" lightColor="var(--negative-light)" />
              <ColorBlock name="Accent" color="var(--accent)" lightColor="var(--accent-light)" />
              <ColorBlock name="Surface" color="var(--surface)" lightColor="var(--surface-elevated)" />
            </div>
          </SubSection>

          {/* Typography */}
          <SubSection title="Tipografía">
            <div className="space-y-4">
              <div>
                <span className="text-2xs text-text-muted uppercase tracking-wider">Display / Headlines</span>
                <h1 className="text-5xl font-bold text-text-primary">Headline 1 - 36px</h1>
                <h2 className="text-4xl font-bold text-text-primary">Headline 2 - 30px</h2>
                <h3 className="text-3xl font-semibold text-text-primary">Headline 3 - 24px</h3>
                <h4 className="text-2xl font-semibold text-text-primary">Headline 4 - 20px</h4>
                <h5 className="text-xl font-medium text-text-primary">Headline 5 - 18px</h5>
              </div>
              <div>
                <span className="text-2xs text-text-muted uppercase tracking-wider">Body</span>
                <p className="text-lg text-text-primary">Body Large - 16px</p>
                <p className="text-base text-text-primary">Body - 14px (default)</p>
                <p className="text-sm text-text-secondary">Body Small - 13px</p>
                <p className="text-xs text-text-muted">Caption - 12px</p>
                <p className="text-2xs text-text-muted">Micro - 10px</p>
              </div>
              <div>
                <span className="text-2xs text-text-muted uppercase tracking-wider">Data / Mono</span>
                <p className="text-2xl font-semibold text-data text-text-primary">$1.185,00 +0.85%</p>
                <p className="text-base font-medium text-data text-text-primary">1.825.420,50</p>
                <p className="text-xs font-medium text-data text-text-muted">BCRA 14:30</p>
              </div>
            </div>
          </SubSection>
        </Section>

        {/* Buttons */}
        <Section title="Botones" description="Variantes y tamaños">
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button isLoading>Loading</Button>
            <Button disabled>Disabled</Button>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <Button leftIcon={<Search className="w-4 h-4" />}>Buscar</Button>
            <Button rightIcon={<ArrowRight className="w-4 h-4" />} variant="secondary">
              Ver más
            </Button>
          </div>
        </Section>

        {/* Inputs */}
        <Section title="Inputs" description="Campos de formulario">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl">
            <Input placeholder="Placeholder" />
            <Input label="Con label" placeholder="Escribí algo..." />
            <Input
              label="Con icono"
              leftIcon={<Search className="w-4 h-4" />}
              placeholder="Buscar..."
            />
            <Input label="Con error" error="Este campo es requerido" />
            <Input label="Con hint" hint="Ingresá tu email" type="email" />
            <Input label="Disabled" disabled value="No editable" />
          </div>
        </Section>

        {/* Badges */}
        <Section title="Badges" description="Estados y variaciones">
          <div className="flex flex-wrap gap-3">
            <Badge>Default</Badge>
            <Badge variant="positive">Positive</Badge>
            <Badge variant="negative">Negative</Badge>
            <Badge variant="accent">Accent</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge size="sm">Small</Badge>
            <Badge size="md">Medium</Badge>
            <Badge size="lg">Large</Badge>
          </div>
          <div className="flex flex-wrap gap-3 mt-4">
            <VariationBadge value={2.5} />
            <VariationBadge value={-1.8} />
            <VariationBadge value={0} />
            <VariationBadge value={15.3} showIcon={false} />
          </div>
        </Section>

        {/* Cards */}
        <Section title="Cards" description="Contenedores de información">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader title="Card Default" description="Con sombra suave" />
              <CardContent>
                <p className="text-sm text-text-secondary">
                  Contenido de la card con estilo warm/ivory.
                </p>
              </CardContent>
            </Card>
            <Card variant="elevated">
              <CardHeader
                title="Card Elevated"
                action={<Badge variant="accent">Nuevo</Badge>}
              />
              <CardContent>
                <p className="text-sm text-text-secondary">Más prominente.</p>
              </CardContent>
              <CardFooter>
                <span className="text-xs text-text-muted">Actualizado hace 5 min</span>
                <Button size="sm" variant="ghost">
                  Ver
                </Button>
              </CardFooter>
            </Card>
            <Card variant="outlined" hoverable>
              <CardHeader title="Card Hoverable" />
              <CardContent>
                <p className="text-sm text-text-secondary">
                  Hover para ver efecto.
                </p>
              </CardContent>
            </Card>
          </div>
        </Section>

        {/* Tabs */}
        <Section title="Tabs" description="Navegación por pestañas">
          <Tabs defaultValue="mercados">
            <TabsList>
              <TabsTrigger value="mercados">Mercados</TabsTrigger>
              <TabsTrigger value="cambios">Cambios</TabsTrigger>
              <TabsTrigger value="cripto" count={12}>
                Cripto
              </TabsTrigger>
              <TabsTrigger value="agro">Agro</TabsTrigger>
            </TabsList>
            <TabsContent value="mercados">
              <Card>
                <CardContent>Contenido de Mercados</CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="cambios">
              <Card>
                <CardContent>Contenido de Cambios</CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="cripto">
              <Card>
                <CardContent>Contenido de Cripto (12 items)</CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="agro">
              <Card>
                <CardContent>Contenido de Agro</CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Section>

        {/* Tooltips */}
        <Section title="Tooltips" description="Información contextual">
          <div className="flex gap-4">
            <SimpleTooltip content="Información adicional">
              <Button variant="secondary">Hover me</Button>
            </SimpleTooltip>
            <SimpleTooltip content="Último dato: 14:30 hs" side="right">
              <span className="flex items-center gap-1 text-sm text-text-secondary cursor-help">
                <Info className="w-4 h-4" /> Con tooltip
              </span>
            </SimpleTooltip>
          </div>
        </Section>

        {/* Skeletons */}
        <Section title="Skeletons" description="Estados de carga">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SkeletonIndicatorCard />
            <SkeletonCard />
            <div className="space-y-2">
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="rectangular" height={100} />
            </div>
          </div>
        </Section>

        {/* Sparklines */}
        <Section title="Sparklines" description="Mini gráficos de tendencia">
          <div className="flex flex-wrap items-center gap-8">
            <div className="text-center">
              <Sparkline
                data={[1150, 1155, 1160, 1158, 1170, 1175, 1180, 1185]}
                width={100}
                height={32}
                trend="up"
              />
              <span className="text-xs text-text-muted mt-1 block">Up trend</span>
            </div>
            <div className="text-center">
              <Sparkline
                data={[1200, 1190, 1185, 1175, 1170, 1165, 1160, 1155]}
                width={100}
                height={32}
                trend="down"
              />
              <span className="text-xs text-text-muted mt-1 block">Down trend</span>
            </div>
            <div className="text-center">
              <Sparkline
                data={[1170, 1175, 1172, 1178, 1175, 1173, 1176, 1175]}
                width={100}
                height={32}
                trend="neutral"
              />
              <span className="text-xs text-text-muted mt-1 block">Neutral</span>
            </div>
            <div className="text-center">
              <MiniSparkline
                data={[1150, 1155, 1160, 1158, 1170, 1175, 1180, 1185]}
                trend="up"
              />
              <span className="text-xs text-text-muted mt-1 block">Mini</span>
            </div>
          </div>
        </Section>

        {/* Indicator Cards */}
        <Section title="Indicator Cards" description="Cards de indicadores financieros">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <IndicatorCard indicator={sampleIndicator} />
            <IndicatorCard indicator={sampleIndicatorNegative} />
            <IndicatorCard indicator={sampleIndicator} size="sm" />
            <DollarCard
              name="Dólar MEP"
              buy={1140}
              sell={1145}
              change={-3.5}
              changePercent={-0.3}
              source="BYMA"
              lastUpdated={new Date().toISOString()}
            />
          </div>
        </Section>

        {/* Ticker */}
        <Section title="Ticker" description="Cinta de cotizaciones animada">
          <div className="space-y-4 -mx-4">
            <Ticker items={tickerItems} speed={30} />
            <EnhancedTicker
              items={tickerItems.map((item) => ({
                ...item,
                sparklineData: [100, 102, 101, 103, 105, 104, 106, 108],
              }))}
              speed={45}
            />
          </div>
        </Section>

        {/* Data Table */}
        <Section title="Data Table" description="Tabla de datos financieros con ordenamiento">
          <Card padding="none">
            <DataTable
              data={tableData}
              columns={tableColumns}
              stickyHeader
              striped
            />
          </Card>
        </Section>

        {/* Heatmap */}
        <Section title="Heatmap" description="Mapa de calor para variaciones">
          <div className="flex flex-wrap gap-8">
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wide mb-2 block">
                Grid Heatmap
              </span>
              <Heatmap data={heatmapData} columns={5} cellSize="md" />
            </div>
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wide mb-2 block">
                Mini Heatmap
              </span>
              <MiniHeatmap data={heatmapData.map((d) => ({ value: d.value }))} />
            </div>
            <div>
              <span className="text-xs text-text-muted uppercase tracking-wide mb-2 block">
                Weekly Performance
              </span>
              <WeeklyHeatmap
                data={[
                  { day: 'Lun', value: 1.2 },
                  { day: 'Mar', value: -0.5 },
                  { day: 'Mie', value: 2.1 },
                  { day: 'Jue', value: 0.3 },
                  { day: 'Vie', value: -1.8 },
                ]}
              />
            </div>
          </div>
        </Section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-text-muted">
          <p>Rosario Finanzas - Design System v1.0</p>
          <p className="mt-1">Paleta warm/ivory • Estilo Bloomberg calmado</p>
        </div>
      </footer>
    </div>
  );
}

// Helper components
function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-text-primary">{title}</h2>
        {description && (
          <p className="text-sm text-text-muted mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

function SubSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </div>
  );
}

function ColorBlock({
  name,
  color,
  lightColor,
}: {
  name: string;
  color: string;
  lightColor: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div
          className="w-12 h-12 rounded-lg border border-border-muted"
          style={{ backgroundColor: color }}
        />
        <div
          className="w-12 h-12 rounded-lg border border-border-muted"
          style={{ backgroundColor: lightColor }}
        />
      </div>
      <span className="text-xs text-text-muted">{name}</span>
    </div>
  );
}
