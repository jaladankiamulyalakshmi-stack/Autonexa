import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { X, Building2, MapPin, Globe, Phone, Mail, User, DollarSign, Sparkles } from 'lucide-react';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (newLeadId: string) => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({ isOpen, onClose, onCreated }) => {
  const { addLead, settings } = useData();
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('Healthcare & Medical');
  const [location, setLocation] = useState('Austin, TX');
  const [website, setWebsite] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [serviceOffered, setServiceOffered] = useState(settings.servicesOffered[0] || 'Website Modernization');
  const [dealValue, setDealValue] = useState('5000');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim()) return;

    const newLead = addLead({
      businessName: businessName.trim(),
      industry,
      location,
      website: website.trim(),
      phone: phone.trim(),
      email: email.trim(),
      contactPerson: contactPerson.trim(),
      serviceOffered,
      dealValue: parseFloat(dealValue) || 4500,
      notes: notes.trim(),
      source: 'Direct Manual Entry',
      pipelineStage: 'New Lead',
    });

    onClose();
    if (onCreated) onCreated(newLead.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="p-5 bg-[#F8F7FF] border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17172A]">Add New Lead to Pipeline</h3>
              <p className="text-xs text-[#6B7280]">Score and priority will calculate automatically</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#17172A] hover:bg-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#17172A] mb-1">
                Business Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Skyline Dental Specialists"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Industry / Category</label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="Healthcare, Legal, Real Estate..."
                className="w-full px-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Location</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Website URL (optional)</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Estimated Deal Value ($)</label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="number"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  placeholder="5000"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Contact Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="lead@company.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Decision Maker Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Dr. Jane Smith, Owner"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Service to Pitch</label>
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

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#17172A] mb-1">Initial Discovery Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="Mention any verified gap or competitor observation..."
                className="w-full p-3 text-xs bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-[#6B7280] hover:bg-gray-100 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#312E81] hover:bg-[#282568] rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#93C5FD]" />
              Add Lead & Calculate Score
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
