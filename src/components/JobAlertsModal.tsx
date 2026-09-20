import React, { useState } from 'react';
import { X, Bell, Check, Plus, Trash2 } from 'lucide-react';

interface JobAlert {
  id: string;
  name: string;
  keywords: string;
  location: string;
  minMatchScore: number;
  frequency: string;
}

interface JobAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JobAlertsModal: React.FC<JobAlertsModalProps> = ({ isOpen, onClose }) => {
  const [alerts, setAlerts] = useState<JobAlert[]>([
    {
      id: '1',
      name: 'AI & Machine Learning Engineers',
      keywords: 'AI, LLM, PyTorch, Python',
      location: 'Remote, San Francisco',
      minMatchScore: 85,
      frequency: 'Daily',
    },
    {
      id: '2',
      name: 'Full Stack Staff Roles',
      keywords: 'TypeScript, React, Node.js, Cloud',
      location: 'Remote, Bengaluru',
      minMatchScore: 80,
      frequency: 'Instant',
    },
  ]);

  const [name, setName] = useState('');
  const [keywords, setKeywords] = useState('');
  const [location, setLocation] = useState('Remote');
  const [minMatch, setMinMatch] = useState(85);
  const [frequency, setFrequency] = useState('Daily');
  const [showAddForm, setShowAddForm] = useState(false);

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setAlerts([
      ...alerts,
      {
        id: Date.now().toString(),
        name,
        keywords,
        location,
        minMatchScore: minMatch,
        frequency,
      },
    ]);
    setName('');
    setKeywords('');
    setShowAddForm(false);
  };

  const handleDelete = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">Personalized Job Alerts</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1 py-4 space-y-4">
          <p className="text-xs text-slate-600">
            CareerHub scans LinkedIn, Indeed, Foundit, Wellfound, and direct career portals. When a job scores above your threshold, we notify you immediately.
          </p>

          <div className="space-y-2">
            {alerts.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{item.name}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded-md">
                      ≥{item.minMatchScore}% Match
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">{item.frequency}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    <span>Keywords: {item.keywords}</span> • <span>{item.location}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {showAddForm ? (
            <form onSubmit={handleAdd} className="p-4 border border-blue-200 bg-blue-50/40 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">New Alert Criteria</h4>
              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Alert Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Machine Learning Engineer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-700 block mb-1">Target Keywords / Skills</label>
                <input
                  type="text"
                  placeholder="e.g. PyTorch, Kubernetes, Gemini"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Minimum Match %</label>
                  <select
                    value={minMatch}
                    onChange={(e) => setMinMatch(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value={75}>≥ 75% Match</option>
                    <option value={80}>≥ 80% Match</option>
                    <option value={85}>≥ 85% Match</option>
                    <option value={90}>≥ 90% Match</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 block mb-1">Dispatch Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  >
                    <option value="Instant">Instant (Real-time)</option>
                    <option value="Daily">Daily Summary</option>
                    <option value="Weekly">Weekly Digest</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                >
                  Create Alert
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Alert Trigger</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
