import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'vapi_settings';
const BOT_TYPES = [
  { value: 'receptionist', label: 'Receptionist' },
  { value: 'sales', label: 'Sales' },
  { value: 'support', label: 'Support' },
];

export default function SettingsPanel() {
  const [settings, setSettings] = useState({
    prompt: '',
    greeting: '',
    botType: 'receptionist',
    business: '',
  });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const savedSettings = localStorage.getItem(STORAGE_KEY);
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
  };

  return (
    <div className="bg-white rounded-xl shadow p-6 w-full max-w-md mx-auto mb-6">
      <h2 className="text-lg font-semibold mb-4">Agent Settings</h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-medium">Agent Prompt/Instructions</label>
        <textarea
          className="w-full border rounded-lg p-2 min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-400"
          name="prompt"
          value={settings.prompt}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-medium">Greeting Message</label>
        <input
          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          name="greeting"
          value={settings.greeting}
          onChange={handleChange}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-medium">Bot Type</label>
        <select
          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          name="botType"
          value={settings.botType}
          onChange={handleChange}
        >
          {BOT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1 font-medium">Business/Brand Name</label>
        <input
          className="w-full border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          name="business"
          value={settings.business}
          onChange={handleChange}
        />
      </div>
      <button
        className="w-full py-2 px-4 rounded-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
        onClick={handleSave}
      >
        Save Settings
      </button>
      {saved && <div className="text-green-600 mt-2 text-sm">Settings saved!</div>}
    </div>
  );
} 