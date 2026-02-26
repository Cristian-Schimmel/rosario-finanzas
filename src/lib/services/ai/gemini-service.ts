/**
 * Google AI (Gemini) Service
 * Provides AI-powered news synthesis and image generation
 */

import { cache } from '../cache';

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

// Cache TTL for AI-generated content (1 hour)
const AI_CACHE_TTL = 60 * 60;

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
}

interface NewsSummary {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  relevance: string;
}

/**
 * Generate a professional summary of a news article
 */
export async function generateNewsSummary(
  title: string,
  content: string,
  source: string
): Promise<NewsSummary | null> {
  const cacheKey = `ai:summary:${hashString(title)}`;
  const cached = cache.get<NewsSummary>(cacheKey);
  
  if (cached) {
    console.log('[AI] Returning cached summary');
    return cached;
  }

  if (!GOOGLE_AI_API_KEY) {
    console.error('[AI] Google AI API key not configured');
    return null;
  }

  try {
    const prompt = `Eres un analista financiero senior de "Rosario Finanzas", el portal líder de información financiera, bursátil y agroindustrial de Argentina.

## TU AUDIENCIA:
- Inversores de bolsa (MERVAL, CEDEARs, bonos)
- Productores y empresarios agroindustriales
- Traders y operadores financieros
- Empresarios PyME buscando información de mercado
- Profesionales de finanzas corporativas

## LA NOTICIA A ANALIZAR:
TÍTULO: ${title}
FUENTE: ${source}
CONTENIDO: ${content || 'No disponible - analizar basándose en el título'}

## TU TAREA:
Genera un análisis profesional y completo que incluya:
1. RESUMEN EJECUTIVO: Síntesis clara de 150-200 palabras explicando qué pasó, por qué importa y cuáles son las implicancias
2. PUNTOS CLAVE: 4-5 puntos destacados con datos concretos
3. ANÁLISIS DE IMPACTO: Cómo afecta a inversores, al agro, al dólar o a los mercados
4. SENTIMIENTO: Si la noticia es positiva, negativa o neutral para los mercados argentinos

## CONTEXTO ARGENTINO IMPORTANTE:
- Considera el impacto en el dólar (oficial, blue, MEP, CCL)
- Relaciona con commodities agrícolas si aplica (soja, maíz, trigo)
- Menciona efectos en el MERVAL o bonos si es relevante
- Usa terminología que los inversores argentinos entienden

Responde EXACTAMENTE en este formato JSON (sin markdown, solo JSON puro):
{
  "summary": "[Resumen ejecutivo de 150-200 palabras. Incluir contexto, causas, consecuencias y perspectiva. Usar datos concretos cuando estén disponibles. Tono profesional pero accesible para todo inversor.]",
  "keyPoints": ["[Punto 1 con dato concreto]", "[Punto 2 con impacto específico]", "[Punto 3 con contexto]", "[Punto 4 con implicancia]", "[Punto 5 opcional]"],
  "sentiment": "positive|negative|neutral",
  "relevance": "[2-3 oraciones explicando por qué esta noticia es importante para inversores, productores agrícolas o empresarios argentinos. Ser específico sobre el impacto esperado.]"
}`;

    const response = await fetch(
      `${GEMINI_API_URL}/gemini-2.0-flash:generateContent?key=${GOOGLE_AI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('[AI] Gemini API error:', error);
      return null;
    }

    const data: GeminiResponse = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error('[AI] Empty response from Gemini');
      return null;
    }

    // Parse JSON response (handle potential markdown wrapping)
    const jsonStr = text.replace(/```json\n?|\n?```/g, '').trim();
    const summary = JSON.parse(jsonStr) as NewsSummary;

    // Cache the result
    cache.set(cacheKey, summary, AI_CACHE_TTL);

    return summary;
  } catch (error) {
    console.error('[AI] Error generating summary:', error);
    return null;
  }
}

/**
 * Generate an image prompt for news illustration
 */
export async function generateImagePrompt(title: string, category: string): Promise<string> {
  const prompts: Record<string, string> = {
    economia: `Professional financial illustration for: "${title}". Style: Modern minimalist, warm tones (ivory, brown), no text, abstract data visualization elements, Argentine economic theme.`,
    mercados: `Stock market themed illustration for: "${title}". Style: Clean corporate, charts and graphs abstracted, warm color palette, professional financial aesthetic.`,
    agro: `Agricultural commodity illustration for: "${title}". Style: Fields, grains, harvest elements, warm golden tones, professional infographic style.`,
    finanzas: `Finance and banking illustration for: "${title}". Style: Modern corporate, subtle money/investment elements, warm professional palette.`,
    cripto: `Cryptocurrency themed illustration for: "${title}". Style: Digital, futuristic but professional, blockchain elements abstracted, warm tech aesthetic.`,
  };

  return prompts[category.toLowerCase()] || prompts.economia;
}

/**
 * Generate an AI image using Gemini's image generation (Imagen)
 * Note: This requires specific API access. Falls back to placeholder.
 */
export async function generateNewsImage(
  title: string,
  category: string
): Promise<string> {
  const cacheKey = `ai:image:${hashString(title)}`;
  const cached = cache.get<string>(cacheKey);
  
  if (cached) {
    return cached;
  }

  // For now, return category-specific Unsplash images
  // TODO: Integrate with Google Imagen or another image generation API when available
  const categoryImages: Record<string, string[]> = {
    economia: [
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1604594849809-dfedbc827105?w=800&h=450&fit=crop',
    ],
    mercados: [
      'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1642790106117-e829e14a795f?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=450&fit=crop',
    ],
    agro: [
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=450&fit=crop',
    ],
    finanzas: [
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=450&fit=crop',
    ],
    cripto: [
      'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&h=450&fit=crop',
      'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=450&fit=crop',
    ],
  };

  const images = categoryImages[category.toLowerCase()] || categoryImages.economia;
  const imageUrl = images[Math.floor(Math.random() * images.length)];
  
  cache.set(cacheKey, imageUrl, AI_CACHE_TTL);
  
  return imageUrl;
}

/**
 * Simple hash function for cache keys
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Check if AI service is available
 */
export function isAIAvailable(): boolean {
  return !!GOOGLE_AI_API_KEY;
}
