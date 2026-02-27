/**
 * News Processor
 * Main orchestrator that:
 * 1. Fetches news from RSS feeds
 * 2. Scrapes full content
 * 3. Generates AI summaries
 * 4. Saves to JSON store
 *
 * EDITORIAL POLICY: Only finance, economy, agribusiness markets,
 * crypto, and companies listed on Argentine stock exchanges.
 * Priority: Rosario and zone of influence.
 */

import { scraperManager } from '../scrapers';
import { scrapeArticleContent } from './content-scraper';
import { generateAISummary, isAIAvailable, checkArticleRelevanceWithAI } from './ai-summarizer';
import { 
  upsertArticles, 
  getProcessedArticles, 
  isArticleProcessed,
  getStoreInfo,
  areTitlesSimilar
} from './json-store';
import type { ProcessedNews, ProcessingResult } from './types';
import type { ScrapedArticle } from '../scrapers/types';

// Processing configuration
const CONFIG = {
  maxArticles: 30,
  batchSize: 5,
  delayBetweenBatches: 2000,
  maxContentRetries: 2,
  maxArticleAgeHours: 72, // Discard articles older than 3 days
};

// ============================================================
// STRICT EXCLUSION LIST
// Any article whose title+excerpt contains these words is rejected
// ============================================================
const EXCLUSION_KEYWORDS = [
  // Gastronomía / alimentos no-finanzas
  'restaurante', 'pulpería', 'receta', 'cocina', 'chef', 'gastronomía', 'gastronómico',
  'gastronomico', 'sommelier', 'vino tinto', 'maridaje', 'menú degustación',
  // Turismo
  'turismo', 'vacaciones', 'hotel', 'hospedaje', 'playa', 'escapada', 'all inclusive',
  // Deportes
  'fútbol', 'partido de', 'gol de', 'selección argentina de fútbol', 'messi',
  'boca juniors', 'river plate', 'racing club', 'copa américa', 'mundial de fútbol',
  'champions league', 'eliminatorias', 'superliga', 'liga profesional',
  'basketball', 'básquet', 'rugby', 'tenis', 'olimpiadas', 'juegos olímpicos',
  // Entretenimiento / farándula
  'farándula', 'espectáculo', 'actriz', 'actor', 'película', 'serie de tv',
  'televisión', 'netflix', 'streaming', 'celebrity', 'celebridad', 'famoso',
  'reality show', 'gran hermano', 'telenovela', 'cantante', 'reggaeton',
  // Astrología / horóscopos
  'horóscopo', 'astrología', 'signo del', 'zodíaco',
  // Clima / meteorología (no finanzas)
  'clima hoy', 'pronóstico del tiempo', 'temperatura máxima', 'tormenta eléctrica',
  'lluvia hoy', 'alerta meteorológica',
  // Cultura / Arte / Música
  'gardel', 'tango', 'museo', 'exposición de arte', 'concierto', 'recital',
  'festival de música', 'obra de teatro',
  // Naturaleza / Ciencia no financiera
  'medusa', 'ballena', 'tiburón', 'delfín', 'fauna silvestre', 'flora',
  'especie en peligro', 'océano', 'submarino', 'expedición científica',
  'descubrimiento científico', 'ecosistema', 'dinosaurio', 'fósil',
  'paleontología', 'arqueología', 'volcán', 'terremoto', 'tsunami',
  // Salud no económica
  'enfermedad', 'virus', 'vacuna contra', 'hospital', 'tratamiento médico',
  'cirugía', 'diagnóstico', 'influenza aviar', 'gripe aviar', 'pandemia',
  // Política pura (sin contenido económico)
  'elecciones municipales', 'campaña electoral', 'candidato a intendente',
  'paro general', 'marcha de', 'manifestación', 'protesta social',
  'derechos humanos', 'detención de', 'cárcel', 'prisión domiciliaria',
  // Educación / historias de vida
  'aula rural', 'escuela rural', 'profesor de', 'maestro de', 'docente',
  'historia de vida', 'la historia de', 'apasionado',
  // Jardinería / huerta doméstica / técnicas agrícolas no comerciales
  'eliminar las malezas', 'huerta en casa', 'jardín', 'plantas ornamentales',
  'compostar', 'abono casero', 'estiércol', 'mejorar los suelos',
  // Efemérides
  'efeméride', 'aniversario de', 'día internacional de', 'día nacional de',
  // Contenido clickbait / filler genérico de cotización por ciudad
  'dólar blue en córdoba', 'dólar blue en mendoza', 'dólar blue en tucumán',
  'dólar blue en salta', 'dólar blue en neuquén', 'dólar blue en mar del plata',
  'dólar hoy en córdoba', 'dólar hoy en mendoza', 'dólar hoy en tucumán',
  'elon musk', 'trump dice', 'papa francisco',
  // Crimen / seguridad (no finanzas)
  'sicarios', 'sicario', 'narcotráfico', 'asesinato', 'homicidio', 'secuestro',
  'captura a grupo', 'crimen organizado', 'femicidio',
  // Animal / salud animal no-negocio
  'vacunos en riesgo', 'se empezaron a morir', 'animales muertos',
  'maltrato animal', 'rescate de animales',
  // Inundaciones / desastres no económicos
  'bajaron las aguas', 'inundación', 'evacuados',
  // Contenido en vivo genérico / política pura
  'en vivo: las últimas medidas', 'minuto a minuto',
  // Riesgo país / dólar filler de Infocampo (solo título genérico sin análisis)
  'riesgo país hoy', 'dólar hoy :',
  // Clima / tormentas (no afectación económica concreta)
  'tormentas severas', 'tormenta severa', 'granizo', 'alerta naranja',
  'alerta amarilla', 'viento fuerte',
  // Filler de cotización diaria genérica (no análisis)
  'dólar cripto hoy', 'dólar cripto (usdt) hoy', 'precio y cotización de este',
  'última cotización y su impacto',
];

// ============================================================
// MANDATORY FINANCE/ECONOMY KEYWORDS
// Every article MUST contain at least one of these to pass
// ============================================================
const FINANCE_KEYWORDS = [
  // Moneda y tipo de cambio
  'dólar', 'dolar', 'peso argentino', 'tipo de cambio', 'cotización', 'cotizacion',
  'devaluación', 'devaluacion', 'brecha cambiaria', 'cepo', 'mep', 'ccl',
  'contado con liquidación', 'contado con liqui', 'blue',
  // Inflación y precios
  'inflación', 'inflacion', 'ipc', 'precios', 'deflación', 'costo de vida',
  // Tasas e instrumentos financieros
  'tasa de interés', 'tasa de interes', 'plazo fijo', 'leliq', 'bono', 'bonos',
  'letra', 'letras del tesoro', 'licitación', 'on ', 'obligación negociable',
  'riesgo país', 'riesgo pais', 'spread',
  // Bolsa y mercados
  'merval', 'byma', 'bolsa', 'acciones', 'acción', 'cedear', 'adr',
  'wall street', 'nasdaq', 'dow jones', 's&p 500', 's&p merval',
  'mercado bursátil', 'mercado de capitales', 'inversión', 'inversion',
  'inversor', 'rendimiento', 'rally', 'bear market', 'bull market',
  // Banco Central y política monetaria
  'bcra', 'banco central', 'reservas', 'base monetaria', 'política monetaria',
  'encaje', 'emisión monetaria',
  // Economía macro
  'pbi', 'pib', 'producto bruto', 'déficit', 'superávit', 'fiscal',
  'recaudación', 'recaudacion', 'presupuesto', 'gasto público', 'deuda externa',
  'deuda pública', 'fmi', 'fondo monetario',
  // Comercio exterior
  'exportación', 'exportacion', 'importación', 'importacion', 'retenciones',
  'aranceles', 'balanza comercial', 'superávit comercial',
  // Commodities agro (mercados)
  'soja', 'maíz', 'maiz', 'trigo', 'girasol', 'commodities', 'granos',
  'oleaginosas', 'chicago', 'matba', 'rofex', 'precio del', 'mercado de granos',
  'cosecha gruesa', 'cosecha fina', 'campaña agrícola',
  // Ganadería/lácteos como negocio
  'precio de la carne', 'precio del ganado', 'hacienda', 'feedlot',
  'precio de la leche', 'lácteo',
  // Empresas que cotizan en bolsa Argentina
  'ypf', 'pampa energía', 'pampa energia', 'galicia', 'banco macro',
  'supervielle', 'bbva argentina', 'telecom argentina', 'cresud',
  'arcor', 'molinos', 'ledesma', 'aluar', 'ternium', 'tenaris',
  'loma negra', 'edenor', 'transener', 'central puerto', 'irsa',
  'comercial del plata', 'mirgor', 'holcim', 'globant', 'mercadolibre',
  'despegar', 'bioceres', 'vista energy', 'vista oil',
  // Economía regional Rosario/Santa Fe
  'rosario', 'rosarino', 'bolsa de comercio de rosario', 'bcr',
  'puerto san martín', 'general lagos', 'timbúes', 'san lorenzo',
  'zona núcleo', 'zona nucleo', 'pampa húmeda',
  // Criptomonedas
  'bitcoin', 'btc', 'ethereum', 'eth', 'cripto', 'criptomoneda',
  'blockchain', 'stablecoin', 'usdt', 'usdc', 'defi', 'altcoin',
  'exchange', 'binance', 'mining', 'halving', 'nft',
  // Finanzas personales
  'ahorro', 'crédito hipotecario', 'crédito uva', 'tarjeta de crédito',
  'fintech', 'billetera virtual', 'pago digital', 'qr',
  // Energía como sector económico
  'vaca muerta', 'gas natural', 'petróleo', 'barril', 'energía renovable',
  'litio', 'hidrógeno verde', 'glp',
  // Instituciones/reguladores
  'cnv', 'comisión nacional de valores', 'uba economía', 'indec',
  'ministerio de economía',
  // Agro-exportación / agroindustria como negocio
  'agroindustria', 'agroindustrial', 'agroexportación', 'agroexportador',
  'molienda', 'crushing', 'embarque', 'terminal portuaria', 'puerto',
  'expoagro', 'agroactiva', 'feria ganadera',
];

// ============================================================
// RELEVANCE KEYWORDS for priority scoring (Rosario > Argentina > Finance)
// ============================================================
const RELEVANCE_KEYWORDS = {
  rosario: [
    'rosario', 'rosarino', 'santa fe', 'santafesino', 'litoral',
    'paraná', 'venado tuerto', 'rafaela', 'casilda', 'arroyo seco',
    'puerto san martín', 'bcr', 'bolsa de comercio de rosario',
    'san lorenzo', 'general lagos', 'timbúes', 'zona núcleo',
    'zona nucleo', 'agroactiva', 'matba', 'rofex',
  ],
  argentina: [
    'bcra', 'banco central', 'argentina', 'milei', 'caputo', 'sturzenegger',
    'merval', 'byma', 'ypf', 'pampa energía', 'galicia', 'macro',
    'supervielle', 'bbva', 'telecom', 'cresud', 'arcor', 'molinos',
    'ledesma', 'aluar', 'ternium', 'tenaris', 'loma negra', 'edenor',
    'globant', 'mercadolibre', 'bioceres', 'vista energy', 'cnv', 'indec',
  ],
  finance: [
    'dólar', 'dolar', 'inflación', 'retenciones', 'exportación',
    'importación', 'commodities', 'soja', 'maíz', 'trigo', 'girasol',
    'bitcoin', 'ethereum', 'cripto', 'merval', 'bonos', 'acciones',
    'riesgo país', 'tasa de interés', 'plazo fijo', 'reservas',
  ],
};

/**
 * Check if an article is relevant to a finance/economy portal.
 * THREE-STEP FILTER:
 * 1. Reject if contains exclusion keywords
 * 2. Reject if too old (>72h / 3 days)
 * 3. REQUIRE at least one finance keyword (no exceptions)
 */
export function isArticleRelevant(article: ScrapedArticle): boolean {
  const text = `${article.title} ${article.excerpt}`.toLowerCase();
  
  // STEP 1: Hard exclude — always reject these topics
  for (const keyword of EXCLUSION_KEYWORDS) {
    if (text.includes(keyword)) {
      console.log(`[NewsProcessor] ❌ Excluded: "${article.title.slice(0, 50)}..." (keyword: ${keyword})`);
      return false;
    }
  }
  
  // STEP 2: Age check — reject articles older than 3 days
  const articleAge = Date.now() - article.publishedAt.getTime();
  const maxAge = CONFIG.maxArticleAgeHours * 60 * 60 * 1000;
  if (articleAge > maxAge) {
    console.log(`[NewsProcessor] ❌ Too old: "${article.title.slice(0, 50)}..." (${Math.round(articleAge / 3600000)}h)`);
    return false;
  }
  
  // STEP 3: MANDATORY — must contain at least one finance/economy keyword
  const hasFinanceKeyword = FINANCE_KEYWORDS.some(kw => text.includes(kw));
  
  if (!hasFinanceKeyword) {
    console.log(`[NewsProcessor] ❌ No finance relevance: "${article.title.slice(0, 50)}..."`);
    return false;
  }
  
  console.log(`[NewsProcessor] ✅ Relevant: "${article.title.slice(0, 50)}..." [${article.category}]`);
  return true;
}

/**
 * Calculate priority score with Rosario boost
 */
function calculateRelevancePriority(article: ScrapedArticle): number {
  let priority = article.priority || 5;
  const text = `${article.title} ${article.excerpt}`.toLowerCase();
  
  // Highest boost for Rosario/region mentions (+10)
  for (const keyword of RELEVANCE_KEYWORDS.rosario) {
    if (text.includes(keyword)) {
      priority += 10;
      break;
    }
  }
  
  // Medium boost for Argentina companies/institutions (+5)
  for (const keyword of RELEVANCE_KEYWORDS.argentina) {
    if (text.includes(keyword)) {
      priority += 5;
      break;
    }
  }
  
  // Small boost for crypto content (+3)
  const cryptoKw = ['bitcoin', 'ethereum', 'cripto', 'blockchain', 'btc', 'eth'];
  for (const keyword of cryptoKw) {
    if (text.includes(keyword)) {
      priority += 3;
      break;
    }
  }
  
  return priority;
}

/**
 * Balance articles across categories so no single category dominates.
 * Takes the top N articles from each category sorted by priority+date.
 */
function balanceByCategory(articles: ScrapedArticle[], maxPerCategory: number): ScrapedArticle[] {
  // Group by category
  const byCategory = new Map<string, ScrapedArticle[]>();
  for (const article of articles) {
    const cat = article.category.toLowerCase();
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(article);
  }
  
  // For each category, sort by priority desc then date desc, take top N
  const balanced: ScrapedArticle[] = [];
  const entries = Array.from(byCategory.entries());
  for (let i = 0; i < entries.length; i++) {
    const cat = entries[i][0];
    const catArticles: ScrapedArticle[] = entries[i][1];
    catArticles.sort((a: ScrapedArticle, b: ScrapedArticle) => {
      const pDiff = (b.priority || 0) - (a.priority || 0);
      if (pDiff !== 0) return pDiff;
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });
    const limited = catArticles.slice(0, maxPerCategory);
    balanced.push(...limited);
    if (catArticles.length > maxPerCategory) {
      console.log(`[NewsProcessor] Category "${cat}": capped from ${catArticles.length} to ${maxPerCategory}`);
    }
  }
  
  return balanced;
}

/**
 * Process a single article: scrape content + generate AI summary
 */
async function processArticle(article: ScrapedArticle): Promise<ProcessedNews> {
  const startTime = Date.now();
  console.log(`[NewsProcessor] Processing: ${article.title.slice(0, 50)}...`);

  // Create base processed article with recalculated priority
  const adjustedPriority = calculateRelevancePriority(article);
  
  const processed: ProcessedNews = {
    id: article.id,
    title: article.title,
    header: article.excerpt,
    originalContent: '',
    aiSummary: article.excerpt, // Fallback
    aiKeyPoints: [],
    sourceImageUrl: article.imageUrl, // Keep original RSS/scraper image
    aiImageUrl: undefined, // Will be set to fallback if needed
    sourceUrl: article.url,
    sourceName: article.source.name,
    sourceId: article.source.id,
    category: article.category,
    priority: adjustedPriority,
    publishedAt: article.publishedAt.toISOString(),
    processedAt: new Date().toISOString(),
    isProcessed: false,
  };

  try {
    // Step 0: AI Relevance Check (Semantic Filter)
    if (isAIAvailable()) {
      const relevance = await checkArticleRelevanceWithAI(
        article.title,
        article.excerpt,
        article.category
      );
      
      if (!relevance.isRelevant) {
        console.log(`[NewsProcessor] 🤖 AI Rejected: "${article.title.slice(0, 50)}..." Reason: ${relevance.reason}`);
        processed.processingError = `AI Rejected: ${relevance.reason}`;
        // Mark as processed so we don't retry it, but it will be filtered out by getProcessedArticles
        processed.isProcessed = true; 
        return processed; // Skip further processing
      }
    }

    // Step 1: Scrape full content and og:image
    let fullContent = '';
    let scrapedImageUrl: string | undefined;
    
    for (let attempt = 0; attempt < CONFIG.maxContentRetries; attempt++) {
      const scraped = await scrapeArticleContent(article.url);
      if (scraped.success && scraped.content.length > 200) {
        fullContent = scraped.content;
        scrapedImageUrl = scraped.imageUrl;
        break;
      }
      // Even if content failed, capture the image
      if (scraped.imageUrl && !scrapedImageUrl) {
        scrapedImageUrl = scraped.imageUrl;
      }
      if (attempt < CONFIG.maxContentRetries - 1) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    processed.originalContent = fullContent;
    
    // Use scraped og:image if RSS didn't have one
    if (scrapedImageUrl && (!processed.sourceImageUrl || processed.sourceImageUrl.includes('unsplash'))) {
      processed.sourceImageUrl = scrapedImageUrl;
    }

    // Step 2: Generate AI summary (only if we have content or a good excerpt)
    if (isAIAvailable() && (fullContent.length > 100 || article.excerpt.length > 50)) {
      const summaryResult = await generateAISummary(
        article.title,
        article.excerpt,
        fullContent,
        article.category,
        article.source.name
      );

      if (summaryResult.success) {
        processed.aiSummary = summaryResult.summary;
        processed.aiKeyPoints = summaryResult.keyPoints;
        
        // Use AI cleaned title and excerpt if available
        if (summaryResult.cleanTitle) {
          processed.title = summaryResult.cleanTitle;
        }
        if (summaryResult.cleanExcerpt) {
          processed.header = summaryResult.cleanExcerpt;
        }
        
        processed.isProcessed = true;
        console.log(`[NewsProcessor] ✅ AI summary generated (${Date.now() - startTime}ms)`);
      } else {
        processed.processingError = summaryResult.error;
        console.log(`[NewsProcessor] ⚠️ AI failed, using fallback: ${summaryResult.error}`);
      }
    } else {
      processed.processingError = 'No content or AI unavailable';
    }

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    processed.processingError = errorMsg;
    console.error(`[NewsProcessor] ❌ Error processing article:`, errorMsg);
  }

  return processed;
}

/**
 * Process all new articles from RSS feeds
 */
export async function processAllNews(): Promise<ProcessingResult> {
  const startTime = Date.now();
  console.log('[NewsProcessor] Starting news processing...');

  const result: ProcessingResult = {
    success: false,
    processedCount: 0,
    errorCount: 0,
    errors: [],
    duration: 0,
  };

  try {
    // Step 1: Invalidate scraper cache and fetch fresh news from RSS
    console.log('[NewsProcessor] Invalidating scraper cache and fetching fresh news from RSS feeds...');
    scraperManager.invalidateCache();
    const scrapedArticles = await scraperManager.fetchAllNews();
    console.log(`[NewsProcessor] Found ${scrapedArticles.length} articles from RSS`);

    // Step 2: Filter by relevance (categories + keywords for Rosario/Argentina finance)
    const relevantArticles = scrapedArticles.filter(isArticleRelevant);
    console.log(`[NewsProcessor] ${relevantArticles.length} relevant articles (finance/economy/agro/Rosario)`);

    // Step 2.5: Balance categories — cap each category to avoid one dominating
    const MAX_PER_CATEGORY = 8;
    const balancedArticles = balanceByCategory(relevantArticles, MAX_PER_CATEGORY);
    console.log(`[NewsProcessor] ${balancedArticles.length} after category balancing (max ${MAX_PER_CATEGORY}/cat)`);

    // Step 3: Filter out already processed articles and fuzzy duplicates
    const newArticles: ScrapedArticle[] = [];
    const existingArticles = await getProcessedArticles();
    
    for (const article of balancedArticles) {
      const alreadyProcessed = await isArticleProcessed(article.id);
      if (alreadyProcessed) continue;
      
      // Check for fuzzy duplicates against already processed articles
      const isFuzzyDupExisting = existingArticles.some(ex => areTitlesSimilar(ex.title, article.title));
      if (isFuzzyDupExisting) {
        console.log(`[NewsProcessor] 🔄 Skipping duplicate (fuzzy match with existing): "${article.title.slice(0, 50)}..."`);
        continue;
      }
      
      // Check for fuzzy duplicates within the current batch of new articles
      const isFuzzyDupNew = newArticles.some(newArt => areTitlesSimilar(newArt.title, article.title));
      if (isFuzzyDupNew) {
        console.log(`[NewsProcessor] 🔄 Skipping duplicate (fuzzy match within batch): "${article.title.slice(0, 50)}..."`);
        continue;
      }
      
      newArticles.push(article);
    }
    console.log(`[NewsProcessor] ${newArticles.length} new articles to process`);

    // Step 4: Sort by priority (Rosario-boosted) and limit
    const articlesToProcess = newArticles
      .map(a => ({ ...a, priority: calculateRelevancePriority(a) }))
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .slice(0, CONFIG.maxArticles);

    // Step 5: Process in batches
    const processedArticles: ProcessedNews[] = [];

    for (let i = 0; i < articlesToProcess.length; i += CONFIG.batchSize) {
      const batch = articlesToProcess.slice(i, i + CONFIG.batchSize);
      console.log(`[NewsProcessor] Processing batch ${Math.floor(i / CONFIG.batchSize) + 1}/${Math.ceil(articlesToProcess.length / CONFIG.batchSize)}`);

      const batchResults = await Promise.all(
        batch.map(article => processArticle(article))
      );

      for (const processed of batchResults) {
        processedArticles.push(processed);
        if (processed.processingError?.startsWith('AI Rejected')) {
          // AI-rejected articles are saved but don't count as errors
          console.log(`[NewsProcessor] 🤖 Filtered: ${processed.title.slice(0, 40)}...`);
        } else if (processed.isProcessed) {
          result.processedCount++;
        } else {
          result.errorCount++;
          if (processed.processingError) {
            result.errors.push(`${processed.title.slice(0, 30)}: ${processed.processingError}`);
          }
        }
      }

      // Delay between batches to avoid rate limiting
      if (i + CONFIG.batchSize < articlesToProcess.length) {
        await new Promise(r => setTimeout(r, CONFIG.delayBetweenBatches));
      }
    }

    // Step 6: Always purge articles older than 3 days first
    const { purgeOldArticles } = await import('./json-store');
    await purgeOldArticles(CONFIG.maxArticleAgeHours);

    // Step 7: Save new articles to DB (merge with existing, old ones fall off)
    if (processedArticles.length > 0) {
      await upsertArticles(processedArticles, CONFIG.maxArticles);
    }

    result.success = true;
    result.duration = Date.now() - startTime;

    console.log(`[NewsProcessor] ✅ Completed in ${result.duration}ms`);
    console.log(`[NewsProcessor] Processed: ${result.processedCount}, Errors: ${result.errorCount}`);

  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    result.errors.push(`Fatal error: ${errorMsg}`);
    console.error('[NewsProcessor] ❌ Fatal error:', errorMsg);
  }

  return result;
}

/**
 * Get all processed news from store
 */
export async function getProcessedNews(): Promise<ProcessedNews[]> {
  return await getProcessedArticles();
}

/**
 * Get processing status
 */
export async function getProcessingStatus(): Promise<{
  isAIAvailable: boolean;
  storeInfo: Awaited<ReturnType<typeof getStoreInfo>>;
}> {
  return {
    isAIAvailable: isAIAvailable(),
    storeInfo: await getStoreInfo(),
  };
}

/**
 * Force reprocess all articles (clears cache and processes fresh)
 */
export async function forceReprocess(): Promise<ProcessingResult> {
  const { clearStore } = await import('./json-store');
  await clearStore();
  return await processAllNews();
}
