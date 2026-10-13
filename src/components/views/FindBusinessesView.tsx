import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { DiscoveredBusiness } from '../../types';
import {
  Search,
  MapPin,
  Building2,
  Globe,
  Phone,
  Star,
  Plus,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  SlidersHorizontal,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';

interface FindBusinessesViewProps {
  onNavigateToScanner: (business: DiscoveredBusiness) => void;
  onNavigateToLeads: () => void;
}

export const FindBusinessesView: React.FC<FindBusinessesViewProps> = ({
  onNavigateToScanner,
  onNavigateToLeads,
}) => {
  const { addLead, importCSVLeads, settings } = useData();

  // Search parameters - strictly defaults to India
  const [category, setCategory] = useState('Dental & Healthcare Clinics');
  const [location, setLocation] = useState('Bengaluru, Karnataka');
  const [serviceOffered, setServiceOffered] = useState(
    settings.servicesOffered[0] || 'Website Modernization & Online Booking'
  );
  const [radiusKm, setRadiusKm] = useState('15');
  const [minLeadScore, setMinLeadScore] = useState(60);
  const [icpNote, setIcpNote] = useState(
    'High-margin local clinics and service providers seeking automated appointment booking and inquiry response'
  );

  // Search state & results
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<DiscoveredBusiness[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Feedback & alerts
  const [errorType, setErrorType] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<{
    total: number;
    location: string;
    timestamp?: string;
    query?: string;
  } | null>(null);

  // CSV Import State
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [csvContent, setCsvContent] = useState('');
  const [importSummary, setImportSummary] = useState<{ added: number; errors: string[] } | null>(null);

  // Quick category suggestions
  const popularCategories = [
    'Dental & Healthcare Clinics',
    'Specialist Doctors & Hospitals',
    'Law Firms & Advocates',
    'Chartered Accountants & Financial',
    'Architects & Interior Designers',
    'Software & IT Consultancies',
    'Fine Dining & Cafes',
  ];

  // Quick Indian Hub suggestions
  const popularIndianHubs = [
    'Bengaluru, Karnataka',
    'Mumbai, Maharashtra',
    'Delhi NCR',
    'Chennai, Tamil Nadu',
    'Hyderabad, Telangana',
    'Pune, Maharashtra',
    'Kolkata, West Bengal',
    'Ahmedabad, Gujarat',
    'Coimbatore, Tamil Nadu',
    'Jaipur, Rajasthan',
  ];

  // Search execution via backend Google Places API (New)
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorType(null);
    setErrorMsg(null);
    setSuccessNotice(null);

    try {
      const res = await fetch('/api/places/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: category.trim(),
          location: location.trim(),
          serviceOffered,
          radiusKm: Number(radiusKm) || 15,
          radius: Number(radiusKm) || 15,
          minScore: minLeadScore,
        }),
      });

      if (res.status === 429) {
        window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
        setErrorType('QUOTA');
        setErrorMsg('Google Places API quota limit reached. Please check your account quota.');
        setIsLoading(false);
        setHasSearched(true);
        return;
      }

      const data = await res.json();

      if (!res.ok) {
        setErrorType(data.error || 'ERROR');
        setErrorMsg(data.message || 'Failed to search places.');
        setSearchResults([]);
        setHasSearched(true);
        return;
      }

      if (data.results && Array.isArray(data.results)) {
        setSearchResults(data.results);
        setSuccessNotice({
          total: data.results.length,
          location: data.location || location,
          timestamp: data.retrievalTimestamp,
          query: data.query,
        });
      } else {
        setSearchResults([]);
      }
      setHasSearched(true);
    } catch (err: any) {
      console.error('Search error', err);
      setErrorType('NETWORK_ERROR');
      setErrorMsg(err.message || 'Unable to connect to live discovery server. Check connection.');
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === searchResults.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(searchResults.map((b) => b.id));
    }
  };

  // Add individual business to pipeline
  const handleAddSingleToPipeline = (biz: DiscoveredBusiness) => {
    addLead({
      placeId: biz.placeId,
      businessName: biz.businessName,
      industry: biz.category,
      location: biz.location,
      website: biz.website || null,
      phone: biz.phone || null,
      mapUrl: biz.mapUrl || null,
      opportunitySummary: biz.opportunitySummary,
      serviceOffered,
      source: 'Google Places API (Live)',
      pipelineStage: 'New Lead',
    });
    // Remove from unadded selection
    setSelectedIds((prev) => prev.filter((id) => id !== biz.id));
  };

  // Add all selected businesses to lead pipeline
  const handleAddSelectedToPipeline = () => {
    const toAdd = searchResults.filter((b) => selectedIds.includes(b.id));
    toAdd.forEach((b) => {
      addLead({
        placeId: b.placeId,
        businessName: b.businessName,
        industry: b.category,
        location: b.location,
        website: b.website || null,
        phone: b.phone || null,
        mapUrl: b.mapUrl || null,
        opportunitySummary: b.opportunitySummary,
        serviceOffered,
        source: 'Google Places API (Live)',
        pipelineStage: 'New Lead',
      });
    });

    setSelectedIds([]);
    onNavigateToLeads();
  };

  const copyPhoneNumber = (phone: string, id: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // CSV Import handler
  const handleCSVSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvContent.trim()) return;
    const res = importCSVLeads(csvContent);
    setImportSummary(res);
  };

  const sampleCSVTemplate = `Business Name,Category,Location,Website,Phone,Contact Person,Notes
Apollo Dental Clinic,Dental Clinic,Bengaluru Karnataka,https://apollodental.in,+91 80 2661 6555,Dr. Srinivas,Inquiry forms need modernization
Heritage Legal Associates,Legal,MG Road Bengaluru,,+91 80 4120 8899,Adv. Ramanathan,No active website on file`;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-[#312E81] tracking-tight">
              India Business Discovery
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Google Places API
            </span>
          </div>
          <p className="text-xs text-[#6B7280] mt-1">
            Discover verified Indian businesses in real-time, detect digital gaps, and route qualified leads into your pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCSVModal(true)}
            className="px-3.5 py-2 text-xs font-semibold bg-white border border-[#DDD6FE] text-[#312E81] hover:bg-[#EDE9FE]/50 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-[#7C3AED]" />
            Import Leads via CSV
          </button>
        </div>
      </div>

      {/* Discovery Query Form */}
      <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] card-shadow">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">
                Target Category / Industry
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Dental Clinics, Law Firms"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
                />
              </div>
              {/* Quick Category Chips */}
              <div className="flex flex-wrap gap-1 mt-2">
                {popularCategories.slice(0, 3).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#EDE9FE]/60 text-[#312E81] hover:bg-[#EDE9FE] transition-colors cursor-pointer"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">
                Indian City / Locality / PIN Code
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru, Mumbai, Chennai, 560001"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
                />
              </div>
              {/* Quick Indian Hub Chips */}
              <div className="flex flex-wrap gap-1 mt-2">
                {popularIndianHubs.slice(0, 4).map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setLocation(city)}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-[#EDE9FE]/60 text-[#312E81] hover:bg-[#EDE9FE] transition-colors cursor-pointer"
                  >
                    {city.split(',')[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Service You Offer</label>
              <select
                value={serviceOffered}
                onChange={(e) => setServiceOffered(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
              >
                {settings.servicesOffered.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">
                Search Radius: <span className="text-[#7C3AED] font-bold">{radiusKm} km</span>
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                className="w-full mt-2 accent-[#7C3AED] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#9CA3AF] mt-1">
                <span>5 km</span>
                <span>25 km</span>
                <span>50 km</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#F3F4F6] grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Ideal Customer Profile Focus</label>
              <input
                type="text"
                value={icpNote}
                onChange={(e) => setIcpNote(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white text-[#4B5563]"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2.5 text-xs font-bold text-white bg-[#312E81] hover:bg-[#282568] disabled:opacity-50 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Querying Google Places...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-[#93C5FD]" />
                    Discover Indian Businesses
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Specific Error & Notice Handling */}
      {errorType === 'INTERNATIONAL_LOCATION_REJECTED' && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-950">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>India-Only Business Discovery Policy</span>
          </div>
          <p className="text-[11px] leading-relaxed">{errorMsg}</p>
          <div className="pt-1 flex flex-wrap gap-1.5 items-center">
            <span className="text-[10px] font-semibold text-amber-800">Quick selection:</span>
            {popularIndianHubs.slice(0, 5).map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => {
                  setLocation(city);
                  setErrorType(null);
                  setErrorMsg(null);
                }}
                className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 cursor-pointer"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}

      {errorType && errorType !== 'INTERNATIONAL_LOCATION_REJECTED' && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-red-950">Discovery Request Notice</p>
            <p className="text-[11px] text-red-800 leading-relaxed">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Live Provider Success Summary */}
      {successNotice && !errorType && (
        <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Verified Live Places Data:</strong> Found {successNotice.total} places matching "{category}" in {successNotice.location}.
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-mono">
            Provider: Google Places API (New)
          </span>
        </div>
      )}

      {/* Search Results Area */}
      {hasSearched && (
        <div className="bg-white rounded-2xl border border-[#E5E7EB] card-shadow overflow-hidden space-y-4 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F3F4F6]">
            <div>
              <h3 className="text-sm font-bold text-[#312E81]">
                Discovered Prospects ({searchResults.length})
              </h3>
              <p className="text-xs text-[#6B7280]">
                Live results in {location} within {radiusKm} km radius
              </p>
            </div>

            {searchResults.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="px-3 py-1.5 text-xs font-semibold text-[#4B5563] bg-gray-50 hover:bg-gray-100 rounded-lg cursor-pointer"
                >
                  {selectedIds.length === searchResults.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  type="button"
                  disabled={selectedIds.length === 0}
                  onClick={handleAddSelectedToPipeline}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-40 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Selected to Pipeline ({selectedIds.length})
                </button>
              </div>
            )}
          </div>

          {searchResults.length === 0 ? (
            <div className="py-12 text-center text-[#6B7280] space-y-2">
              <Search className="w-8 h-8 text-[#9CA3AF] mx-auto" />
              <p className="text-xs font-semibold text-[#17172A]">No businesses returned for this query</p>
              <p className="text-[11px] max-w-sm mx-auto">
                Try widening your search radius, selecting a major Indian city hub, or broadening the business category.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((biz) => {
                const isSelected = selectedIds.includes(biz.id);
                return (
                  <div
                    key={biz.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-[#7C3AED] bg-[#EDE9FE]/20 ring-1 ring-[#7C3AED]'
                        : 'border-[#E5E7EB] bg-white hover:border-[#DDD6FE] hover:shadow-xs'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelect(biz.id)}
                            className="w-4 h-4 rounded text-[#7C3AED] accent-[#7C3AED] cursor-pointer mt-0.5"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-[#17172A] leading-tight line-clamp-2">
                              {biz.businessName}
                            </h4>
                            <span className="text-[10px] text-[#6B7280] font-medium capitalize">
                              {biz.category}
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-[#EDE9FE] text-[#312E81]">
                            Score: {biz.leadScore}
                          </span>
                          {biz.rating && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              {biz.rating} ({biz.userRatingsTotal || 0})
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-[#6B7280] flex items-start gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#7C3AED] shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{biz.location}</span>
                      </p>

                      <div className="p-2.5 rounded-lg bg-[#F8F7FF] border border-[#E5E7EB] text-[11px] text-[#4B5563] space-y-1">
                        <span className="text-[10px] font-bold text-[#7C3AED] uppercase block">
                          Observed Digital Gap:
                        </span>
                        <p className="leading-relaxed line-clamp-2">{biz.opportunitySummary}</p>
                      </div>

                      <div className="text-[11px] space-y-1.5 text-[#6B7280] pt-1">
                        {biz.website ? (
                          <div className="flex items-center justify-between gap-2">
                            <a
                              href={biz.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 truncate text-[#312E81] hover:text-[#7C3AED] hover:underline"
                            >
                              <Globe className="w-3 h-3 text-[#9CA3AF] shrink-0" />
                              <span className="truncate">{biz.website.replace(/^https?:\/\//, '')}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                            </a>
                          </div>
                        ) : (
                          <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold inline-block">
                            No active website indexed on Google
                          </span>
                        )}

                        {biz.phone && (
                          <div className="flex items-center justify-between gap-2">
                            <a
                              href={`tel:${biz.phone}`}
                              className="flex items-center gap-1.5 text-[#4B5563] hover:text-[#312E81]"
                            >
                              <Phone className="w-3 h-3 text-[#9CA3AF] shrink-0" />
                              <span className="font-mono text-[10px]">{biz.phone}</span>
                            </a>
                            <button
                              type="button"
                              onClick={() => copyPhoneNumber(biz.phone!, biz.id)}
                              className="p-1 text-[#9CA3AF] hover:text-[#312E81] rounded cursor-pointer"
                              title="Copy Phone Number"
                            >
                              {copiedId === biz.id ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        )}

                        {biz.mapUrl && (
                          <div className="pt-0.5">
                            <a
                              href={biz.mapUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-[#7C3AED] hover:underline flex items-center gap-1"
                            >
                              <MapPin className="w-2.5 h-2.5" />
                              View Google Maps Profile
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleAddSingleToPipeline(biz)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-[#312E81] bg-[#EDE9FE]/50 hover:bg-[#EDE9FE] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3 text-[#7C3AED]" />
                        Add to Leads
                      </button>

                      <button
                        type="button"
                        onClick={() => onNavigateToScanner(biz)}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-[#7C3AED] hover:bg-[#6D28D9] rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                      >
                        <Sparkles className="w-3 h-3" />
                        Scan AI Gap
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* CSV Import Modal */}
      {showCSVModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-[#E5E7EB]">
            <div className="flex items-center justify-between border-b border-[#E5E7EB] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#7C3AED]" />
                <h3 className="text-base font-bold text-[#17172A]">Import Businesses via CSV</h3>
              </div>
              <button
                onClick={() => {
                  setShowCSVModal(false);
                  setImportSummary(null);
                }}
                className="p-1 text-[#6B7280] hover:text-[#17172A] rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {importSummary ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-2">
                <p className="font-bold text-emerald-800">
                  Successfully imported {importSummary.added} leads into pipeline!
                </p>
                {importSummary.errors.length > 0 && (
                  <ul className="text-amber-800 list-disc list-inside space-y-0.5">
                    {importSummary.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                )}
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setShowCSVModal(false);
                      setImportSummary(null);
                      onNavigateToLeads();
                    }}
                    className="px-4 py-2 bg-[#312E81] text-white font-bold rounded-lg cursor-pointer"
                  >
                    View in Pipeline
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCSVSubmit} className="space-y-4">
                <p className="text-xs text-[#6B7280]">
                  Paste your raw CSV content below or use our standard schema format with headers:
                  <code className="block bg-[#F8F7FF] p-2 rounded mt-1 font-mono text-[10px] text-[#312E81]">
                    Business Name, Category, Location, Website, Phone, Contact Person, Notes
                  </code>
                </p>

                <textarea
                  required
                  rows={6}
                  value={csvContent}
                  onChange={(e) => setCsvContent(e.target.value)}
                  placeholder={sampleCSVTemplate}
                  className="w-full p-3 font-mono text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
                />

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setCsvContent(sampleCSVTemplate)}
                    className="text-xs text-[#7C3AED] font-semibold hover:underline cursor-pointer"
                  >
                    Load Sample Indian CSV Template
                  </button>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCSVModal(false)}
                      className="px-3.5 py-1.5 text-xs text-[#6B7280] hover:text-[#17172A] cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold text-white bg-[#312E81] hover:bg-[#282568] rounded-xl cursor-pointer"
                    >
                      Process & Import
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
