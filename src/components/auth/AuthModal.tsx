import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { AutonexaLogo } from '../brand/AutonexaLogo';
import { Mail, Lock, User, Building, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { login, signup, quickDemoLogin, error, clearError, isLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('demo@autonexa.io');
  const [password, setPassword] = useState('Autonexa123!');
  const [companyName, setCompanyName] = useState('Acme Growth Labs');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (isSignUp) {
      await signup(name, email, password, companyName);
    } else {
      await login(email, password);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl border border-[#E5E7EB] overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        {/* Left Branding / Hero panel */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#312E81] via-[#3730A3] to-[#4338CA] p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#7C3AED]/20 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#93C5FD]/15 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10"></div>

          <div className="relative z-10">
            <AutonexaLogo size="lg" variant="white" showTagline={true} />
            <div className="mt-8">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#EDE9FE]/20 text-white border border-white/20">
                <Sparkles className="w-3.5 h-3.5 text-[#93C5FD]" />
                Sales Pipeline Autopilot
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold mt-4 leading-tight">
                Turn Local Business Searches Into Closed High-Value Deals.
              </h2>
              <p className="text-indigo-100 text-sm mt-3 leading-relaxed">
                AUTONEXA continuously scans markets, pinpoints verified digital gaps, generates hyper-personalized outreach, and rescues stalling deals before they go cold.
              </p>
            </div>
          </div>

          <div className="relative z-10 space-y-3.5 my-8">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-indigo-100">
              <CheckCircle2 className="w-5 h-5 text-[#93C5FD] shrink-0" />
              <span>Area-based business discovery with Google Places</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-indigo-100">
              <CheckCircle2 className="w-5 h-5 text-[#93C5FD] shrink-0" />
              <span>AI Opportunity Scanner with explainable lead scores</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-indigo-100">
              <CheckCircle2 className="w-5 h-5 text-[#93C5FD] shrink-0" />
              <span>Personalized Gemini outreach & reply intelligence</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-indigo-100">
              <CheckCircle2 className="w-5 h-5 text-[#93C5FD] shrink-0" />
              <span>Deal Rescue Radar & automated follow-up cadences</span>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/10 text-xs text-indigo-200">
            © {new Date().getFullYear()} AUTONEXA. Built for high-velocity sales teams.
          </div>
        </div>

        {/* Right Form panel */}
        <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-md w-full mx-auto">
            {/* Quick Demo Access banner */}
            <div className="mb-6 p-4 rounded-xl bg-[#EDE9FE] border border-[#DDD6FE] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#312E81] uppercase tracking-wider">Fast Evaluation</p>
                <p className="text-xs text-[#4338CA] mt-0.5">Explore full pipeline with preloaded demo data</p>
              </div>
              <button
                type="button"
                onClick={quickDemoLogin}
                className="px-3.5 py-2 text-xs font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                1-Click Demo Sign In
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="text-center sm:text-left mb-6">
              <h3 className="text-2xl font-bold text-[#17172A]">
                {isSignUp ? 'Create your AUTONEXA account' : 'Welcome back'}
              </h3>
              <p className="text-sm text-[#6B7280] mt-1">
                {isSignUp
                  ? 'Start automating your sales prospecting pipeline today'
                  : 'Enter your credentials to access your sales workspace'}
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#17172A] mb-1">Full Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Amulya Lakshmi"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg text-sm text-[#17172A] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#17172A] mb-1">Company / Agency Name</label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Nexa Growth Labs"
                        className="w-full pl-10 pr-4 py-2.5 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg text-sm text-[#17172A] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#17172A] mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg text-sm text-[#17172A] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17172A] mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#9CA3AF] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8F7FF] border border-[#E5E7EB] rounded-lg text-sm text-[#17172A] focus:outline-none focus:ring-2 focus:ring-[#7C3AED] focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-[#312E81] hover:bg-[#282568] text-white font-semibold rounded-lg text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <span>Authenticating...</span>
                ) : isSignUp ? (
                  <span>Create Account & Launch</span>
                ) : (
                  <span>Sign In to Autopilot</span>
                )}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-[#6B7280]">
              {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
              <button
                type="button"
                onClick={() => {
                  clearError();
                  setIsSignUp(!isSignUp);
                }}
                className="font-bold text-[#7C3AED] hover:underline cursor-pointer"
              >
                {isSignUp ? 'Sign in' : 'Create an account'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
