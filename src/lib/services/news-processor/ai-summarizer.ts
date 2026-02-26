/**
 * AI Summarizer
 * Generates intelligent summaries using Gemini AI
 */

const GEMINI_API_KEY = process.env.GOOGLE_AI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

interface SummaryResult {
  summary: string;
  keyPoints: string[];
  success: boolean;
  error?: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    code?: number;
  };
}

/**
 * Generate an intelligent 3-paragraph summary of a news article
 */
export async function generateAISummary(
  title: string,
  header: string,
  fullContent: string,
  category: string,
  sourceName: string
): Promise<SummaryResult> {
  if (!GEMINI_API_KEY) {
    console.error('[AISummarizer] GOOGLE_AI_API_KEY not configured');
    return {
      summary: header,
      keyPoints: [],
      success: false,
      error: 'API key not configured',
    };
  }

  // Use full content if available, otherwise fall back to header
  const contentToAnalyze = fullContent?.length > 200 ? fullContent : header;

  const prompt = `Eres un periodista financiero senior especializado en economía argentina, mercados y agronegocios. Trabajas para "Rosario Finanzas", el portal líder de información financiera de la región.

## NOTICIA A ANALIZAR:

**TÍTULO:** ${title}

**BAJADA:** ${header}

**CONTENIDO COMPLETO:**
${contentToAnalyze}

**CATEGORÍA:** ${category}
**FUENTE:** ${sourceName}

## TU TAREA:

Genera un resumen CONCISO pero completo de esta noticia. NO repitas textualmente el título ni la bajada. El lector debe entender la noticia sin necesidad de ir a la fuente original.

## FORMATO DE RESPUESTA (JSON estricto):

{
  "summary": "<p>Párrafo principal con los hechos clave: <strong>qué pasó</strong>, cuándo, dónde y quiénes están involucrados. Incluí cifras y datos concretos si los hay.</p><p>Párrafo opcional de contexto o implicancias (solo si es relevante y aporta valor).</p>",
  "keyPoints": [
    "Dato o cifra clave mencionada",
    "Impacto principal en mercados/agro/economía",
    "Actor o entidad involucrada",
    "Implicancia para el lector",
    "Tendencia o perspectiva"
  ]
}

## REGLAS IMPORTANTES:
1. El summary debe usar HTML simple: <p>, <strong>, <em> para enriquecer el texto
2. Máximo 2 párrafos (usa 1 si es suficiente para explicar la noticia)
3. Entre 60 y 120 palabras en total - sé conciso pero informativo
4. Los keyPoints deben ser concisos (máximo 12 palabras cada uno)
5. Enfócate en el contenido real, NO inventes datos
6. Si es agro: menciona commodities, precios, clima
7. Si es finanzas: menciona dólar, MERVAL, bonos, tasas
8. Tono profesional, directo y accesible

Responde SOLO con el JSON, sin markdown ni texto adicional.`;

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
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
          topP: 0.9,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AISummarizer] API error ${response.status}:`, errorText);
      return {
        summary: header,
        keyPoints: [],
        success: false,
        error: `API error: ${response.status}`,
      };
    }

    const data: GeminiResponse = await response.json();

    if (data.error) {
      console.error('[AISummarizer] Gemini error:', data.error.message);
      return {
        summary: header,
        keyPoints: [],
        success: false,
        error: data.error.message,
      };
    }

    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      return {
        summary: header,
        keyPoints: [],
        success: false,
        error: 'Empty response from AI',
      };
    }

    // Parse JSON response
    try {
      // Clean markdown code blocks if present
      const cleanedJson = textResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      const parsed = JSON.parse(cleanedJson);
      
      // Validate response structure
      if (!parsed.summary || typeof parsed.summary !== 'string') {
        throw new Error('Invalid summary format');
      }

      // Ensure summary has multiple paragraphs
      let summary = parsed.summary;
      if (!summary.includes('\n\n') && summary.length > 300) {
        // If no paragraph breaks, try to add them
        const sentences = summary.split(/(?<=[.!?])\s+/);
        if (sentences.length >= 6) {
          const third = Math.floor(sentences.length / 3);
          summary = [
            sentences.slice(0, third).join(' '),
            sentences.slice(third, third * 2).join(' '),
            sentences.slice(third * 2).join(' '),
          ].join('\n\n');
        }
      }

      return {
        summary,
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
        success: true,
      };
    } catch (parseError) {
      console.error('[AISummarizer] Failed to parse JSON, using raw text');
      // Use raw text if JSON parsing fails
      return {
        summary: textResponse.slice(0, 1500),
        keyPoints: [],
        success: true,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[AISummarizer] Request error:', errorMessage);
    return {
      summary: header,
      keyPoints: [],
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Check if AI service is available
 */
export function isAIAvailable(): boolean {
  return !!GEMINI_API_KEY;
}
