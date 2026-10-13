export type PipelineStage =
  | 'New Lead'
  | 'Qualified'
  | 'Contacted'
  | 'Replied'
  | 'Meeting Scheduled'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export type Priority = 'HIGH' | 'MEDIUM' | 'LOW';

export type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type TaskType =
  | 'Follow-up Email'
  | 'Discovery Call'
  | 'Send Proposal'
  | 'Audit Presentation'
  | 'Contract Review'
  | 'Meeting Prep'
  | 'Check-in';

export type Channel = 'Email' | 'LinkedIn' | 'Phone Script';

export type Tone = 'Professional' | 'Friendly' | 'Concise' | 'Bold';

export type ReplyCategory =
  | 'Interested'
  | 'Asking for Pricing'
  | 'Needs More Information'
  | 'Objection'
  | 'Follow Up Later'
  | 'Not Interested'
  | 'Wrong Contact'
  | 'Out of Office'
  | 'Opt Out'
  | 'Unclear';

export interface ScoreBreakdown {
  serviceFit: number; // 0-25
  industryRelevance: number; // 0-20
  locationMatch: number; // 0-15
  evidenceFound: number; // 0-20
  contactability: number; // 0-10
  profileCompleteness: number; // 0-10
  positiveFactors: string[];
  negativeFactors: string[];
  missingInfo: string[];
  recommendedAction: string;
}

export interface Lead {
  id: string;
  placeId?: string;
  businessName: string;
  industry: string;
  location: string;
  website: string | null;
  phone?: string | null;
  email?: string | null;
  contactPerson?: string;
  serviceOffered: string;
  opportunitySummary: string;
  leadScore: number;
  priority: Priority;
  scoreBreakdown: ScoreBreakdown;
  pipelineStage: PipelineStage;
  dealValue: number;
  lastInteraction: string;
  nextFollowUpDate?: string;
  notes: string;
  leadOwner: string;
  isOptedOut: boolean;
  optedOutAt?: string;
  source: string;
  mapUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityScan {
  id: string;
  leadId?: string;
  businessName: string;
  category: string;
  location: string;
  website?: string;
  opportunityTitle: string;
  opportunityDetails: string;
  evidenceFound: string;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'HYPOTHESIS';
  serviceFitScore: number;
  recommendedAction: string;
  suggestedOpener: string;
  hypotheses: string[];
  risksOrGaps: string[];
  source: string;
  createdAt: string;
}

export interface OutreachDraft {
  id: string;
  leadId: string;
  leadName: string;
  leadEmail?: string;
  channel: Channel;
  tone: Tone;
  subject?: string;
  messageBody: string;
  openingHook: string;
  valueProposition: string;
  callToAction: string;
  status: 'Draft' | 'Awaiting Approval' | 'Sent' | 'Failed' | 'Cancelled';
  simulated: boolean;
  approvedAt?: string;
  sentAt?: string;
  createdAt: string;
}

export interface InteractionEvent {
  id: string;
  leadId: string;
  leadName: string;
  eventType:
    | 'LEAD_DISCOVERED'
    | 'OPPORTUNITY_SCANNED'
    | 'SCORE_UPDATED'
    | 'OUTREACH_DRAFTED'
    | 'OUTREACH_APPROVED'
    | 'OUTREACH_SENT'
    | 'REPLY_RECEIVED'
    | 'MEETING_SCHEDULED'
    | 'TASK_COMPLETED'
    | 'FOLLOWUP_RESCHEDULED'
    | 'STAGE_CHANGED'
    | 'DEAL_WON'
    | 'DEAL_LOST'
    | 'OPT_OUT_RECORDED';
  details: string;
  author: string;
  timestamp: string;
}

export interface Task {
  id: string;
  leadId?: string;
  leadName?: string;
  title: string;
  description?: string;
  dueDate: string; // ISO date string YYYY-MM-DDTHH:mm:ss
  priority: Priority;
  status: TaskStatus;
  type: TaskType;
  assignedTo: string;
  createdAt: string;
  completedAt?: string;
}

export interface DealAlert {
  id: string;
  leadId: string;
  leadName: string;
  currentStage: PipelineStage;
  daysInactive: number;
  alertReason: string;
  dealValue: number;
  urgency: 'CRITICAL' | 'HIGH' | 'ATTENTION';
  stallReasonAnalysis?: string;
  recommendedAction: string;
  suggestedMessage: string;
  resolved: boolean;
  createdAt: string;
}

export interface DiscoveredBusiness {
  id: string;
  placeId?: string;
  businessName: string;
  category: string;
  location: string;
  website?: string | null;
  phone?: string | null;
  mapUrl?: string | null;
  rating?: number | null;
  userRatingsTotal?: number | null;
  leadScore: number;
  source: string;
  discoveredAt?: string;
  retrievalTimestamp?: string;
  opportunitySummary: string;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  companyName: string;
  role: string;
  avatarUrl?: string;
}

export interface AppSettings {
  companyName: string;
  servicesOffered: string[];
  icpDescription: string;
  defaultTone: Tone;
  defaultFollowUpIntervalDays: number;
  scoringWeights: {
    serviceFit: number;
    industryRelevance: number;
    locationMatch: number;
    evidenceFound: number;
    contactability: number;
    profileCompleteness: number;
  };
  demoMode: boolean;
}
