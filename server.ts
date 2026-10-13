import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// 1. Resolve Gemini AI Key
const geminiApiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  aiClient = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 2. Resolve Google Places API Key from environment or dev store
let placesApiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY;
if (!placesApiKey) {
  try {
    const devEnvPath = '/app/.dev.env.json';
    if (fs.existsSync(devEnvPath)) {
      const devEnv = JSON.parse(fs.readFileSync(devEnvPath, 'utf8'));
      placesApiKey = devEnv.GOOGLE_PLACES_API_KEY || devEnv.VITE_GOOGLE_MAPS_API_KEY;
    }
  } catch (err) {
    console.warn('Could not read dev environment json', err);
  }
}
if (!placesApiKey) {
  placesApiKey = 'AIzaSyDFRcNTGBur5G3kXmjliGa4hYTjJXFfmaI';
}

// Health check and Live Integrations status
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    appName: 'AUTONEXA',
    hasGeminiKey: Boolean(geminiApiKey),
    hasPlacesKey: Boolean(placesApiKey),
    placesApiVersion: 'Places API (New) & Geocoding REST',
    countryScope: 'India (National - IN)',
    defaultTimezone: 'Asia/Kolkata',
    timestamp: new Date().toISOString(),
  });
});

// Technical check helper: test if a website URL is genuinely reachable
async function performTechnicalCheck(url?: string | null): Promise<{
  status: 'REACHABLE' | 'UNREACHABLE' | 'NOT_CHECKED';
  details: string;
}> {
  if (!url || typeof url !== 'string' || !url.trim().startsWith('http')) {
    return {
      status: 'NOT_CHECKED',
      details: 'Not checked (No website URL provided in business listing)',
    };
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const targetUrl = url.trim();

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'AUTONEXA-SiteAudit/1.0' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    return {
      status: 'REACHABLE',
      details: `Website is active and reachable (HTTP ${response.status} ${response.statusText})`,
    };
  } catch (err: any) {
    const isTimeout = err.name === 'AbortError' || err.message?.includes('aborted');
    return {
      status: 'UNREACHABLE',
      details: isTimeout
        ? 'Website check timed out after 4 seconds'
        : `Connection or DNS resolution failed: ${err.message || 'Network error'}`,
    };
  }
}

// 1. AI Business Opportunity Scanner (Evidence-Based)
app.post('/api/ai/scan-opportunity', async (req, res) => {
  try {
    const { businessName, category, location, website, notes, userServices, icp } = req.body;

    if (!businessName) {
      return res.status(400).json({ error: 'Business name is required' });
    }

    // Run real deterministic technical reachability check
    const techCheck = await performTechnicalCheck(website);

    if (aiClient) {
      try {
        const prompt = `You are AUTONEXA's Evidence-Based B2B Opportunity Scanner.
CRITICAL INTEGRITY INSTRUCTIONS:
- You must strictly distinguish between:
  1. Verified Facts (confirmed by Google Places or provided data).
  2. Actual Technical Check Results (${techCheck.status}: ${techCheck.details}).
  3. Unavailable Information (what is simply not known).
  4. AI-Generated Hypotheses (labeled clearly as hypotheses/possibilities).
- NEVER invent fake mobile speed numbers (e.g. "scored 28/100" or "14MB images"), fake revenue losses, or fake awards.
- If no website URL was returned, state: "Website URL not listed in profile; manual verification recommended."
- Ground your analysis in the Indian business context (location: ${location || 'India'}).

Business Profile:
- Business Name: ${businessName}
- Industry/Category: ${category || 'Indian Business'}
- Location: ${location || 'India'}
- Website: ${website || 'Not provided'}
- Technical Reachability Check: ${techCheck.status} (${techCheck.details})
- Field Observations/Notes: ${notes || 'Verified Google Places Indian listing'}

Our Services Offered:
${userServices || 'Website Development, Local SEO, WhatsApp/Booking Automation, Lead Funnels'}

Target Ideal Customer Profile (ICP):
${icp || 'Indian SMBs and professionals seeking to expand digital client inquiries and modernize operations'}

Return strictly JSON matching the schema.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                opportunityTitle: { type: Type.STRING },
                opportunityDetails: { type: Type.STRING },
                verifiedEvidence: { type: Type.STRING },
                technicalCheckResult: { type: Type.STRING },
                unavailableInfo: { type: Type.STRING },
                confidenceLevel: { type: Type.STRING }, // HIGH, MEDIUM, HYPOTHESIS
                serviceFitScore: { type: Type.NUMBER }, // 0 to 100
                recommendedAction: { type: Type.STRING },
                suggestedOpener: { type: Type.STRING },
                hypotheses: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'opportunityTitle',
                'opportunityDetails',
                'verifiedEvidence',
                'technicalCheckResult',
                'confidenceLevel',
                'serviceFitScore',
                'recommendedAction',
                'suggestedOpener',
                'hypotheses',
              ],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          success: true,
          data: {
            ...parsed,
            evidenceFound: parsed.verifiedEvidence || techCheck.details,
            technicalCheck: techCheck,
          },
          source: 'GEMINI_AI',
        });
      } catch (aiErr: any) {
        console.warn('Gemini Opportunity Scan error, using deterministic analysis:', aiErr.message);
      }
    }

    // Deterministic fallback based purely on verified attributes
    const hasWebsite = Boolean(website && website.includes('.'));
    const fitScore = hasWebsite ? 75 : 90;

    const fallbackData = {
      opportunityTitle: hasWebsite
        ? `Inquiry Conversion & Booking Flow for ${businessName}`
        : `Primary Online Presence & Search Discoverability for ${businessName}`,
      opportunityDetails: hasWebsite
        ? `Business has active domain (${website}). Potential opportunity to implement automated customer consultation scheduling and WhatsApp inquiry response.`
        : `No direct website returned in the business listing. High potential to establish an official modern landing page with Google Business Profile integration.`,
      verifiedEvidence: hasWebsite
        ? `Website URL listed: ${website}. Technical check: ${techCheck.details}`
        : `No website URL recorded in listing. Technical check: ${techCheck.details}`,
      evidenceFound: techCheck.details,
      technicalCheckResult: techCheck.details,
      unavailableInfo: 'Internal CRM systems and mobile traffic analytics require direct discovery with business owner.',
      confidenceLevel: hasWebsite ? 'MEDIUM' : 'HIGH',
      serviceFitScore: fitScore,
      recommendedAction: hasWebsite
        ? `Audit the mobile booking flow and pitch speed-to-lead automation.`
        : `Reach out with a starter web presence package tailored for their locality in ${location || 'India'}.`,
      suggestedOpener: `Hi team at ${businessName}, noticed your presence in ${location || 'the area'}—had a quick observation regarding your digital customer inquiry workflow and would love to share a 2-minute overview.`,
      hypotheses: [
        `Competitors in ${location || 'India'} are actively capturing search demand through automated response systems.`,
        `Direct WhatsApp inquiry integration could increase customer conversion rate.`,
      ],
      technicalCheck: techCheck,
    };

    return res.json({
      success: true,
      data: fallbackData,
      source: 'HEURISTIC_ENGINE',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 2. AI Personalized Outreach Generator
app.post('/api/ai/generate-outreach', async (req, res) => {
  try {
    const { lead, userService, channel, tone, objective } = req.body;

    if (!lead || !lead.businessName) {
      return res.status(400).json({ error: 'Valid lead record is required' });
    }

    if (lead.isOptedOut) {
      return res.status(403).json({
        error: 'Communication Blocked: Contact has exercised an opt-out. Promotional outreach is permanently disabled.',
      });
    }

    const channelType = channel || 'Email';
    const selectedTone = tone || 'Professional';
    const selectedObjective = objective || 'Schedule a 10-minute Discovery Call';

    if (aiClient) {
      try {
        const prompt = `You are AUTONEXA's B2B Outreach Generator for the Indian national market.
Draft an authentic, highly personalized, zero-spam outreach message.

PROSPECT:
- Business: ${lead.businessName}
- Industry: ${lead.industry || 'Business'}
- Location: ${lead.location || 'India'}
- Website: ${lead.website || 'Not available'}
- Observed Opportunity: ${lead.opportunitySummary || 'Customer conversion and digital presence'}
- Lead Score: ${lead.leadScore || 80}/100

CAMPAIGN PARAMETERS:
- Service Offered: ${userService || 'Digital Growth and Booking Automation'}
- Channel: ${channelType}
- Tone: ${selectedTone}
- Objective: ${selectedObjective}

RULES:
1. Never invent fake awards, false personal stories, or non-existent claims.
2. Ground all points in genuine available business details.
3. Keep it crisp, respectful, and focused on tangible business value.
4. If Email, provide a compelling, non-clickbait subject line.
5. Provide a low-friction call to action suited for Indian business owners.
Return strictly valid JSON.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                subject: { type: Type.STRING },
                messageBody: { type: Type.STRING },
                openingHook: { type: Type.STRING },
                valueProposition: { type: Type.STRING },
                callToAction: { type: Type.STRING },
              },
              required: ['subject', 'messageBody', 'openingHook', 'valueProposition', 'callToAction'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          success: true,
          data: parsed,
          source: 'GEMINI_AI',
        });
      } catch (aiErr: any) {
        console.warn('Gemini Outreach Generator error, using template:', aiErr.message);
      }
    }

    // Deterministic outreach template
    const subject = channelType === 'Email'
      ? `Quick observation on ${lead.businessName}'s customer inquiry flow`
      : `Connecting with ${lead.businessName}`;

    const body = channelType === 'LinkedIn'
      ? `Hi ${lead.contactPerson || 'there'},\n\nNoticed ${lead.businessName}'s strong standing in ${lead.location || 'India'}. We help companies in your sector eliminate lead drop-off and streamline digital appointments.\n\nHappy to share a 2-minute overview if this is on your radar this quarter?\n\nBest regards.`
      : `Hi ${lead.contactPerson || 'Team'},\n\nI came across ${lead.businessName} while researching leading ${lead.industry || 'businesses'} in ${lead.location || 'India'}.\n\nSpecifically noticed: ${lead.opportunitySummary || 'there is a solid opportunity to accelerate inbound customer response times and capture more inquiries'}.\n\nWe specialize in ${userService || 'digital infrastructure and automated booking funnels'} for companies in your space.\n\nWould you be open to a brief 10-minute introductory call this week to see what that looks like for ${lead.businessName}?\n\nWarm regards,\nSales Team`;

    return res.json({
      success: true,
      data: {
        subject,
        messageBody: body,
        openingHook: `Direct reference to ${lead.businessName}'s presence in ${lead.location || 'India'}.`,
        valueProposition: `Assisting ${lead.industry || 'peer'} organizations with ${userService || 'growth'}.`,
        callToAction: `10-minute discovery call request.`,
      },
      source: 'TEMPLATE_FALLBACK',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 3. AI Reply Intelligence Classifier
app.post('/api/ai/classify-reply', async (req, res) => {
  try {
    const { replyText, leadContext } = req.body;

    if (!replyText || typeof replyText !== 'string') {
      return res.status(400).json({ error: 'Reply text is required' });
    }

    const lower = replyText.toLowerCase();

    // Deterministic opt-out safeguard
    const optOutPhrases = [
      'unsubscribe',
      'stop emailing',
      'remove me',
      'take me off',
      'do not contact',
      'leave me alone',
      'spam',
      'not interested anymore and remove',
    ];
    const isExplicitOptOut = optOutPhrases.some((p) => lower.includes(p));

    if (isExplicitOptOut) {
      return res.json({
        success: true,
        data: {
          category: 'Opt Out',
          explanation: 'The recipient explicitly requested removal or cessation of all communications.',
          confidence: 99,
          suggestedResponse: 'We have updated your preferences immediately and confirmed your removal. You will not receive any further communications from our team. Thank you.',
          recommendedAction: 'Mark contact as Opted Out immediately, cancel all active follow-ups, and block future promotional campaigns.',
          suggestedFollowUpDays: null,
          isOptOut: true,
        },
        source: 'DETERMINISTIC_OPT_OUT_SAFEGUARD',
      });
    }

    if (aiClient) {
      try {
        const prompt = `Analyze this prospective customer's inbound reply to our B2B sales outreach.
Prospect Context: ${leadContext ? JSON.stringify(leadContext) : 'B2B prospect'}
Reply Text:
"${replyText}"

Classify into exactly ONE of:
- "Interested"
- "Asking for Pricing"
- "Needs More Information"
- "Objection"
- "Follow Up Later"
- "Not Interested"
- "Wrong Contact"
- "Out of Office"
- "Opt Out"
- "Unclear"

Provide an accurate explanation, confidence percentage (0-100), suggested response draft, recommended next sales action, and suggested follow-up offset in days (or null).
Return strictly valid JSON.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                explanation: { type: Type.STRING },
                confidence: { type: Type.NUMBER },
                suggestedResponse: { type: Type.STRING },
                recommendedAction: { type: Type.STRING },
                suggestedFollowUpDays: { type: Type.NUMBER },
                isOptOut: { type: Type.BOOLEAN },
              },
              required: ['category', 'explanation', 'confidence', 'suggestedResponse', 'recommendedAction', 'isOptOut'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          success: true,
          data: parsed,
          source: 'GEMINI_AI',
        });
      } catch (aiErr: any) {
        console.warn('Gemini Reply Classifier error, using heuristic:', aiErr.message);
      }
    }

    // Heuristic classification
    let category = 'Needs More Information';
    let explanation = 'Prospect requested additional clarity on scope or offering.';
    let suggestedResponse = 'Thank you for getting back to me! I would be glad to share a quick walkthrough or answer any questions you have.';
    let recommendedAction = 'Provide relevant case study and invite for a 10-minute demo.';
    let suggestedDays: number | null = 3;

    if (lower.includes('price') || lower.includes('cost') || lower.includes('quote') || lower.includes('rate') || lower.includes('pricing') || lower.includes('charges')) {
      category = 'Asking for Pricing';
      explanation = 'Prospect inquired about pricing structure or project cost.';
      suggestedResponse = 'Our plans are flexible and tailored to scope. Would you have 10 minutes this week to walk through your requirements so I can give you an exact quote?';
      recommendedAction = 'Send transparent pricing overview and schedule scoping call.';
      suggestedDays = 2;
    } else if (lower.includes('call') || lower.includes('meet') || lower.includes('interested') || lower.includes('share details') || lower.includes('send info')) {
      category = 'Interested';
      explanation = 'Positive intent detected; prospect welcomes further discussion.';
      suggestedResponse = 'Glad to hear! Would this Wednesday or Thursday work best for a quick 10-minute sync?';
      recommendedAction = 'Confirm meeting time and send calendar invite.';
      suggestedDays = 1;
    } else if (lower.includes('later') || lower.includes('busy') || lower.includes('next month') || lower.includes('next quarter')) {
      category = 'Follow Up Later';
      explanation = 'Timing constraint identified; follow-up requested at a later date.';
      suggestedResponse = 'Completely understand. I will make a note to reconnect with you next month. Wishing you a great quarter in the meantime!';
      recommendedAction = 'Schedule Follow-up Task for 30-45 days in the future.';
      suggestedDays = 30;
    } else if (lower.includes('not interested') || lower.includes('no thanks') || lower.includes('pass')) {
      category = 'Not Interested';
      explanation = 'Polite decline without explicit opt-out demand.';
      suggestedResponse = 'Understood! Thank you for letting me know. If anything changes down the road, please feel free to reach out.';
      recommendedAction = 'Update lead stage to Lost and archive.';
      suggestedDays = null;
    }

    return res.json({
      success: true,
      data: {
        category,
        explanation,
        confidence: 85,
        suggestedResponse,
        recommendedAction,
        suggestedFollowUpDays: suggestedDays,
        isOptOut: false,
      },
      source: 'HEURISTIC_ENGINE',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 4. Deal Rescue Strategy Advisor
app.post('/api/ai/deal-rescue-suggest', async (req, res) => {
  try {
    const { lead, daysInactive, currentStage, alertReason } = req.body;

    if (!lead || !lead.businessName) {
      return res.status(400).json({ error: 'Valid lead record is required' });
    }

    if (lead.isOptedOut) {
      return res.status(403).json({ error: 'Cannot rescue opted-out contact' });
    }

    if (aiClient) {
      try {
        const prompt = `A B2B deal is stalling in the pipeline.
Lead: ${lead.businessName} (${lead.location || 'India'})
Current Stage: ${currentStage || lead.pipelineStage || 'Qualified'}
Days Inactive: ${daysInactive || 10} days
Alert Reason: ${alertReason || 'Inactivity threshold exceeded'}

Generate:
1. Short strategic analysis of why this deal is likely stalled.
2. A high-converting "Pattern Interrupt" re-engagement message draft giving the prospect an easy out.
3. Recommended immediate step.
Return strictly valid JSON.`;

        const response = await aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                stallReasonAnalysis: { type: Type.STRING },
                recommendedAction: { type: Type.STRING },
                suggestedMessage: { type: Type.STRING },
                urgencyLevel: { type: Type.STRING },
              },
              required: ['stallReasonAnalysis', 'recommendedAction', 'suggestedMessage', 'urgencyLevel'],
            },
          },
        });

        const parsed = JSON.parse(response.text || '{}');
        return res.json({
          success: true,
          data: parsed,
          source: 'GEMINI_AI',
        });
      } catch (aiErr: any) {
        console.warn('Gemini Deal Rescue error, using fallback:', aiErr.message);
      }
    }

    return res.json({
      success: true,
      data: {
        stallReasonAnalysis: `Deal has remained in "${currentStage || 'Contacted'}" without engagement for ${daysInactive || 8} days.`,
        recommendedAction: `Send a low-pressure permission-to-close email to trigger loss-aversion.`,
        suggestedMessage: `Hi ${lead.contactPerson || 'Team'},\n\nChecking in—if priorities have shifted on your end or you've decided to put this on hold, no worries at all! Should I close your file on our end for now?\n\nBest regards,\nSales Team`,
        urgencyLevel: (daysInactive || 0) > 14 ? 'CRITICAL' : 'HIGH',
      },
      source: 'HEURISTIC_FALLBACK',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// 5. LIVE GOOGLE PLACES API (NEW) - INDIA NATIONAL BUSINESS DISCOVERY
app.post('/api/places/search', async (req, res) => {
  try {
    const { category, location, radiusKm, serviceOffered } = req.body;

    if (!location || typeof location !== 'string' || !location.trim()) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_LOCATION',
        message: 'Location is required. Please specify an Indian city, town, state, or PIN code.',
      });
    }

    const searchCategory = (category && typeof category === 'string' && category.trim()) ? category.trim() : 'Businesses';
    const cleanLocation = location.trim();
    const radiusInKm = Math.max(1, Math.min(Number(radiusKm) || 15, 50));

    if (!placesApiKey) {
      return res.status(503).json({
        success: false,
        error: 'PLACES_API_KEY_UNCONFIGURED',
        message: 'Google Places API key is not configured. Please configure GOOGLE_PLACES_API_KEY in server secrets.',
      });
    }

    // STEP 1: Geocoding location validation to strictly enforce India-only discovery
    let geoLat: number | null = null;
    let geoLng: number | null = null;
    let formattedIndianAddress: string = cleanLocation;
    let isIndiaLocation = false;

    try {
      const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cleanLocation)}&key=${placesApiKey}`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (geoData.status === 'OK' && geoData.results && geoData.results.length > 0) {
        const topResult = geoData.results[0];

        // Check country component
        const countryComponent = topResult.address_components?.find((c: any) =>
          c.types?.includes('country')
        );

        if (countryComponent) {
          if (countryComponent.short_name === 'IN') {
            isIndiaLocation = true;
            formattedIndianAddress = topResult.formatted_address || cleanLocation;
            geoLat = topResult.geometry?.location?.lat ?? null;
            geoLng = topResult.geometry?.location?.lng ?? null;
          } else {
            // Explicit rejection of international locations
            return res.status(400).json({
              success: false,
              error: 'INTERNATIONAL_LOCATION_REJECTED',
              message: `Location "${cleanLocation}" was resolved to ${countryComponent.long_name} (${countryComponent.short_name}). AUTONEXA targets India nationally only. Please specify an Indian city, state, district, or PIN code (e.g. Chennai, Bengaluru, Mumbai, Delhi, Coimbatore, Vellore).`,
            });
          }
        }
      } else if (geoData.status === 'ZERO_RESULTS') {
        return res.status(404).json({
          success: false,
          error: 'LOCATION_NOT_FOUND',
          message: `Could not verify Indian location "${cleanLocation}". Please check the spelling or provide an Indian city, locality, or PIN code.`,
        });
      }
    } catch (geoErr: any) {
      console.warn('Geocoding validation error:', geoErr.message);
    }

    // STEP 2: Call Google Places API (New) - places:searchText
    const placesEndpoint = 'https://places.googleapis.com/v1/places:searchText';
    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.formattedAddress',
      'places.websiteUri',
      'places.internationalPhoneNumber',
      'places.nationalPhoneNumber',
      'places.rating',
      'places.userRatingCount',
      'places.googleMapsUri',
      'places.primaryType',
      'places.types',
      'places.location',
    ].join(',');

    const requestBody: Record<string, any> = {
      textQuery: `${searchCategory} in ${formattedIndianAddress}`,
      regionCode: 'IN',
      languageCode: 'en',
    };

    // If geocoded coordinates exist, bias strictly within the specified radius
    if (geoLat !== null && geoLng !== null) {
      requestBody.locationBias = {
        circle: {
          center: {
            latitude: geoLat,
            longitude: geoLng,
          },
          radius: radiusInKm * 1000,
        },
      };
    }

    const placesRes = await fetch(placesEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': placesApiKey,
        'X-Goog-FieldMask': fieldMask,
        'X-Goog-Maps-Solution-ID': 'gmp_mcp_codeassist_v1_aistudio',
      },
      body: JSON.stringify(requestBody),
    });

    if (placesRes.status === 429) {
      return res.status(429).json({
        success: false,
        error: 'QUOTA_EXHAUSTED',
        message: 'Google Places API quota limit reached. Please check your account quota.',
      });
    }

    if (!placesRes.ok) {
      const errText = await placesRes.text();
      console.error('Google Places API returned error:', placesRes.status, errText);
      return res.status(502).json({
        success: false,
        error: 'PLACES_API_ERROR',
        message: `Google Places API request failed with status ${placesRes.status}. Details: ${errText.slice(0, 200)}`,
      });
    }

    const placesJson = await placesRes.json();
    const rawPlaces = placesJson.places || [];

    // Filter to ensure genuine Indian addresses only
    const indianPlaces = rawPlaces.filter((p: any) => {
      const addr = p.formattedAddress || '';
      return addr.toLowerCase().includes('india') || addr.toLowerCase().includes('tamil nadu') || addr.toLowerCase().includes('karnataka') || addr.toLowerCase().includes('maharashtra') || addr.toLowerCase().includes('delhi') || addr.toLowerCase().includes('telangana') || addr.toLowerCase().includes('gujarat') || addr.toLowerCase().includes('kerala') || addr.toLowerCase().includes('uttar pradesh') || isIndiaLocation;
    });

    if (indianPlaces.length === 0) {
      return res.json({
        success: true,
        results: [],
        totalFound: 0,
        query: `${searchCategory} in ${formattedIndianAddress}`,
        location: formattedIndianAddress,
        source: 'GOOGLE_PLACES_API',
        retrievalTimestamp: new Date().toISOString(),
        message: `No matching businesses found for "${searchCategory}" in ${formattedIndianAddress}. Try expanding the search radius or adjusting the category.`,
      });
    }

    // Map genuine returned fields
    const mappedResults = indianPlaces.map((place: any, index: number) => {
      const hasWebsite = Boolean(place.websiteUri);
      const ratingsCount = place.userRatingCount || 0;
      const rating = place.rating || null;
      const cleanPhone = place.internationalPhoneNumber || place.nationalPhoneNumber || null;

      // Honest evidence-based opportunity note
      let opportunitySummary = '';
      if (!hasWebsite) {
        opportunitySummary = 'No website listed in Google Maps business profile; primary candidate for initial digital presence and online booking.';
      } else if (ratingsCount >= 100 && rating && rating >= 4.5) {
        opportunitySummary = `Strong local ratings (${rating}★, ${ratingsCount} reviews); candidate for automated booking and customer retention funnels.`;
      } else {
        opportunitySummary = `Verified website listed (${place.websiteUri}); candidate for local SEO speed and mobile conversion modernization.`;
      }

      // Transparent explainable lead score
      let calculatedScore = 65;
      if (!hasWebsite) calculatedScore += 20; // Prime client for web services
      if (cleanPhone) calculatedScore += 10; // Reachable
      if (ratingsCount > 20) calculatedScore += 5; // Established business

      return {
        id: place.id || `place_${Date.now()}_${index}`,
        placeId: place.id,
        businessName: place.displayName?.text || 'Business',
        category: place.primaryType ? place.primaryType.replace(/_/g, ' ') : searchCategory,
        location: place.formattedAddress || formattedIndianAddress,
        website: place.websiteUri || null,
        phone: cleanPhone,
        mapUrl: place.googleMapsUri || null,
        rating: rating,
        userRatingsTotal: ratingsCount,
        leadScore: Math.min(100, Math.max(20, calculatedScore)),
        source: 'GOOGLE_PLACES_API',
        retrievalTimestamp: new Date().toISOString(),
        opportunitySummary,
      };
    });

    return res.json({
      success: true,
      results: mappedResults,
      totalFound: mappedResults.length,
      query: `${searchCategory} in ${formattedIndianAddress}`,
      location: formattedIndianAddress,
      source: 'GOOGLE_PLACES_API',
      retrievalTimestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error handling places search:', err);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: err.message || 'Internal server error while searching businesses',
    });
  }
});

// Setup Vite middleware in dev or static serving in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`AUTONEXA server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start AUTONEXA server:', err);
  process.exit(1);
});
