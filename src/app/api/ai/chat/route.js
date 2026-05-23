import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/connect";
import Business from "@/models/Business";
import Category from "@/models/Category";
import City from "@/models/City";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Cache categories and cities in memory to avoid repeated DB calls
let cachedCategories = null;
let cachedCities = null;
let categoriesCacheTime = 0;
let citiesCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

async function getCachedCategories() {
  const now = Date.now();
  if (cachedCategories && (now - categoriesCacheTime) < CACHE_DURATION) {
    return cachedCategories;
  }
  cachedCategories = await Category.find({}).select("name slug").lean();
  categoriesCacheTime = now;
  return cachedCategories;
}

async function getCachedCities() {
  const now = Date.now();
  if (cachedCities && (now - citiesCacheTime) < CACHE_DURATION) {
    return cachedCities;
  }
  cachedCities = await City.find({ status: "active" }).select("name slug").lean();
  citiesCacheTime = now;
  return cachedCities;
}

function buildSystemInstruction(categories, cities) {
  const categoryList = categories.map(c => `${c.name} (${c.slug})`).join(", ");
  const cityList = cities.map(c => c.name).join(", ");
  
  return `You are the AI assistant for Service Markaz — a local services marketplace in Pakistan.
Your job is to help users find service providers.

AVAILABLE CATEGORIES (use these slugs exactly):
${categoryList}

AVAILABLE CITIES:
${cityList}

CATEGORY & CITY DETECTION:
- Analyze the user's message to detect which category and city they need.
- Match categories semantically (e.g., "bijli ka kaam" → electricians, "AC theek karo" → ac-repair).
- Match cities even with typos or partial names (e.g., "lhr" → Lahore, "isb" → Islamabad).
- Be flexible with Urdu, Roman Urdu, and English variations.

CONVERSATIONAL FLOW:
- Greet warmly on first message.
- If the service category is unclear, ask: "Aap ko konsi service chahiye? Jaise ${categories.slice(0, 3).map(c => c.name).join(", ")}, etc."
- If the city is NOT mentioned, ask: "Aap ko kis city main service chahiye?"
- Ask only ONE question at a time. Keep it short and friendly.
- Once you have BOTH city AND service type, provide recommendations from the provided list.

🚨 CRITICAL DATA RULES (VIOLATION = SYSTEM FAILURE):
1. You will receive provider data between "--- AVAILABLE PROVIDERS ---" and "--- END OF PROVIDERS ---"
2. If you see "[No providers found...]" - STOP IMMEDIATELY. Do NOT list ANY providers. Only apologize.
3. NEVER EVER create, invent, assume, or hallucinate provider names, ratings, phone numbers, or ANY details
4. If no provider data is given, you CANNOT and MUST NOT recommend anyone
5. You are a DATA DISPLAY SYSTEM ONLY - not a data generator or creator
6. Inventing ANY data is a CRITICAL ERROR that breaks user trust and violates system rules
7. NO PROVIDERS IN DATABASE = NO RECOMMENDATIONS = ONLY APOLOGIZE

WHEN NO PROVIDERS FOUND:
- Say sorry in a friendly way
- Suggest trying a different service category
- DO NOT mention any provider names
- DO NOT suggest checking other cities
- DO NOT create example providers
- DO NOT use phrases like "try contacting" or "you can reach out to"

HOW YOU WORK:
- Recommend ONLY providers from the "AVAILABLE PROVIDERS" section
- Copy names EXACTLY as given - do not modify or create variations
- Highlight rating, experience, or availability if available
- Be friendly, conversational, and human-like
- Respond in the same language the user used (Urdu/Roman Urdu/English)
- Keep responses short — 2 to 4 lines max unless listing providers

STRICT LOCATION RULE:
- If "[No providers found...]" appears, apologize politely
- DO NOT suggest providers from other cities
- DO NOT redirect to other locations
- Suggest trying a different service category

STRICT RULES:
- NEVER show database IDs or internal fields
- NEVER ask more than one question at a time
- Do NOT use markdown tables. Use simple bullet points

GOLDEN RULE: NO DATA FROM SYSTEM = NO RECOMMENDATIONS. PERIOD.`;
}

// Validate history: Gemini requires strict user→model alternation starting with user
// History must also end with a model turn (the current user message is sent separately)
function sanitizeHistory(history) {
  if (!Array.isArray(history) || history.length === 0) return [];
  const valid = [];
  let expectedRole = 'user';
  for (const turn of history) {
    if (!turn?.role || !turn?.parts?.[0]?.text) continue;
    if (turn.role === expectedRole) {
      valid.push(turn);
      expectedRole = expectedRole === 'user' ? 'model' : 'user';
    }
  }
  // If history ends with a user turn (e.g. prev assistant was an error and got filtered),
  // drop it — otherwise Gemini sees two consecutive user turns and throws.
  if (valid.length > 0 && valid[valid.length - 1].role === 'user') {
    valid.pop();
  }
  return valid;
}

// Smart category and city detection using AI in a single pass
async function detectCategoryAndCity(model, message, categories, cities) {
  try {
    const categoriesList = categories.map(c => `${c.name} (slug: ${c.slug})`).join('\n');
    const citiesList = cities.map(c => c.name).join(', ');

    const prompt = `Analyze this user message and detect the service category and city they need.

### Available Categories:
${categoriesList}

### Available Cities:
${citiesList}

### Rules:
1. Match semantically - understand intent even with informal language, Urdu, Roman Urdu, or English
2. For categories: match based on meaning (e.g., "bijli ka kaam" → electricians, "AC theek" → ac-repair)
3. For cities: match even with abbreviations or typos (e.g., "lhr" → Lahore, "isb" → Islamabad)
4. Return the exact slug for category from the list above
5. Return the exact name for city from the list above
6. If not found, return null for that field
7. Respond ONLY with JSON, no extra text

### Output Format:
{"category": "slug-or-null", "city": "CityName-or-null", "confidence": 0.0-1.0}

### User Message:
${message}`;

    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    const jsonMatch = raw.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return { category: null, city: null };

    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      category: parsed.category && parsed.category !== 'null' ? 
        categories.find(c => c.slug === parsed.category) : null,
      city: parsed.city && parsed.city !== 'null' ? parsed.city : null,
      confidence: parsed.confidence ?? 0
    };
  } catch (error) {
    console.error('AI detection error:', error);
    return { category: null, city: null };
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, history, conversationText } = body;

    if (!message?.trim()) {
      return NextResponse.json({ text: 'Koi message nahi mila. Dobara koshish karein.', action: null });
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return NextResponse.json({ text: 'AI service abhi configure nahi hai. Admin se rabta karein.', action: null });
    }

    await connectDB();

    // ── Fetch cities & categories from DB (fully dynamic, cached) ───────────
    const [categories, dbCities] = await Promise.all([
      getCachedCategories(),
      getCachedCities(),
    ]);

    // ── Smart AI-based detection (single call for both category & city) ─────
    const detectionModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    const detected = await detectCategoryAndCity(
      detectionModel, 
      conversationText || message, 
      categories, 
      dbCities
    );

    const detectedCategory = detected.category;
    const detectedCity = detected.city;

    // Fetch providers only when both city and category are known
    let providers = [];
    let action = null;

    if (detectedCity && detectedCategory) {
      const escapedCity = detectedCity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      providers = await Business.find({
        status: "active",
        city: { $regex: new RegExp(`^${escapedCity}$`, "i") },
        category: detectedCategory.slug,
      })
        .select("name title category city area rating experience availability services")
        .sort({ rating: -1 })
        .limit(5)
        .lean();

      if (providers.length > 0) {
        action = {
          type: "browse",
          label: `Browse All ${detectedCategory.name} in ${detectedCity}`,
          url: `/services?category=${detectedCategory.slug}&city=${detectedCity}`,
        };
      }
    }

    // Build provider context string for AI - STRICT FORMAT
    let providerContext = "";
    if (providers.length > 0) {
      providerContext = "\n\n=== SYSTEM DATA START ===\n--- AVAILABLE PROVIDERS (use ONLY these) ---";
      providers.forEach((p, i) => {
        providerContext += `\n${i + 1}. ${p.name} | ${p.title} | Rating: ${p.rating ?? "N/A"} | Experience: ${p.experience ?? "N/A"} yrs | City: ${p.city}${p.area ? ", " + p.area : ""} | Availability: ${p.availability ?? "N/A"}`;
      });
      providerContext += "\n--- END OF PROVIDERS ---\n=== SYSTEM DATA END ===";
    } else if (detectedCity && detectedCategory) {
      providerContext = `\n\n=== SYSTEM DATA START ===
[No providers found in ${detectedCity} for ${detectedCategory.name}]

🚨🚨🚨 CRITICAL INSTRUCTION - READ CAREFULLY 🚨🚨🚨:
- ZERO providers exist in database for this search
- Database returned EMPTY results
- You MUST NOT list ANY provider names
- You MUST NOT create, invent, or suggest ANY fake providers
- You MUST NOT use phrases like "try contacting", "reach out to", or mention ANY names
- You MUST NOT show ratings, phone numbers, or ANY provider details
- ONLY apologize politely and suggest trying a different service

CORRECT RESPONSE EXAMPLE:
"Maafi chahta hoon, ${detectedCity} main ${detectedCategory.name} abhi available nahi hain. Aap koi aur service try kar sakte hain."

FORBIDDEN - DO NOT DO THIS:
❌ Listing any provider names
❌ Showing ratings or contact info
❌ Suggesting to "try" or "contact" anyone
❌ Creating example providers
=== SYSTEM DATA END ===`;
    }

    let text = '';
    try {
      const systemInstruction = buildSystemInstruction(categories, dbCities);
      const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        systemInstruction,
      });

      const cleanHistory = sanitizeHistory(history);
      const chat = model.startChat({ history: cleanHistory });
      const result = await chat.sendMessage(message + providerContext);
      text = result.response.text();

      // 🚨 SAFETY CHECK: Detect if AI hallucinated data when no providers exist
      if (providers.length === 0 && detectedCity && detectedCategory) {
        // Check if response contains suspicious patterns (fake provider names or data)
        const suspiciousPatterns = [
          /\*\*[A-Z][a-z]+['']?s?\s+[A-Z][a-z]+\*\*/g,  // **Name's Service**
          /\d+\.\s+\*\*[A-Z]/g,                          // 1. **Name
          /Rating:\s*\d+(\.\d+)?/gi,                     // Rating: 4.9 or Rating: 4
          /Experience:\s*\d+/gi,                         // Experience: 5
          /Speciality:/gi,                               // Speciality:
          /\*\*[A-Z][a-z]+\s+[A-Z][a-z]+\*\*/g,         // **First Last**
          /Contact:\s*\d+/gi,                            // Contact: 03001234567
          /Phone:\s*\d+/gi,                              // Phone: 03001234567
          /\d{4,}/g,                                     // Any 4+ digit number (phone/rating)
          /\b[A-Z][a-z]+\s+[A-Z][a-z]+\s+(Services?|Repair|Works?|Solutions?)\b/g, // Business name patterns
          /\b(try|contact|reach out to|call)\s+[A-Z][a-z]+/gi, // "try Ahmad" or "contact Bilal"
          /\b\d+\s*(star|stars|rating)\b/gi,             // "5 star" or "4.5 stars"
        ];
        
        const seemsHallucinated = suspiciousPatterns.some(pattern => pattern.test(text));
        
        if (seemsHallucinated) {
          console.warn('⚠️ AI HALLUCINATION DETECTED - Overriding response');
          text = `Maafi chahta hoon, ${detectedCity} main ${detectedCategory.name} abhi available nahi hain. Aap koi aur service try kar sakte hain.`;
        }
      }
    } catch (geminiError) {
      console.error("Gemini API Error:", geminiError?.message || geminiError);
      const msg = geminiError?.message || '';
      if (msg.includes('API_KEY') || msg.includes('403') || msg.includes('API key')) {
        text = 'AI service key valid nahi hai. Admin se rabta karein.';
      } else if (msg.includes('SAFETY') || msg.includes('blocked') || msg.includes('finish_reason')) {
        text = 'Yeh message process nahi ho saka. Thora alag tareeqe se likhen.';
      } else if (msg.includes('quota') || msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
        text = 'AI service abhi busy hai. Thodi dair main dobara koshish karein.';
      } else if (msg.includes('model') || msg.includes('404')) {
        text = 'AI model abhi available nahi. Thodi dair main dobara koshish karein.';
      } else {
        text = 'Maafi chahta hoon, jawab generate nahi ho saka. Thodi dair main dobara koshish karein.';
      }
    }

    if (!text) {
      text = 'Koi jawab nahi mila. Apna sawal thoda alag tareeqe se likhein.';
    }

    return NextResponse.json({ text, action });
  } catch (error) {
    console.error("Chat API Error:", error?.message || error);
    return NextResponse.json(
      { text: 'Ek technical kharabi aa gayi. Thodi dair main dobara koshish karein.', action: null },
    );
  }
}
