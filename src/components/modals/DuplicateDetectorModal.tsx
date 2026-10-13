import React from 'react';
import { useData } from '../../context/DataContext';
import { X, Copy, ArrowRight, Check, AlertCircle } from 'lucide-react';

interface DuplicateDetectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DuplicateDetectorModal: React.FC<DuplicateDetectorModalProps> = ({ isOpen, onClose }) => {
  const { detectDuplicates, mergeLeads } = useData();
  const duplicates = detectDuplicates();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
        <div className="p-5 bg-[#F8F7FF] border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#EDE9FE] flex items-center justify-center text-[#7C3AED]">
              <Copy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#17172A]">Duplicate Lead Detector</h3>
              <p className="text-xs text-[#6B7280]">
                {duplicates.length === 0
                  ? 'No duplicate prospects detected'
                  : `Found ${duplicates.length} potential duplicate pair${duplicates.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6B7280] hover:text-[#17172A] hover:bg-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {duplicates.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-[#17172A]">Pipeline Database Clean</p>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto">
                No matching web domains, identical company names, or overlapping emails detected in your active pipeline.
              </p>
            </div>
          ) : (
            duplicates.map(({ pair: [a, b], reason }, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-[#DDD6FE] bg-[#F8F7FF] space-y-3"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#7C3AED]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Match Trigger: {reason}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Lead A */}
                  <div className="p-3 bg-white rounded-lg border border-[#E5E7EB] space-y-1">
                    <span className="font-bold text-[#312E81] text-sm block truncate">{a.businessName}</span>
                    <p className="text-[#6B7280]">Stage: <span className="font-medium text-[#17172A]">{a.pipelineStage}</span></p>
                    <p className="text-[#6B7280]">Email: <span className="font-medium text-[#17172A]">{a.email || 'None'}</span></p>
                    <p className="text-[#6B7280]">Website: <span className="font-medium text-[#17172A]">{a.website || 'None'}</span></p>
                    <p className="text-[#6B7280]">Created: <span className="text-[#17172A]">{new Date(a.createdAt).toLocaleDateString()}</span></p>
                  </div>

                  {/* Lead B */}
                  <div className="p-3 bg-white rounded-lg border border-[#E5E7EB] space-y-1">
                    <span className="font-bold text-[#312E81] text-sm block truncate">{b.businessName}</span>
                    <p className="text-[#6B7280]">Stage: <span className="font-medium text-[#17172A]">{b.pipelineStage}</span></p>
                    <p className="text-[#6B7280]">Email: <span className="font-medium text-[#17172A]">{b.email || 'None'}</span></p>
                    <p className="text-[#6B7280]">Website: <span className="font-medium text-[#17172A]">{b.website || 'None'}</span></p>
                    <p className="text-[#6B7280]">Created: <span className="text-[#17172A]">{new Date(b.createdAt).toLocaleDateString()}</span></p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
                  <button
                    onClick={() => mergeLeads(a.id, b.id)}
                    className="px-3 py-1.5 text-xs font-bold bg-[#312E81] hover:bg-[#282568] text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Keep "{a.businessName}" & Merge
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => mergeLeads(b.id, a.id)}
                    className="px-3 py-1.5 text-xs font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Keep "{b.businessName}" & Merge
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-[#F8F7FF] border-t border-[#E5E7EB] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#4B5563] bg-white border border-[#E5E7EB] hover:bg-gray-50 rounded-lg cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
