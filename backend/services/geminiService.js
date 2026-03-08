import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key_for_development');
const DEFAULT_MODEL = 'gemini-flash-latest';

/**
 * Get AI-powered budget suggestions for an event
 */
export async function getBudgetSuggestions(eventData) {
  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const prompt = `You are an expert event planner with 20 years of experience. Generate a detailed budget recommendation.

Event Details:
- Type: ${eventData.eventType || 'General Event'}
- Guests: ${eventData.guestCount || 100}
- Location: ${eventData.location || 'United States'} (User Country: ${eventData.country || 'US'})
- Current Budget: $${eventData.budget || 5000}
- Date: ${eventData.date || 'Not specified'}

Provide a comprehensive budget breakdown including:
1. Recommended total budget range (min and max) in the local currency of the country (${eventData.country || 'US'})
2. Category-wise breakdown (Venue, Catering, Decorations, Entertainment, Photography, Transportation, Gifts, Misc)
3. Percentage allocation for each category
4. Clear reasoning for each recommendation considering local market rates
5. Market comparison (is this above/below average for this country?)
6. Three specific cost-saving tips for this event

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "recommendedBudget": {
    "min": 8000,
    "max": 12000,
    "reasoning": "Based on similar events..."
  },
  "categories": [
    {
      "name": "Venue",
      "amount": 3000,
      "percentage": 35,
      "reasoning": "Outdoor venues in this location typically cost...",
      "marketComparison": "15% below average",
      "tip": "Book 6 months in advance for best rates"
    }
  ],
  "savingsTips": [
    "Switch to buffet style and save $400",
    "Use seasonal flowers to save $200",
    "Book photographer for 6 hours instead of 8 to save $300"
  ],
  "insights": [
    "Your budget is well-balanced for this event type",
    "Consider allocating more to catering for better guest experience"
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    const suggestions = JSON.parse(jsonText);
    return suggestions;
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate budget suggestions');
  }
}

/**
 * Get AI-powered menu suggestions
 */
export async function getMenuSuggestions(eventData) {
  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const countryMap = {
      'US': 'United States',
      'IN': 'India',
      'GB': 'United Kingdom',
      'AE': 'United Arab Emirates',
      'AU': 'Australia',
      'CA': 'Canada'
    };
    const countryCode = eventData.country || 'US';
    const countryName = countryMap[countryCode] || countryCode;

    console.log(`[Gemini] Generating menu for ${countryName} (${countryCode})`);

    const prompt = `You are an expert caterer and menu planner specializing in authentic ${countryName} cuisine and others.
    
Event Details:
- Type: ${eventData.eventType || 'General Event'}
- Guests: ${eventData.guestCount || 100}
- Cuisine Preference: ${eventData.cuisine || 'Authentic Local'}
- Catering Budget: ${eventData.cateringBudget}
- Location: ${countryName} (${countryCode})

CRITICAL INSTRUCTIONS:
1. The menu MUST be authentic to ${countryName} if no specific cuisine is requested.
2. If the country is India (IN), use Indian Rupee (₹) for ALL costs.
3. If the country is US, use US Dollar ($).
4. SUGGESTIONS MUST BE LOCALLY SOURCED AND CULTURALLY APPROPRIATE for ${countryName}.
5. Do NOT suggest generic western food for an Indian wedding unless explicitly asked.

Create a complete menu with:
1. Appetizers (3-4 items, costs in local currency)
2. Main courses (3-4 items, costs in local currency)
3. Desserts (2-3 items, costs in local currency)
4. Beverages
5. Cost per person calculation
6. Dietary accommodation suggestions

IMPORTANT: Respond ONLY with valid JSON in this detailed format:
{
  "menu": {
    "appetizers": [
      {"name": "Specific Dish Name", "quantity": "amount", "cost": 0, "description": "Description"}
    ],
    "mains": [],
    "desserts": [],
    "beverages": []
  },
  "costBreakdown": {
    "appetizers": 0,
    "mains": 0,
    "desserts": 0,
    "beverages": 0,
    "total": 0,
    "costPerPerson": 0
  },
  "dietaryAccommodations": [],
  "tips": []
}`;

    console.log('[Gemini] Menu Prompt:', prompt);

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let jsonText = text;
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate menu suggestions');
  }
}

/**
 * Get AI-powered decor ideas
 */
export async function getDecorIdeas(eventData) {
  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const countryMap = {
      'US': 'United States',
      'IN': 'India',
      'GB': 'United Kingdom',
      'AE': 'United Arab Emirates',
      'AU': 'Australia',
      'CA': 'Canada'
    };
    const countryCode = eventData.country || 'US';
    const countryName = countryMap[countryCode] || countryCode;

    console.log(`[Gemini] Generating decor for ${countryName} (${countryCode})`);

    const prompt = `You are an expert event decorator specializing in weddings and events in ${countryName}.
    
Event Details:
- Type: ${eventData.eventType || 'General Event'}
- Venue Type: ${eventData.venueType || 'Indoor'}
- Season: ${eventData.season || 'Spring'}
- Decor Budget: ${eventData.decorBudget}
- Style: ${eventData.style || 'Traditional'}
- Location: ${countryName} (${countryCode})

CRITICAL INSTRUCTIONS:
1. SUGGESTIONS MUST BE CULTURALLY SPECIFIC to ${countryName}.
2. For India: Suggest Marigold flowers, Rangoli, Diyas, Mandap styles if relevant.
3. Use the LOCAL CURRENCY for ${countryName} (e.g. ₹ for India) for ALL prices.
4. Do not provide generic western decor unless the style specifically says 'Western'.

Provide:
1. Theme recommendation suitable for the location/season in ${countryName}
2. Color palette (3-5 colors)
3. Specific decor items with costs in local currency
4. DIY tips to save money
5. Shopping list

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "theme": "Theme Name",
  "description": "Description",
  "colorPalette": ["Color 1", "Color 2"],
  "decorItems": [
    {
      "category": "Category",
      "items": "Item details",
      "cost": 0,
      "diyTip": "Tip"
    }
  ],
  "totalCost": 0,
  "savingsTips": [],
  "shoppingList": []
}`;

    console.log('[Gemini] Decor Prompt:', prompt);

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let jsonText = text;
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate decor ideas');
  }
}

/**
 * Get cost optimization suggestions
 */
export async function getCostOptimization(eventData) {
  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const prompt = `You are an expert budget analyst for events. Analyze the current spending and provide optimization suggestions.

Event Details:
- Total Budget: $${eventData.totalBudget || 10000}
- Current Spending: $${eventData.currentSpending || 7500}
- Days Until Event: ${eventData.daysUntil || 60}

Current Expenses by Category:
${JSON.stringify(eventData.expenses || [], null, 2)}

Analyze and provide:
1. Projected final cost based on current spending rate
2. Specific cost-saving opportunities
3. Budget reallocation suggestions
4. Priority recommendations

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "analysis": {
    "currentSpending": 7500,
    "projectedFinal": 9200,
    "percentageUsed": 75,
    "daysRemaining": 60,
    "status": "on-track",
    "alert": "You're 75% through budget with 60 days remaining"
  },
  "savingsOpportunities": [
    {
      "category": "Catering",
      "suggestion": "Switch from plated dinner to buffet style",
      "savings": 450,
      "impact": "Low - guests prefer buffet for casual events"
    }
  ],
  "reallocations": [
    {
      "from": "Decorations",
      "to": "Entertainment",
      "amount": 500,
      "reasoning": "Entertainment has higher guest satisfaction impact"
    }
  ],
  "recommendations": [
    "Book remaining vendors within 2 weeks to lock in current rates",
    "Consider reducing guest count by 10 to save $250"
  ]
}`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    let jsonText = text;
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate cost optimization');
  }
}

/**
 * Check if the input is a valid receipt and extract details
 */
export async function analyzeReceipt(imagePart, mimeType = 'image/jpeg') {
  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const prompt = `You are an expert expense tracker. Analyze this image.
    
    1. First, determine if this is a receipt, invoice, or bill.
    2. If it is NOT a receipt/bill, return valid JSON with {"isReceipt": false}.
    3. If it IS a receipt, extract:
       - Total Amount (number)
       - Currency Code (e.g., USD, INR, EUR) based on symbols or text
       - Date (YYYY-MM-DD format). If multiple, use the transaction date.
       - Merchant Name (for Description)
       - Category (choose one: 'food', 'transport', 'accommodation', 'activities', 'entertainment', 'other')
       - Items list (brief summary)
    
    IMPORTANT: Respond ONLY with valid JSON in this format:
    {
      "isReceipt": true,
      "amount": 0.00,
      "currency": "USD",
      "date": "2024-01-01",
      "merchant": "Store Name",
      "category": "food",
      "items": ["Item 1", "Item 2"]
    }`;

    const image = {
      inlineData: {
        data: imagePart,
        mimeType: mimeType
      }
    };

    const result = await model.generateContent([prompt, image]);
    const text = result.response.text().trim();

    let jsonText = text;
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '');
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.error('Gemini Receipt Analysis Error:', error);
    throw new Error('Failed to analyze receipt');
  }
}

/**
 * Generate a custom invitation message based on event details
 */
export async function generateInvitation(eventData, tone = 'Standard', theme = 'None') {
  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const prompt = `You are an expert event copywriter. Write an engaging, beautiful invitation message for an upcoming event.
    
    Event Details:
    - Title: ${eventData.title || 'Special Event'}
    - Description: ${eventData.description || ''}
    - Type: ${eventData.eventType || 'General'}
    - Date: ${eventData.date || 'TBD'}
    - Time: ${eventData.time || 'TBD'}
    - LocationName: ${eventData.venue?.name || 'TBD'}
    - LocationAddress: ${eventData.venue?.address || ''}

    Style Requirements:
    - Tone: ${tone} (e.g., Formal, Casual, Fun, Humorous, Elegant)
    - Theme/Vibe: ${theme}
    
    CRITICAL INSTRUCTIONS:
    1. Write ONLY the invitation text message. Do NOT include markdown blocks, JSON, or meta-commentary.
    2. The message should be formatted beautifully with appropriate line breaks and spacing.
    3. Include emojis if the tone is 'Casual', 'Fun', or 'Humorous'. Avoid or minimize them if 'Formal'.
    4. Provide clear details of When and Where in the text.
    5. Be persuasive and warm to encourage people to RSVP.
    `;

    const result = await model.generateContent(prompt);
    console.log('Gemini Invitation API Response Status:', result.response?.promptFeedback || 'No feedback');
    const text = result.response.text().trim();

    return text;
  } catch (error) {
    console.error('Gemini Invitation Generation Error DETAILS:', {
      message: error.message,
      name: error.name,
      status: error.status,
      statusText: error.statusText,
      errorDetails: error.errorDetails,
      stack: error.stack
    });
    throw new Error('Failed to generate invitation');
  }
}
