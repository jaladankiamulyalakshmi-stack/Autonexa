import { Lead, ScoreBreakdown, Priority } from '../types';

export function calculateLeadScore(
  data: Partial<Lead>,
  servicesOffered: string[] = ['Website Development', 'Booking Automation', 'SEO', 'Sales Funnels']
): { score: number; priority: Priority; breakdown: ScoreBreakdown } {
  let serviceFit = 15;
  let industryRelevance = 12;
  let locationMatch = 10;
  let evidenceFound = 10;
  let contactability = 4;
  let profileCompleteness = 5;

  const positiveFactors: string[] = [];
  const negativeFactors: string[] = [];
  const missingInfo: string[] = [];

  // 1. Service Fit
  const opp = (data.opportunitySummary || '').toLowerCase();
  const serv = (data.serviceOffered || servicesOffered.join(' ')).toLowerCase();
  if (opp.includes('website') || opp.includes('booking') || opp.includes('seo') || opp.includes('mobile')) {
    serviceFit = 24;
    positiveFactors.push('Strong alignment between prospect digital gaps and your core service offering.');
  } else if (opp.length > 20) {
    serviceFit = 19;
    positiveFactors.push('Clear operational enhancement opportunity identified.');
  } else {
    serviceFit = 10;
    negativeFactors.push('Generic opportunity description; service alignment needs deeper discovery.');
  }

  // 2. Industry Relevance
  const highConversionIndustries = ['healthcare', 'medical', 'dental', 'clinic', 'legal', 'law', 'real estate', 'contractor', 'b2b', 'consulting', 'home services'];
  const ind = (data.industry || '').toLowerCase();
  if (highConversionIndustries.some(k => ind.includes(k))) {
    industryRelevance = 19;
    positiveFactors.push(`High-converting industry tier (${data.industry}) with high average deal size.`);
  } else if (ind.length > 2) {
    industryRelevance = 14;
    positiveFactors.push(`Viable commercial market segment (${data.industry}).`);
  } else {
    industryRelevance = 8;
    negativeFactors.push('Industry category not clearly specified.');
  }

  // 3. Location Match
  if (data.location && data.location.length > 3) {
    locationMatch = 14;
    positiveFactors.push(`Verified operating location: ${data.location}.`);
  } else {
    locationMatch = 5;
    missingInfo.push('Exact city/region location coordinates');
  }

  // 4. Evidence of Opportunity
  if (data.opportunitySummary && data.opportunitySummary.length > 30) {
    evidenceFound = 19;
    positiveFactors.push('Documented digital pain point with verifiable evidence.');
  } else if (!data.website) {
    evidenceFound = 18;
    positiveFactors.push('No verified active website found—immediate prime prospect for web setup.');
  } else {
    evidenceFound = 11;
    negativeFactors.push('Scan data is preliminary; verify specific website speed or booking issues.');
  }

  // 5. Contactability
  const hasPhone = Boolean(data.phone && data.phone.trim().length > 5);
  const hasEmail = Boolean(data.email && data.email.includes('@'));
  if (hasPhone && hasEmail) {
    contactability = 10;
    positiveFactors.push('Direct multi-channel contact paths available (Direct phone & email verified).');
  } else if (hasPhone || hasEmail) {
    contactability = 7;
    positiveFactors.push(`Single channel reachable (${hasPhone ? 'Phone' : 'Email'}).`);
    missingInfo.push(hasPhone ? 'Direct decision-maker email' : 'Office direct phone line');
  } else {
    contactability = 2;
    negativeFactors.push('No direct contact phone or email found.');
    missingInfo.push('Contact email and phone number');
  }

  // 6. Profile Completeness
  if (data.contactPerson && data.contactPerson.trim().length > 2) {
    profileCompleteness += 3;
    positiveFactors.push(`Identified decision-maker contact person: ${data.contactPerson}.`);
  } else {
    missingInfo.push('Target decision-maker full name');
  }

  if (data.website && data.website.startsWith('http')) {
    profileCompleteness += 2;
  }

  const rawScore = serviceFit + industryRelevance + locationMatch + evidenceFound + contactability + profileCompleteness;
  const score = Math.min(100, Math.max(10, Math.round(rawScore)));

  let priority: Priority = 'LOW';
  if (score >= 80) priority = 'HIGH';
  else if (score >= 50) priority = 'MEDIUM';

  let recommendedAction = 'Generate a personalized outreach draft highlighting their specific digital opportunity.';
  if (missingInfo.length > 1) {
    recommendedAction = `Enrich lead record with ${missingInfo[0]} prior to launching outreach campaign.`;
  } else if (score >= 85) {
    recommendedAction = 'High priority prospect: Schedule immediate discovery call outreach via Email & LinkedIn.';
  }

  return {
    score,
    priority,
    breakdown: {
      serviceFit,
      industryRelevance,
      locationMatch,
      evidenceFound,
      contactability,
      profileCompleteness,
      positiveFactors,
      negativeFactors,
      missingInfo,
      recommendedAction,
    },
  };
}
