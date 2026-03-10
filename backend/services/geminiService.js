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
    console.error('Gemini Optimization Error:', error);
    throw new Error('Failed to generate cost optimization suggestions');
  }
}

/**
 * Generate a predictive Smart Schedule 
 */
export async function generateSchedule(eventData, userPrompt) {
  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const prompt = `You are an expert event coordinator. The user wants to auto-generate a schedule or itinerary for their event based on this request: "${userPrompt}"

Event Details: 
- Title: ${eventData.title || 'Event'}
- Type: ${eventData.eventType || 'General'}
- Date: ${eventData.date || 'Not set'}

Generate a realistic, logical sequence of schedule items for this event. 
Include realistic start and end times in 24-hour 'HH:mm' format.
If the user specifies a start time in their prompt, base the sequence off of that. Otherwise, pick a standard starting time for this type of event.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "scheduleItems": [
    {
      "title": "Guest Arrival & Welcome Drinks",
      "description": "Guests arrive and mingle. Serve signature cocktails.",
      "start_time": "14:00",
      "end_time": "14:30",
      "location": "Main Foyer"
    },
    {
      "title": "Opening Speech",
      "description": "Host welcomes everyone.",
      "start_time": "14:30",
      "end_time": "14:45",
      "location": "Grand Hall"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Clean up markdown formatting if present
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Schedule Error:', error);
    throw new Error('Failed to generate schedule');
  }
}

/**
 * Check if the AI should proactively greet the user based on event context
 */
export async function checkProactiveGreeting(userEvents) {
  try {
    if (!userEvents || userEvents.length === 0) return null;

    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });
    const prompt = `You are a proactive event planning assistant. Review the user's upcoming events. 
If an event is happening soon (within 7 days) and there is a potential issue (e.g., low RSVP rate, missing venue), generate a short, friendly, and helpful proactive greeting. 
Example: "Hi! Your birthday party is in 4 days, but 12 guests haven't RSVP'd yet. Would you like me to send them a reminder?"
If there are no urgent issues or the events are far in the future, return exactly the word "NULL".
Do not return "NULL" in quotes, just the letters NULL. Keep greetings under 2 sentences.

User's upcoming events data:
${JSON.stringify(userEvents, null, 2)}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    if (text === "NULL" || text === '"NULL"' || text === 'null') {
      return null;
    }

    return text;
  } catch (error) {
    console.error('Gemini Proactive Greeting Error:', error);
    return null;
  }
}

/**
 * Generate a smart Gift Registry 
 */
export async function generateGiftRegistry(eventData, userPrompt) {
  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const prompt = `You are an expert gift concierge. The user wants to auto-generate a curated list of gift ideas for their event based on this request: "${userPrompt}"

Event Details: 
- Title: ${eventData.title || 'Event'}
- Type: ${eventData.eventType || 'General'}
- Date: ${eventData.date || 'Not set'}

Generate a realistic, thoughtful, and highly-rated list of gift ideas appropriate for this event type and request.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "gifts": [
    {
      "name": "Vitamix Blender",
      "description": "High-performance blender perfect for smoothies and soups.",
      "estimated_price": 350.00,
      "priority": "High",
      "category": "Kitchen",
      "url": "https://www.amazon.com/s?k=vitamix+blender"
    },
    {
      "name": "Luxury Bath Towel Set",
      "description": "Plush, 100% Egyptian cotton bath towels.",
      "estimated_price": 85.00,
      "priority": "Medium",
      "category": "Home Decor",
      "url": "https://www.amazon.com/s?k=luxury+bath+towel+set"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Clean up markdown formatting if present
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Gift Registry Error:', error);
    throw new Error('Failed to generate gift registry');
  }
}

/**
 * Generate Intelligent Task Breakdown
 */
export async function generateTaskBreakdown(eventData, userPrompt) {
  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const prompt = `You are an expert event planner. The user wants to auto-populate a task checklist for their event based on this request: "${userPrompt}"

Event Details: 
- Title: ${eventData.title || 'Event'}
- Type: ${eventData.eventType || 'General'}
- Date: ${eventData.date || 'Not set'}

Generate a logical timeline of tasks. If the event date is provided, try to assign realistic relative deadlines (format YYYY-MM-DD) leading up to the event date. Categories must strictly be one of: 'planning', 'booking', 'day-of', 'post-event'. Priorities must strictly be 'high', 'medium', or 'low'.

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "tasks": [
    {
      "title": "Finalize Guest List",
      "category": "planning",
      "priority": "high",
      "deadline": "2024-05-01",
      "status": "not-started"
    },
    {
      "title": "Book Catering",
      "category": "booking",
      "priority": "high",
      "deadline": "2024-05-15",
      "status": "not-started"
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    // Clean up markdown formatting if present
    if (text.startsWith('```json')) {
      text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (text.startsWith('```')) {
      text = text.replace(/```\n?/g, '');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Task Breakdown Error:', error);
    throw new Error('Failed to generate task breakdown');
  }
}

/**
 * Analyze Vendor Quote Text
 */
export async function analyzeQuote(quoteText, eventData) {
  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const prompt = `You are an expert event planner and negotiator. The user has pasted text from a vendor quote or contract for their event.

Event Details: 
- Title: ${eventData.title || 'Event'}
- Type: ${eventData.eventType || 'General'}
- Date: ${eventData.date || 'Not set'}

Analyze the quote text:
"${quoteText}"

Extract and deduce the following information. Be highly analytical, looking for standard industry gotchas (e.g., service fees, overtime, travel costs, minimums).

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "vendor_name": "Name of Vendor",
  "category": "other",
  "total_cost": 1500.00,
  "included_items": ["Item 1", "Item 2"],
  "hidden_fees": ["18% gratuity not included", "Travel fee"],
  "negotiation_tactics": ["Ask for a weekday discount"]
}`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/\`\`\`json\n?/g, '').replace(/\`\`\`\n?/g, '');
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/\`\`\`\n?/g, '');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Quote Analysis Error:', error);
    throw new Error('Failed to analyze quote');
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
       - Tax Amount (number)
       - Tip/Gratuity Amount (number)
       - Line Items list. Extract every single item purchased and its specific price. Do NOT group them unless they are identical.
    
    IMPORTANT: Respond ONLY with valid JSON in this format:
    {
      "isReceipt": true,
      "amount": 0.00,
      "currency": "USD",
      "date": "2024-01-01",
      "merchant": "Store Name",
      "category": "food",
      "tax": 0.00,
      "tip": 0.00,
      "lineItems": [
         { "name": "Burger", "price": 12.50 },
         { "name": "Fries", "price": 4.00 }
      ]
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

/**
 * Generate structural data (JSON) to build a visual Image Invitation (SVG/PNG)
 */
export async function generateImageInvitationData(eventData, tone = 'Standard', theme = 'None') {
  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const prompt = `You are an expert graphic designer and event copywriter. 
    We need to perfectly design a digital invitation card for an event.
    
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

    Generate the textual and visual parameters to build this card.
    Use web-safe CSS fonts (e.g., 'Georgia, serif', 'Arial, sans-serif', 'Impact, sans-serif').
    Pick a cohesive, beautiful hex color palette (background, primary text, accent/highlight).

    IMPORTANT: Respond ONLY with valid JSON in this exact structure:
    {
      "colors": {
        "background": "#FFFFFF",
        "primaryText": "#111827",
        "accent": "#6366F1"
      },
      "typography": {
        "headlineFont": "Georgia, serif",
        "bodyFont": "Arial, sans-serif"
      },
      "content": {
        "supertitle": "YOU'RE INVITED TO",
        "headline": "Short Catchy Event Title",
        "dateAndTime": "Saturday, October 31st at 8:00 PM",
        "location": "The Grand Hall, 123 Main St",
        "footer": "Please RSVP by Friday!"
      }
    }`;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/\`\`\`json\n?/g, '').replace(/\`\`\`\n?/g, '');
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/\`\`\`\n?/g, '');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Gemini Image Invitation Generation Error DETAILS:', {
      message: error.message,
      stack: error.stack
    });
    throw new Error('Failed to generate visual invitation data');
  }
}

/**
 * Parse natural language intent into a structured JSON action.
 * @param {string} userMessage The user's typed command.
 * @param {object} currentContext Contains context like active eventId, user's timezone, etc.
 */
export async function parseUserIntent(userMessage, currentContext = {}) {
  try {
    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const prompt = `You are an intelligent AI Assistant built into the HostEze App. 
    Your job is to read the user's natural language command, and map it strictly to one of our app's defined actions by returning a structured JSON response.

    DEFINED ACTIONS:
    1. "ADD_GUESTS"
       - Use this when the user mentions adding, inviting, or putting people on a guest list.
       - Extract: Array of objects with "name", "phone" (if provided), and "email" (if provided).
    2. "ADD_EXPENSE"
       - Use this when the user mentions spending money, buying things, or adding a budget item.
       - Extract: "description" (string), "amount" (number), "category" (string: Venue, Catering, Decor, Entertainment, Other).
    3. "CREATE_EVENT"
       - Use this when the user wants to start a new event, party, or get-together.
       - Extract: "title" (string), "eventType" (string), "date" (YYYY-MM-DD or string if relative), "location" (string), "description" (string).
       - * RULE: Do NOT return CREATE_EVENT if you cannot determine the "title" or "eventType" from the message or context. Return GENERAL_CHAT asking for clarification instead (e.g. "What kind of event is this and what should we call it?").
    4. "UPDATE_EVENT"
       - Use this when the user wants to explicitly change or update the date, time, location, title, or description of an existing event.
       - Extract only the fields they want to change: "eventId" (if inferred), "title" (string), "date" (YYYY-MM-DD), "location" (string), "description" (string).
    5. "RSVP_GUEST"
       - Use this when the user mentions a guest is coming or not coming (RSVPing yes or no).
       - Extract: "eventId", "guestName" (string), "status" (boolean: true for coming, false for not coming).
    6. "REMOVE_GUEST"
       - Use this when the user wants to remove or delete someone from the guest list.
       - Extract: "eventId", "guestName" (string).
    7. "GENERAL_CHAT"
       - Use this for any other conversational inputs, specifically:
         A. General greetings ("hello", "how are you").
         B. Clarifications: If the user wants to Add Guests or Expenses, but doesn't specify an Event AND there is no "eventId" in the CURRENT CONTEXT, you MUST ask them which event they mean based on the "userEvents" list provided.
         C. Analytical queries: If the user asks "how many guests do I have?" or "what's my budget?", read the "activeEventStats" provided in the context and answer conversationally. Do NOT guess.

    CURRENT CONTEXT:
    ${JSON.stringify(currentContext, null, 2)}

    USER MESSAGE: 
    "${userMessage}"

    IMPORTANT INSTRUCTIONS:
    - You must read the "history" array provided inside CURRENT CONTEXT. It contains the last few messages of our dialogue. Use this to remember what we are talking about (e.g. if you just asked "Which event?", the user's reply "Birthday" is answering that question!).
    - Respond ONLY with valid JSON. Do not wrap it in markdown codeblocks. Do not include extra conversational text outside the JSON.
    - The JSON MUST have an "action" key (one of ADD_GUESTS, ADD_EXPENSE, CREATE_EVENT, UPDATE_EVENT, RSVP_GUEST, REMOVE_GUEST, GENERAL_CHAT).
    - If action is ADD_GUESTS, include "data": { "eventId" (if inferred from context or message), "guests": [{name, phone, email}] }
       * RULE: Do NOT return ADD_GUESTS if you cannot determine the eventId. Return GENERAL_CHAT asking for clarification instead.
    - If action is ADD_EXPENSE, include "data": { "eventId", "description", "amount", "category" }
       * RULE: Do NOT return ADD_EXPENSE if you cannot determine the eventId. Return GENERAL_CHAT asking for clarification instead.
    - If action is CREATE_EVENT, include "data": { "title", "eventType", "date", "location", "description" }
    - If action is UPDATE_EVENT, include "data": { "eventId", "title", "date", "location", "description" }. Only include fields to be updated.
       * RULE: Do NOT return UPDATE_EVENT if you cannot determine the eventId. Return GENERAL_CHAT asking for clarification instead.
    - If action is RSVP_GUEST, include "data": { "eventId", "guestName", "status" }
    - If action is REMOVE_GUEST, include "data": { "eventId", "guestName" }
    - If action is GENERAL_CHAT, include "data": { }
    - Always output a conversational "message" key inside the root JSON to show to the user.
       * If answering a question based on stats, put the answer here.
       * If confirming an action, put the confirmation here (e.g., "Adding 2 guests!").
       * If asking for clarification, put the question here (e.g., "Which event should I add this to? You have 'Birthday' and 'Wedding'.").
    
    EXPECTED JSON FORMAT:
    {
      "action": "...",
      "message": "...",
      "data": {}
    }
    `;

    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();

    if (text.startsWith('\`\`\`json')) {
      text = text.replace(/\`\`\`json\n?/g, '').replace(/\`\`\`\n?/g, '');
    } else if (text.startsWith('\`\`\`')) {
      text = text.replace(/\`\`\`\n?/g, '');
    }

    return JSON.parse(text);
  } catch (error) {
    console.error('Intent Parser Error DETAILS:', error);
    throw new Error('Failed to parse AI intent');
  }
}
