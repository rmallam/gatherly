import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key_for_development');

/**
 * Get AI-powered budget suggestions for an event
 */
export async function getBudgetSuggestions(eventData) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `You are an expert event planner with 20 years of experience. Generate a detailed budget recommendation.

Event Details:
- Type: ${eventData.eventType || 'General Event'}
- Guests: ${eventData.guestCount || 100}
- Location: ${eventData.location || 'United States'}
- Current Budget: $${eventData.budget || 5000}
- Date: ${eventData.date || 'Not specified'}

Provide a comprehensive budget breakdown including:
1. Recommended total budget range (min and max)
2. Category-wise breakdown (Venue, Catering, Decorations, Entertainment, Photography, Transportation, Gifts, Misc)
3. Percentage allocation for each category
4. Clear reasoning for each recommendation
5. Market comparison (is this above/below average?)
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
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `You are an expert caterer and menu planner. Create a detailed menu recommendation.

Event Details:
- Type: ${eventData.eventType || 'General Event'}
- Guests: ${eventData.guestCount || 100}
- Cuisine Preference: ${eventData.cuisine || 'Mixed'}
- Catering Budget: $${eventData.cateringBudget || 2500}
- Dietary Restrictions: ${eventData.dietary || 'None specified'}

Create a complete menu with:
1. Appetizers (3-4 items with costs)
2. Main courses (3-4 items with costs)
3. Desserts (2-3 items with costs)
4. Beverages
5. Cost per person calculation
6. Dietary accommodation suggestions

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "menu": {
    "appetizers": [
      {"name": "Vegetable Samosas", "quantity": "50 pieces", "cost": 120, "description": "Crispy pastries filled with spiced potatoes"}
    ],
    "mains": [
      {"name": "Butter Chicken", "servings": 150, "cost": 600, "description": "Tender chicken in creamy tomato sauce"}
    ],
    "desserts": [
      {"name": "Gulab Jamun", "servings": 150, "cost": 200, "description": "Sweet milk dumplings in syrup"}
    ],
    "beverages": [
      {"name": "Soft Drinks & Water", "cost": 300}
    ]
  },
  "costBreakdown": {
    "appetizers": 450,
    "mains": 2100,
    "desserts": 400,
    "beverages": 550,
    "total": 3500,
    "costPerPerson": 23.33
  },
  "dietaryAccommodations": [
    "Add vegan option (+$180) for estimated 15% of guests",
    "Gluten-free alternatives available (+$120)"
  ],
  "tips": [
    "Order 10% extra for unexpected guests",
    "Seasonal ingredients can save 15-20%"
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
    throw new Error('Failed to generate menu suggestions');
  }
}

/**
 * Get AI-powered decor ideas
 */
export async function getDecorIdeas(eventData) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `You are an expert event decorator and stylist. Create detailed decor recommendations.

Event Details:
- Type: ${eventData.eventType || 'General Event'}
- Venue Type: ${eventData.venueType || 'Indoor'}
- Season: ${eventData.season || 'Spring'}
- Decor Budget: $${eventData.decorBudget || 800}
- Style Preference: ${eventData.style || 'Modern'}

Provide:
1. Theme recommendation
2. Color palette (3-5 colors)
3. Specific decor items with costs
4. DIY tips to save money
5. Shopping list

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "theme": "Rustic Elegance",
  "description": "A blend of natural elements with sophisticated touches",
  "colorPalette": ["Blush Pink (#FFC0CB)", "Sage Green (#9DC183)", "Ivory (#FFFFF0)", "Gold (#FFD700)"],
  "decorItems": [
    {
      "category": "Floral Centerpieces",
      "items": "Peonies & eucalyptus for 15 tables",
      "cost": 300,
      "diyTip": "Buy wholesale from local flower market to save $150"
    },
    {
      "category": "Lighting",
      "items": "Warm white string lights",
      "cost": 150,
      "diyTip": "Rent instead of buy to save $80"
    }
  ],
  "totalCost": 800,
  "savingsTips": [
    "DIY centerpieces can save 40-50%",
    "Use seasonal flowers for 20% savings",
    "Borrow items from venue when possible"
  ],
  "shoppingList": [
    "15 glass vases ($5 each)",
    "200ft string lights",
    "50 votive candles"
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
    throw new Error('Failed to generate decor ideas');
  }
}

/**
 * Get cost optimization suggestions
 */
export async function getCostOptimization(eventData) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

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
