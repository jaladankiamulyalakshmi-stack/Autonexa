import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  Lead,
  OpportunityScan,
  OutreachDraft,
  InteractionEvent,
  Task,
  DealAlert,
  AppSettings,
  PipelineStage,
  Channel,
  Tone,
} from '../types';
import {
  INITIAL_LEADS,
  INITIAL_SETTINGS,
  INITIAL_TASKS,
  INITIAL_INTERACTIONS,
  INITIAL_DRAFTS,
} from '../data/mockData';
import { calculateLeadScore } from '../utils/scoring';

interface DataContextType {
  leads: Lead[];
  opportunityScans: OpportunityScan[];
  outreachDrafts: OutreachDraft[];
  tasks: Task[];
  interactions: InteractionEvent[];
  dealAlerts: DealAlert[];
  settings: AppSettings;
  isLoading: boolean;

  // Lead operations
  addLead: (leadData: Partial<Lead>) => Lead;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  moveLeadStage: (id: string, newStage: PipelineStage) => void;
  markOptOut: (id: string, reason?: string) => void;
  detectDuplicates: () => { pair: [Lead, Lead]; reason: string }[];
  mergeLeads: (primaryId: string, secondaryId: string) => void;

  // Opportunity Scanner
  runOpportunityScan: (business: {
    businessName: string;
    category?: string;
    location?: string;
    website?: string;
    notes?: string;
    leadId?: string;
  }) => Promise<OpportunityScan>;

  // Outreach Workspace
  generateOutreachDraft: (params: {
    leadId: string;
    channel: Channel;
    tone: Tone;
    objective: string;
    customPrompt?: string;
  }) => Promise<OutreachDraft>;
  updateDraft: (draftId: string, updates: Partial<OutreachDraft>) => void;
  approveDraft: (draftId: string) => void;
  sendDraft: (draftId: string) => Promise<boolean>;

  // Reply Intelligence
  classifyReply: (params: {
    replyText: string;
    leadId: string;
  }) => Promise<{
    category: string;
    explanation: string;
    confidence: number;
    suggestedResponse: string;
    recommendedAction: string;
    suggestedFollowUpDays: number | null;
    isOptOut: boolean;
  }>;

  // Task & Follow-up operations
  createTask: (task: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  completeTask: (id: string) => void;
  rescheduleTask: (id: string, newDueDate: string) => void;
  deleteTask: (id: string) => void;

  // Deal Rescue Radar
  resolveDealAlert: (id: string) => void;
  requestRescueStrategy: (leadId: string, alertReason: string) => Promise<{
    stallReasonAnalysis: string;
    recommendedAction: string;
    suggestedMessage: string;
    urgencyLevel: string;
  }>;

  // Settings & System
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetToDemoData: () => void;
  importCSVLeads: (csvText: string) => { added: number; errors: string[] };
  exportAllDataJSON: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leads, setLeads] = useState<Lead[]>(() => {
    try {
      const saved = localStorage.getItem('autonexa_leads');
      return saved ? JSON.parse(saved) : INITIAL_LEADS;
    } catch {
      return INITIAL_LEADS;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem('autonexa_tasks');
      return saved ? JSON.parse(saved) : INITIAL_TASKS;
    } catch {
      return INITIAL_TASKS;
    }
  });

  const [outreachDrafts, setOutreachDrafts] = useState<OutreachDraft[]>(() => {
    try {
      const saved = localStorage.getItem('autonexa_drafts');
      return saved ? JSON.parse(saved) : INITIAL_DRAFTS;
    } catch {
      return INITIAL_DRAFTS;
    }
  });

  const [interactions, setInteractions] = useState<InteractionEvent[]>(() => {
    try {
      const saved = localStorage.getItem('autonexa_interactions');
      return saved ? JSON.parse(saved) : INITIAL_INTERACTIONS;
    } catch {
      return INITIAL_INTERACTIONS;
    }
  });

  const [opportunityScans, setOpportunityScans] = useState<OpportunityScan[]>(() => {
    try {
      const saved = localStorage.getItem('autonexa_scans');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('autonexa_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  const [resolvedAlertIds, setResolvedAlertIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('autonexa_resolved_alerts');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isLoading] = useState<boolean>(false);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('autonexa_leads', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem('autonexa_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('autonexa_drafts', JSON.stringify(outreachDrafts));
  }, [outreachDrafts]);

  useEffect(() => {
    localStorage.setItem('autonexa_interactions', JSON.stringify(interactions));
  }, [interactions]);

  useEffect(() => {
    localStorage.setItem('autonexa_scans', JSON.stringify(opportunityScans));
  }, [opportunityScans]);

  useEffect(() => {
    localStorage.setItem('autonexa_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('autonexa_resolved_alerts', JSON.stringify(resolvedAlertIds));
  }, [resolvedAlertIds]);

  // Log interaction helper
  const logInteraction = useCallback((event: Omit<InteractionEvent, 'id' | 'timestamp'>) => {
    const newEvent: InteractionEvent = {
      ...event,
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setInteractions((prev) => [newEvent, ...prev]);
    return newEvent;
  }, []);

  // Compute Deal Rescue Alerts dynamically from real data rules
  const dealAlerts = useMemo(() => {
    const alerts: DealAlert[] = [];
    const now = new Date().getTime();

    leads.forEach((lead) => {
      // Opted out contacts and closed deals are excluded from rescue suggestions
      if (lead.isOptedOut || lead.pipelineStage === 'Won' || lead.pipelineStage === 'Lost') {
        return;
      }

      const lastDate = new Date(lead.lastInteraction).getTime();
      const daysInactive = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

      // Rule 1: Proposal Sent with no reply > 5 days
      if (lead.pipelineStage === 'Proposal Sent' && daysInactive >= 5) {
        alerts.push({
          id: `alert_prop_${lead.id}`,
          leadId: lead.id,
          leadName: lead.businessName,
          currentStage: lead.pipelineStage,
          daysInactive,
          alertReason: `Proposal sent ${daysInactive} days ago with no logged confirmation or review.`,
          dealValue: lead.dealValue,
          urgency: daysInactive > 8 ? 'CRITICAL' : 'HIGH',
          recommendedAction: 'Send a "Permission to close file" re-engagement email to trigger loss-aversion.',
          suggestedMessage: `Hi ${lead.contactPerson || 'Team'},\n\nChecking in on the proposal we shared last week. If priorities have shifted on your end, no worries at all! Should I pause our follow-up for now?\n\nBest,\nSales Team`,
          resolved: resolvedAlertIds.includes(`alert_prop_${lead.id}`),
          createdAt: lead.lastInteraction,
        });
      }
      // Rule 2: Inactive > 7 days in Contacted or Qualified
      else if ((lead.pipelineStage === 'Contacted' || lead.pipelineStage === 'Qualified') && daysInactive >= 7) {
        alerts.push({
          id: `alert_inact_${lead.id}`,
          leadId: lead.id,
          leadName: lead.businessName,
          currentStage: lead.pipelineStage,
          daysInactive,
          alertReason: `No engagement recorded for ${daysInactive} days in ${lead.pipelineStage} stage.`,
          dealValue: lead.dealValue,
          urgency: daysInactive >= 12 ? 'CRITICAL' : 'HIGH',
          recommendedAction: 'Share a relevant quick video audit or bite-sized ROI benchmark.',
          suggestedMessage: `Hi ${lead.contactPerson || 'there'},\n\nJust noticed a new search competitor emerge in ${lead.location}. Put together a 90-second video breakdown comparing their booking speed with ${lead.businessName}. Want me to send the link over?\n\nCheers,\nSales Team`,
          resolved: resolvedAlertIds.includes(`alert_inact_${lead.id}`),
          createdAt: lead.lastInteraction,
        });
      }
      // Rule 3: Replied but no meeting booked > 4 days
      else if (lead.pipelineStage === 'Replied' && daysInactive >= 4) {
        alerts.push({
          id: `alert_repl_${lead.id}`,
          leadId: lead.id,
          leadName: lead.businessName,
          currentStage: lead.pipelineStage,
          daysInactive,
          alertReason: `Prospect replied positively ${daysInactive} days ago, but discovery meeting has not been locked in.`,
          dealValue: lead.dealValue,
          urgency: 'HIGH',
          recommendedAction: 'Offer 2 concrete time slots instead of open-ended calendar links.',
          suggestedMessage: `Hi ${lead.contactPerson || 'there'},\n\nFollowing up on your message—would this Thursday at 10am or Friday at 2pm work better for a brief 10-minute sync?\n\nLooking forward!`,
          resolved: resolvedAlertIds.includes(`alert_repl_${lead.id}`),
          createdAt: lead.lastInteraction,
        });
      }
    });

    return alerts;
  }, [leads, resolvedAlertIds]);

  // Lead CRUD
  const addLead = useCallback(
    (leadData: Partial<Lead>): Lead => {
      const scoring = calculateLeadScore(leadData, settings.servicesOffered);
      const newLead: Lead = {
        id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        businessName: leadData.businessName || 'Unnamed Business',
        industry: leadData.industry || 'General Business',
        location: leadData.location || 'Unknown Location',
        website: leadData.website || '',
        phone: leadData.phone || '',
        email: leadData.email || '',
        contactPerson: leadData.contactPerson || '',
        serviceOffered: leadData.serviceOffered || settings.servicesOffered[0] || 'Digital Modernization',
        opportunitySummary: leadData.opportunitySummary || 'Discovered via pipeline search',
        leadScore: scoring.score,
        priority: scoring.priority,
        scoreBreakdown: scoring.breakdown,
        pipelineStage: leadData.pipelineStage || 'New Lead',
        dealValue: leadData.dealValue || 4500,
        lastInteraction: new Date().toISOString(),
        notes: leadData.notes || '',
        leadOwner: leadData.leadOwner || 'Amulya Lakshmi',
        isOptedOut: false,
        source: leadData.source || 'Manual Entry',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setLeads((prev) => [newLead, ...prev]);

      logInteraction({
        leadId: newLead.id,
        leadName: newLead.businessName,
        eventType: 'LEAD_DISCOVERED',
        details: `Discovered and added to pipeline with score ${newLead.leadScore}/100 (${newLead.priority} priority).`,
        author: newLead.leadOwner,
      });

      return newLead;
    },
    [settings.servicesOffered, logInteraction]
  );

  const updateLead = useCallback(
    (id: string, updates: Partial<Lead>) => {
      setLeads((prev) =>
        prev.map((l) => {
          if (l.id !== id) return l;
          const merged = { ...l, ...updates, updatedAt: new Date().toISOString() };
          // Recalculate score if business fields changed
          if (
            updates.opportunitySummary !== undefined ||
            updates.website !== undefined ||
            updates.phone !== undefined ||
            updates.email !== undefined
          ) {
            const rescore = calculateLeadScore(merged, settings.servicesOffered);
            merged.leadScore = rescore.score;
            merged.priority = rescore.priority;
            merged.scoreBreakdown = rescore.breakdown;
          }
          return merged;
        })
      );
    },
    [settings.servicesOffered]
  );

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setTasks((prev) => prev.filter((t) => t.leadId !== id));
  }, []);

  const moveLeadStage = useCallback(
    (id: string, newStage: PipelineStage) => {
      const target = leads.find((l) => l.id === id);
      if (!target || target.pipelineStage === newStage) return;

      const previousStage = target.pipelineStage;
      updateLead(id, {
        pipelineStage: newStage,
        lastInteraction: new Date().toISOString(),
      });

      logInteraction({
        leadId: id,
        leadName: target.businessName,
        eventType: newStage === 'Won' ? 'DEAL_WON' : newStage === 'Lost' ? 'DEAL_LOST' : 'STAGE_CHANGED',
        details: `Moved from "${previousStage}" to "${newStage}".`,
        author: target.leadOwner,
      });

      // Fire celebratory confetti on Won deals!
      if (newStage === 'Won') {
        try {
          confetti({
            particleCount: 120,
            spread: 75,
            origin: { y: 0.6 },
            colors: ['#7C3AED', '#312E81', '#93C5FD', '#10B981'],
          });
        } catch {
          // ignore if canvas blocked
        }
      }
    },
    [leads, updateLead, logInteraction]
  );

  const markOptOut = useCallback(
    (id: string, reason = 'Contact requested removal from communications') => {
      const target = leads.find((l) => l.id === id);
      if (!target) return;

      updateLead(id, {
        isOptedOut: true,
        optedOutAt: new Date().toISOString(),
        notes: `${target.notes}\n[OPT-OUT RECORDED]: ${reason} at ${new Date().toLocaleString()}`,
      });

      // Cancel all pending tasks for this contact to guarantee compliance
      setTasks((prev) =>
        prev.map((t) => (t.leadId === id && t.status !== 'COMPLETED' ? { ...t, status: 'CANCELLED' } : t))
      );

      // Cancel drafts
      setOutreachDrafts((prev) =>
        prev.map((d) => (d.leadId === id && d.status === 'Draft' ? { ...d, status: 'Cancelled' } : d))
      );

      logInteraction({
        leadId: id,
        leadName: target.businessName,
        eventType: 'OPT_OUT_RECORDED',
        details: `Contact marked as Opted Out. Compliance guard halted all promotional sequences and cancelled open follow-ups. Reason: ${reason}`,
        author: 'AUTONEXA Compliance Guard',
      });
    },
    [leads, updateLead, logInteraction]
  );

  // Duplicate detection
  const detectDuplicates = useCallback(() => {
    const pairs: { pair: [Lead, Lead]; reason: string }[] = [];
    for (let i = 0; i < leads.length; i++) {
      for (let j = i + 1; j < leads.length; j++) {
        const a = leads[i];
        const b = leads[j];

        // Match clean domains
        const cleanDomainA = a.website?.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '').toLowerCase();
        const cleanDomainB = b.website?.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/.*$/, '').toLowerCase();

        if (cleanDomainA && cleanDomainB && cleanDomainA.length > 4 && cleanDomainA === cleanDomainB) {
          pairs.push({ pair: [a, b], reason: `Matching domain: ${cleanDomainA}` });
          continue;
        }

        // Match clean email
        if (a.email && b.email && a.email.toLowerCase() === b.email.toLowerCase()) {
          pairs.push({ pair: [a, b], reason: `Matching contact email: ${a.email}` });
          continue;
        }

        // Match exact business name
        if (a.businessName.toLowerCase().trim() === b.businessName.toLowerCase().trim()) {
          pairs.push({ pair: [a, b], reason: `Exact matching business name: "${a.businessName}"` });
        }
      }
    }
    return pairs;
  }, [leads]);

  const mergeLeads = useCallback(
    (primaryId: string, secondaryId: string) => {
      const primary = leads.find((l) => l.id === primaryId);
      const secondary = leads.find((l) => l.id === secondaryId);
      if (!primary || !secondary) return;

      const mergedNotes = `${primary.notes}\n[Merged with ${secondary.businessName}]: ${secondary.notes || 'No extra notes'}`.trim();
      updateLead(primaryId, {
        notes: mergedNotes,
        phone: primary.phone || secondary.phone,
        email: primary.email || secondary.email,
        website: primary.website || secondary.website,
        contactPerson: primary.contactPerson || secondary.contactPerson,
      });

      // Migrate tasks & interactions
      setTasks((prev) =>
        prev.map((t) => (t.leadId === secondaryId ? { ...t, leadId: primaryId, leadName: primary.businessName } : t))
      );
      setInteractions((prev) =>
        prev.map((act) =>
          act.leadId === secondaryId ? { ...act, leadId: primaryId, leadName: primary.businessName } : act
        )
      );

      // Remove secondary
      deleteLead(secondaryId);

      logInteraction({
        leadId: primaryId,
        leadName: primary.businessName,
        eventType: 'SCORE_UPDATED',
        details: `Merged duplicate record for "${secondary.businessName}" into primary account.`,
        author: primary.leadOwner,
      });
    },
    [leads, updateLead, deleteLead, logInteraction]
  );

  // Opportunity Scanner API
  const runOpportunityScan = useCallback(
    async (business: {
      businessName: string;
      category?: string;
      location?: string;
      website?: string;
      notes?: string;
      leadId?: string;
    }): Promise<OpportunityScan> => {
      const res = await fetch('/api/ai/scan-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: business.businessName,
          category: business.category,
          location: business.location,
          website: business.website,
          notes: business.notes,
          userServices: settings.servicesOffered.join(', '),
          icp: settings.icpDescription,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to run AI opportunity scan');
      }

      const json = await res.json();
      const data = json.data;

      const scan: OpportunityScan = {
        id: `scan_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        leadId: business.leadId,
        businessName: business.businessName,
        category: business.category || 'Local Business',
        location: business.location || 'Local Area',
        website: business.website,
        opportunityTitle: data.opportunityTitle,
        opportunityDetails: data.opportunityDetails,
        evidenceFound: data.evidenceFound,
        confidenceLevel: data.confidenceLevel || 'HIGH',
        serviceFitScore: data.serviceFitScore || 85,
        recommendedAction: data.recommendedAction,
        suggestedOpener: data.suggestedOpener,
        hypotheses: data.hypotheses || [],
        risksOrGaps: data.risksOrGaps || [],
        source: json.source,
        createdAt: new Date().toISOString(),
      };

      setOpportunityScans((prev) => [scan, ...prev]);

      if (business.leadId) {
        updateLead(business.leadId, {
          opportunitySummary: data.opportunityTitle + ' — ' + data.evidenceFound,
          lastInteraction: new Date().toISOString(),
        });
        logInteraction({
          leadId: business.leadId,
          leadName: business.businessName,
          eventType: 'OPPORTUNITY_SCANNED',
          details: `AI Scan detected: ${data.opportunityTitle} (Confidence: ${data.confidenceLevel}).`,
          author: 'AI Opportunity Scanner',
        });
      }

      return scan;
    },
    [settings, updateLead, logInteraction]
  );

  // Outreach Drafts
  const generateOutreachDraft = useCallback(
    async (params: {
      leadId: string;
      channel: Channel;
      tone: Tone;
      objective: string;
      customPrompt?: string;
    }): Promise<OutreachDraft> => {
      const target = leads.find((l) => l.id === params.leadId);
      if (!target) throw new Error('Lead not found');

      if (target.isOptedOut) {
        throw new Error('Communication Blocked: Contact has opted out of promotional communications.');
      }

      const res = await fetch('/api/ai/generate-outreach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: target,
          userService: target.serviceOffered || settings.servicesOffered[0],
          channel: params.channel,
          tone: params.tone,
          objective: params.objective,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to generate outreach draft');
      }

      const json = await res.json();
      const data = json.data;

      const draft: OutreachDraft = {
        id: `draft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        leadId: target.id,
        leadName: target.businessName,
        leadEmail: target.email || undefined,
        channel: params.channel,
        tone: params.tone,
        subject: data.subject,
        messageBody: data.messageBody,
        openingHook: data.openingHook,
        valueProposition: data.valueProposition,
        callToAction: data.callToAction,
        status: 'Draft',
        simulated: settings.demoMode,
        createdAt: new Date().toISOString(),
      };

      setOutreachDrafts((prev) => [draft, ...prev]);

      logInteraction({
        leadId: target.id,
        leadName: target.businessName,
        eventType: 'OUTREACH_DRAFTED',
        details: `Generated personalized ${params.channel} draft with ${params.tone} tone.`,
        author: 'AI Outreach Engine',
      });

      return draft;
    },
    [leads, settings, logInteraction]
  );

  const updateDraft = useCallback((draftId: string, updates: Partial<OutreachDraft>) => {
    setOutreachDrafts((prev) => prev.map((d) => (d.id === draftId ? { ...d, ...updates } : d)));
  }, []);

  const approveDraft = useCallback(
    (draftId: string) => {
      const draft = outreachDrafts.find((d) => d.id === draftId);
      if (!draft) return;

      updateDraft(draftId, {
        status: 'Awaiting Approval',
        approvedAt: new Date().toISOString(),
      });

      logInteraction({
        leadId: draft.leadId,
        leadName: draft.leadName,
        eventType: 'OUTREACH_APPROVED',
        details: `Outreach draft approved for dispatch to ${draft.leadName}.`,
        author: 'Amulya Lakshmi',
      });
    },
    [outreachDrafts, updateDraft, logInteraction]
  );

  const sendDraft = useCallback(
    async (draftId: string): Promise<boolean> => {
      const draft = outreachDrafts.find((d) => d.id === draftId);
      if (!draft) return false;

      const target = leads.find((l) => l.id === draft.leadId);
      if (target?.isOptedOut) {
        throw new Error('Compliance Violation: Cannot send outreach to an opted-out contact.');
      }

      await new Promise((r) => setTimeout(r, 600));

      updateDraft(draftId, {
        status: 'Sent',
        sentAt: new Date().toISOString(),
      });

      // Update lead stage to Contacted if it was in New Lead or Qualified
      if (target && (target.pipelineStage === 'New Lead' || target.pipelineStage === 'Qualified')) {
        moveLeadStage(target.id, 'Contacted');
      } else if (target) {
        updateLead(target.id, { lastInteraction: new Date().toISOString() });
      }

      // Schedule automated smart follow-up in 3 days
      const dueDate = new Date(Date.now() + settings.defaultFollowUpIntervalDays * 86400000).toISOString();
      createTask({
        leadId: draft.leadId,
        leadName: draft.leadName,
        title: `Follow up on sent ${draft.channel} with ${draft.leadName}`,
        description: `Verify if prospect opened the message regarding: ${draft.subject || draft.openingHook}`,
        dueDate,
        priority: 'HIGH',
        status: 'PENDING',
        type: 'Follow-up Email',
        assignedTo: target?.leadOwner || 'Amulya Lakshmi',
      });

      logInteraction({
        leadId: draft.leadId,
        leadName: draft.leadName,
        eventType: 'OUTREACH_SENT',
        details: settings.demoMode
          ? `[SIMULATION]: Personalized ${draft.channel} delivered to ${draft.leadName}. Follow-up scheduled for ${new Date(dueDate).toLocaleDateString()}.`
          : `Personalized ${draft.channel} sent to ${draft.leadName}.`,
        author: 'Outreach Workspace',
      });

      return true;
    },
    [outreachDrafts, leads, settings, updateDraft, moveLeadStage, updateLead, logInteraction]
  );

  // Reply Intelligence
  const classifyReply = useCallback(
    async (params: { replyText: string; leadId: string }) => {
      const target = leads.find((l) => l.id === params.leadId);

      const res = await fetch('/api/ai/classify-reply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          replyText: params.replyText,
          leadContext: target,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to classify reply');
      }

      const json = await res.json();
      const data = json.data;

      if (target) {
        // If opt-out, trigger opt-out compliance handler
        if (data.isOptOut || data.category === 'Opt Out') {
          markOptOut(target.id, 'Opt-out phrase detected in inbound reply');
        } else {
          // If interested, advance lead stage to Replied
          if (data.category === 'Interested' || data.category === 'Asking for Pricing') {
            if (target.pipelineStage === 'Contacted' || target.pipelineStage === 'Qualified') {
              moveLeadStage(target.id, 'Replied');
            }
          }

          updateLead(target.id, {
            lastInteraction: new Date().toISOString(),
            notes: `${target.notes}\n[Inbound Reply Classified: ${data.category}]: "${params.replyText.substring(0, 100)}..."`,
          });

          // Schedule follow up if suggested
          if (data.suggestedFollowUpDays) {
            const followUpDate = new Date(Date.now() + data.suggestedFollowUpDays * 86400000).toISOString();
            createTask({
              leadId: target.id,
              leadName: target.businessName,
              title: `Respond to ${target.businessName} (${data.category})`,
              description: data.recommendedAction,
              dueDate: followUpDate,
              priority: 'HIGH',
              status: 'PENDING',
              type: 'Follow-up Email',
              assignedTo: target.leadOwner,
            });
          }

          logInteraction({
            leadId: target.id,
            leadName: target.businessName,
            eventType: 'REPLY_RECEIVED',
            details: `Inbound reply classified as "${data.category}" (${data.confidence}% confidence). Action: ${data.recommendedAction}`,
            author: 'AI Reply Intelligence',
          });
        }
      }

      return data;
    },
    [leads, markOptOut, moveLeadStage, updateLead, logInteraction]
  );

  // Task operations
  const createTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  }, []);

  const completeTask = useCallback(
    (id: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      updateTask(id, {
        status: 'COMPLETED',
        completedAt: new Date().toISOString(),
      });

      if (task.leadId && task.leadName) {
        logInteraction({
          leadId: task.leadId,
          leadName: task.leadName,
          eventType: 'TASK_COMPLETED',
          details: `Completed task: "${task.title}".`,
          author: task.assignedTo || 'Amulya Lakshmi',
        });
      }
    },
    [tasks, updateTask, logInteraction]
  );

  const rescheduleTask = useCallback(
    (id: string, newDueDate: string) => {
      const task = tasks.find((t) => t.id === id);
      if (!task) return;

      updateTask(id, {
        dueDate: newDueDate,
        status: 'PENDING',
      });

      if (task.leadId && task.leadName) {
        logInteraction({
          leadId: task.leadId,
          leadName: task.leadName,
          eventType: 'FOLLOWUP_RESCHEDULED',
          details: `Follow-up "${task.title}" rescheduled to ${new Date(newDueDate).toLocaleDateString()}.`,
          author: task.assignedTo || 'Amulya Lakshmi',
        });
      }
    },
    [tasks, updateTask, logInteraction]
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Deal Rescue Radar resolution & AI advice
  const resolveDealAlert = useCallback((id: string) => {
    setResolvedAlertIds((prev) => [...prev, id]);
  }, []);

  const requestRescueStrategy = useCallback(
    async (leadId: string, alertReason: string) => {
      const target = leads.find((l) => l.id === leadId);
      if (!target) throw new Error('Lead not found');

      const now = new Date().getTime();
      const lastDate = new Date(target.lastInteraction).getTime();
      const daysInactive = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));

      const res = await fetch('/api/ai/deal-rescue-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead: target,
          daysInactive,
          currentStage: target.pipelineStage,
          alertReason,
        }),
      });

      if (!res.ok) throw new Error('Failed to generate rescue strategy');
      const json = await res.json();
      return json.data;
    },
    [leads]
  );

  // Settings & System utilities
  const updateSettings = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetToDemoData = useCallback(() => {
    setLeads(INITIAL_LEADS);
    setTasks(INITIAL_TASKS);
    setOutreachDrafts(INITIAL_DRAFTS);
    setInteractions(INITIAL_INTERACTIONS);
    setOpportunityScans([]);
    setResolvedAlertIds([]);
    setSettings(INITIAL_SETTINGS);

    localStorage.removeItem('autonexa_leads');
    localStorage.removeItem('autonexa_tasks');
    localStorage.removeItem('autonexa_drafts');
    localStorage.removeItem('autonexa_interactions');
    localStorage.removeItem('autonexa_scans');
    localStorage.removeItem('autonexa_resolved_alerts');
  }, []);

  const importCSVLeads = useCallback(
    (csvText: string): { added: number; errors: string[] } => {
      const lines = csvText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0);
      if (lines.length < 2) {
        return { added: 0, errors: ['CSV file must contain a header row and at least one data row.'] };
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase().replace(/["']/g, ''));
      const nameIndex = headers.findIndex((h) => h.includes('name') || h.includes('business') || h.includes('company'));
      const catIndex = headers.findIndex((h) => h.includes('category') || h.includes('industry') || h.includes('type'));
      const locIndex = headers.findIndex((h) => h.includes('location') || h.includes('city') || h.includes('address'));
      const webIndex = headers.findIndex((h) => h.includes('web') || h.includes('url') || h.includes('domain'));
      const phoneIndex = headers.findIndex((h) => h.includes('phone') || h.includes('tel') || h.includes('mobile'));
      const emailIndex = headers.findIndex((h) => h.includes('mail'));
      const personIndex = headers.findIndex((h) => h.includes('contact') || h.includes('owner') || h.includes('person'));

      if (nameIndex === -1) {
        return { added: 0, errors: ['Could not find a column for Business Name or Company Name in header row.'] };
      }

      let count = 0;
      const errors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''));
        const businessName = parts[nameIndex];
        if (!businessName || businessName.length < 2) {
          errors.push(`Row ${i + 1}: Skipped due to missing business name.`);
          continue;
        }

        addLead({
          businessName,
          industry: catIndex !== -1 ? parts[catIndex] : 'Local Business',
          location: locIndex !== -1 ? parts[locIndex] : 'Local Area',
          website: webIndex !== -1 ? parts[webIndex] : '',
          phone: phoneIndex !== -1 ? parts[phoneIndex] : '',
          email: emailIndex !== -1 ? parts[emailIndex] : '',
          contactPerson: personIndex !== -1 ? parts[personIndex] : '',
          source: 'CSV Upload',
          pipelineStage: 'New Lead',
        });
        count++;
      }

      return { added: count, errors };
    },
    [addLead]
  );

  const exportAllDataJSON = useCallback(() => {
    const payload = {
      appName: 'AUTONEXA',
      exportDate: new Date().toISOString(),
      leads,
      tasks,
      outreachDrafts,
      interactions,
      opportunityScans,
      settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AUTONEXA_Pipeline_Export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [leads, tasks, outreachDrafts, interactions, opportunityScans, settings]);

  return (
    <DataContext.Provider
      value={{
        leads,
        opportunityScans,
        outreachDrafts,
        tasks,
        interactions,
        dealAlerts,
        settings,
        isLoading,
        addLead,
        updateLead,
        deleteLead,
        moveLeadStage,
        markOptOut,
        detectDuplicates,
        mergeLeads,
        runOpportunityScan,
        generateOutreachDraft,
        updateDraft,
        approveDraft,
        sendDraft,
        classifyReply,
        createTask,
        updateTask,
        completeTask,
        rescheduleTask,
        deleteTask,
        resolveDealAlert,
        requestRescueStrategy,
        updateSettings,
        resetToDemoData,
        importCSVLeads,
        exportAllDataJSON,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
