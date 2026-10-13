import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { OpportunityScan, DiscoveredBusiness } from '../../types';
import {
  Sparkles,
  Search,
  CheckCircle,
  AlertTriangle,
  Send,
  Plus,
  RefreshCw,
  Building2,
  ExternalLink,
  ShieldCheck,
  HelpCircle,
  Zap,
} from 'lucide-react';

interface OpportunityScannerViewProps {
  initialBusiness?: DiscoveredBusiness | null;
  onNavigateToOutreach: (leadId: string) => void;
  onNavigateToLeads: () => void;
}

export const OpportunityScannerView: React.FC<OpportunityScannerViewProps> = ({
  initialBusiness,
  onNavigateToOutreach,
  onNavigateToLeads,
}) => {
  const { runOpportunityScan, opportunityScans, leads, addLead, settings } = useData();

  // Selected prospect form - defaults to Indian context
  const [businessName, setBusinessName] = useState(
    initialBusiness?.businessName || 'Revive Dental Clinic'
  );
  const [category, setCategory] = useState(
    initialBusiness?.category || 'Healthcare / Dental Clinic'
  );
  const [location, setLocation] = useState(
    initialBusiness?.location || 'Bengaluru, Karnataka'
  );
  const [website, setWebsite] = useState(initialBusiness?.website || '');
  const [notes, setNotes] = useState(
    initialBusiness?.opportunitySummary ||
      'Strong Google Maps rating (4.8★ with 440+ reviews); lacks automated patient booking and WhatsApp follow-up funnel'
  );

  const [isScanning, setIsScanning] = useState(false);
  const [latestScan, setLatestScan] = useState<OpportunityScan | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  // Sync state if initialBusiness changes
  React.useEffect(() => {
    if (initialBusiness) {
      setBusinessName(initialBusiness.businessName);
      setCategory(initialBusiness.category);
      setLocation(initialBusiness.location);
      setWebsite(initialBusiness.website || '');
      setNotes(initialBusiness.opportunitySummary || '');
      setLatestScan(null);
    }
  }, [initialBusiness]);

  const handleRunScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!businessName.trim()) return;

    setIsScanning(true);
    setScanError(null);

    try {
      const scan = await runOpportunityScan({
        businessName,
        category,
        location,
        website,
        notes,
      });
      setLatestScan(scan);
    } catch (err: any) {
      setScanError(err.message || 'Failed to complete AI opportunity scan.');
    } finally {
      setIsScanning(false);
    }
  };

  // Push opportunity into pipeline as a qualified lead
  const handleAddToPipeline = () => {
    if (!latestScan) return;

    const existingLead = leads.find(
      (l) => l.businessName.toLowerCase() === latestScan.businessName.toLowerCase()
    );

    if (existingLead) {
      alert(`"${latestScan.businessName}" is already in your lead pipeline!`);
      return;
    }

    const newLead = addLead({
      businessName: latestScan.businessName,
      industry: latestScan.category,
      location: latestScan.location,
      website: latestScan.website,
      opportunitySummary: `${latestScan.opportunityTitle} — ${latestScan.evidenceFound}`,
      serviceOffered: settings.servicesOffered[0],
      source: 'AI Opportunity Scanner',
      pipelineStage: 'Qualified',
    });

    alert(`Added "${newLead.businessName}" to active pipeline with lead score ${newLead.leadScore}/100!`);
    onNavigateToLeads();
  };

  const confidenceBadge = (level: 'HIGH' | 'MEDIUM' | 'HYPOTHESIS') => {
    if (level === 'HIGH') {
      return (
        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          High Confidence
        </span>
      );
    }
    if (level === 'MEDIUM') {
      return (
        <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
          <CheckCircle className="w-3.5 h-3.5" />
          Medium Confidence
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
        <HelpCircle className="w-3.5 h-3.5" />
        AI Hypothesis
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#312E81] tracking-tight">
            AI Business Opportunity Scanner
          </h1>
          <p className="text-xs text-[#6B7280] mt-1">
            Detect verified digital vulnerabilities, evaluate service alignment, and generate evidence-based openers with Gemini AI.
          </p>
        </div>
      </div>

      {/* Main Grid: Input Form vs Scan Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scanner Input Configuration */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E5E7EB] card-shadow space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-[#F3F4F6]">
            <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#17172A]">Target Prospect Profile</h3>
              <p className="text-[11px] text-[#6B7280]">Enter prospect data to scan for revenue gaps</p>
            </div>
          </div>

          <form onSubmit={handleRunScan} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Business Name</label>
              <input
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Skyline Chiropractic & Spine"
                className="w-full px-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#17172A] mb-1">Industry</label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#17172A] mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">
                Website URL <span className="text-[#6B7280] font-normal">(leave blank if no website found)</span>
              </label>
              <input
                type="text"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Directory / Initial Observations</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Has active Google reviews but website takes 9 seconds to load on mobile..."
                className="w-full p-2.5 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isScanning}
              className="w-full py-2.5 text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isScanning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#93C5FD]" />
                  Scanning Digital Infrastructure...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#93C5FD]" />
                  Run AI Opportunity Scan
                </>
              )}
            </button>
          </form>

          {scanError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
              {scanError}
            </div>
          )}
        </div>

        {/* Scan Results & Opportunity Breakdown */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-[#E5E7EB] card-shadow space-y-5">
          {!latestScan && !isScanning ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#EDE9FE] text-[#7C3AED] flex items-center justify-center mx-auto">
                <Sparkles className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-[#17172A]">Ready to Scan for Sales Opportunities</h3>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto leading-relaxed">
                Click "Run AI Opportunity Scan" to diagnose digital gaps, mobile speed issues, missing booking funnels, and verified revenue opportunities.
              </p>
              <button
                onClick={() => handleRunScan()}
                className="px-4 py-2 text-xs font-bold text-white bg-[#312E81] hover:bg-[#282568] rounded-xl cursor-pointer"
              >
                Scan "{businessName}" Now
              </button>
            </div>
          ) : isScanning ? (
            <div className="text-center py-16 space-y-4">
              <div className="w-12 h-12 rounded-full border-4 border-[#EDE9FE] border-t-[#7C3AED] animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#312E81]">Analyzing Digital Footprint...</p>
                <p className="text-xs text-[#6B7280]">
                  Comparing {businessName} against {settings.companyName}'s service models with Gemini AI.
                </p>
              </div>
            </div>
          ) : latestScan ? (
            <div className="space-y-5 animate-in fade-in">
              {/* Scan Header */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#EDE9FE] via-[#F8F7FF] to-white border border-[#DDD6FE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold text-[#312E81]">{latestScan.businessName}</h3>
                    {confidenceBadge(latestScan.confidenceLevel)}
                  </div>
                  <p className="text-xs text-[#6B7280] mt-0.5">
                    {latestScan.category} • {latestScan.location}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#6B7280] uppercase">Service Fit Score</span>
                  <div className="text-2xl font-black text-[#7C3AED]">
                    {latestScan.serviceFitScore}
                    <span className="text-xs font-normal text-[#6B7280]">/100</span>
                  </div>
                </div>
              </div>

              {/* Opportunity Core Findings */}
              <div className="p-4 rounded-xl bg-white border border-[#E5E7EB] space-y-3">
                <span className="text-xs font-bold text-[#312E81] uppercase tracking-wider block">
                  Identified Opportunity
                </span>
                <p className="text-sm font-bold text-[#17172A] leading-snug">
                  {latestScan.opportunityTitle}
                </p>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  {latestScan.opportunityDetails}
                </p>
              </div>

              {/* Verified Evidence vs AI Hypotheses */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    Verified Evidence Checked
                  </span>
                  <p className="text-xs text-emerald-900 leading-relaxed">
                    {latestScan.evidenceFound}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <span className="text-xs font-bold text-amber-800 flex items-center gap-1.5 uppercase">
                    <HelpCircle className="w-4 h-4 text-amber-600" />
                    AI Market Hypotheses
                  </span>
                  <ul className="text-xs text-amber-900 space-y-1 list-disc list-inside">
                    {latestScan.hypotheses.map((h, i) => (
                      <li key={i}>{h}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Suggested Opening Pitch Hook */}
              <div className="p-4 rounded-xl bg-[#F8F7FF] border border-[#DDD6FE] space-y-2">
                <span className="text-xs font-bold text-[#7C3AED] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Suggested Personalized Opening Hook
                </span>
                <p className="text-xs text-[#17172A] italic bg-white p-3 rounded-lg border border-[#E5E7EB] leading-relaxed">
                  "{latestScan.suggestedOpener}"
                </p>
                <p className="text-[11px] text-[#6B7280]">
                  <strong>Recommended Next Action:</strong> {latestScan.recommendedAction}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => handleRunScan()}
                  className="px-3.5 py-2 text-xs font-semibold text-[#4B5563] bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Rescan
                </button>
                <button
                  type="button"
                  onClick={handleAddToPipeline}
                  className="px-4 py-2 text-xs font-bold text-white bg-[#312E81] hover:bg-[#282568] rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#93C5FD]" />
                  Add Qualified Opportunity to Pipeline
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
