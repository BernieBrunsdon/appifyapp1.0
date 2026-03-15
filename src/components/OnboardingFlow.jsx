import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import BackToMarketing from './BackToMarketing';
import { clientHasDemoAgent } from '../utils/onboardingGate';
import { auth } from '../firebase/config';

const TEMPLATES = [
  { id: 'receptionist', label: 'AI Receptionist', emoji: '📞' },
  { id: 'lead_qual', label: 'Lead Qualification Agent', emoji: '🎯' },
  { id: 'appointment', label: 'Appointment Booking Agent', emoji: '📅' },
  { id: 'support', label: 'Customer Support Agent', emoji: '💬' },
  { id: 'service_business', label: 'Service Business Assistant', emoji: '🔧' },
  { id: 'custom', label: 'Custom Business Assistant', emoji: '✨' }
];

const VOICE_OPTIONS = [
  { value: 'alloy', label: 'Alloy (Neutral)' },
  { value: 'echo', label: 'Echo' },
  { value: 'fable', label: 'Fable' },
  { value: 'onyx', label: 'Onyx' },
  { value: 'nova', label: 'Nova' },
  { value: 'shimmer', label: 'Shimmer' }
];

export default function OnboardingFlow({ onComplete }) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [form, setForm] = useState({
    templateId: 'receptionist',
    businessName: '',
    agentName: '',
    businessDescription: '',
    servicesOffered: '',
    businessHours: '',
    contactEmail: '',
    notes: '',
    voice: 'alloy'
  });

  const totalSteps = 4;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (uid && (await clientHasDemoAgent(uid))) {
          if (!cancelled) navigate('/dashboard', { replace: true });
          return;
        }
        const me = await api('/api/onboarding/me');
        if (cancelled) return;
        if (me.demo_assistant_id || me.onboardingStage === 'demo_ready' || me.onboardingStage === 'build_requested') {
          navigate('/dashboard', { replace: true });
          return;
        }
      } catch {
        /* API 404 / offline — stay on onboarding or already redirected via Firestore */
      } finally {
        if (!cancelled) setChecking(false);
      }
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const next = () => currentStep < totalSteps && setCurrentStep((s) => s + 1);
  const prev = () => currentStep > 1 && setCurrentStep((s) => s - 1);

  const canNext = () => {
    if (currentStep === 1) return !!form.templateId;
    if (currentStep === 2)
      return (
        form.businessName.trim() &&
        form.agentName.trim() &&
        form.businessDescription.trim()
      );
    if (currentStep === 3) return !!form.voice;
    return true;
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const res = await api('/api/onboarding/demo-assistant', {
        method: 'POST',
        body: JSON.stringify({
          templateId: form.templateId,
          businessName: form.businessName,
          agentName: form.agentName,
          businessDescription: form.businessDescription,
          servicesOffered: form.servicesOffered,
          businessHours: form.businessHours,
          contactEmail: form.contactEmail,
          notes: form.notes,
          voice: form.voice
        })
      });
      const agent = res.agent;
      localStorage.setItem('agentData', JSON.stringify(agent));
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...user, agent }));
      onComplete?.(agent);
      navigate('/dashboard', { replace: true });
    } catch (e) {
      console.error(e);
      alert(e.message || 'Could not create demo agent. Is the API server running with VAPI_API_KEY?');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center px-4 py-8">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/screenshots/newhero.png)' }}
      />
      <div className="absolute inset-0 bg-black/60" />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-indigo-900/50" />

      <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20">
        <BackToMarketing className="px-3 py-2 rounded-lg bg-black/30 backdrop-blur-sm border border-white/10 hover:bg-white/10" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="mb-6">
          <div className="flex justify-between text-white text-sm mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-white/20 rounded-full">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-cyan-500/20">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Choose a template</h2>
              <p className="text-gray-300 mb-6">Starts your demo agent with the right tone.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => update('templateId', t.id)}
                    className={`p-4 rounded-xl border-2 text-left transition ${
                      form.templateId === t.id
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-white/20 bg-white/5 text-gray-200 hover:border-white/40'
                    }`}
                  >
                    <span className="text-2xl mr-2">{t.emoji}</span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4 text-left">
              <h2 className="text-2xl font-bold text-white">Business setup</h2>
              {[
                ['businessName', 'Business name', 'text', true],
                ['agentName', 'Agent name (how they introduce themselves)', 'text', true],
                ['businessDescription', 'Business description', 'textarea', true],
                ['servicesOffered', 'Services offered', 'textarea', false],
                ['businessHours', 'Business hours', 'text', false],
                ['contactEmail', 'Contact email', 'email', false],
                ['notes', 'Notes (optional)', 'textarea', false]
              ].map(([key, label, type, req]) =>
                type === 'textarea' ? (
                  <div key={key}>
                    <label className="text-gray-200 text-sm block mb-1">{label}</label>
                    <textarea
                      value={form[key]}
                      onChange={(e) => update(key, e.target.value)}
                      rows={key === 'businessDescription' ? 4 : 2}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-500"
                      placeholder={req ? 'Required' : 'Optional'}
                    />
                  </div>
                ) : (
                  <div key={key}>
                    <label className="text-gray-200 text-sm block mb-1">{label}</label>
                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) => update(key, e.target.value)}
                      className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
                    />
                  </div>
                )
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Voice</h2>
              <div className="grid grid-cols-2 gap-3">
                {VOICE_OPTIONS.map((v) => (
                  <button
                    key={v.value}
                    type="button"
                    onClick={() => update('voice', v.value)}
                    className={`p-3 rounded-lg border-2 text-left ${
                      form.voice === v.value
                        ? 'border-purple-500 bg-purple-500/20 text-white'
                        : 'border-white/20 text-gray-200'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="text-center text-white">
              <h2 className="text-2xl font-bold mb-4">Create your demo agent</h2>
              <p className="text-gray-300 mb-6">
                We’ll create a preview voice agent in Vapi (no phone number). You can test it from your dashboard.
              </p>
              <ul className="text-left text-gray-300 text-sm space-y-1 max-w-md mx-auto mb-6">
                <li>Template: {TEMPLATES.find((t) => t.id === form.templateId)?.label}</li>
                <li>Business: {form.businessName}</li>
                <li>Agent: {form.agentName}</li>
              </ul>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={prev}
            disabled={currentStep === 1}
            className="px-6 py-3 border border-white/30 text-white rounded-lg disabled:opacity-40"
          >
            Back
          </button>
          {currentStep < totalSteps ? (
            <button
              type="button"
              disabled={!canNext()}
              onClick={next}
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg disabled:opacity-40"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleCreate}
              className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg disabled:opacity-40"
            >
              {loading ? 'Creating…' : 'Create demo agent'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
