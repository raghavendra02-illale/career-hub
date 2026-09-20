import React, { useState } from 'react';
import { ApplicationAnswer } from '../types.ts';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  Tag,
  Search,
  Sparkles,
  X,
  Bookmark,
} from 'lucide-react';

interface AnswerBankViewProps {
  answers: ApplicationAnswer[];
  onSaveAnswer: (question: string, answer: string, category?: string) => Promise<void>;
  onDeleteAnswer: (id: number) => Promise<void>;
}

export const AnswerBankView: React.FC<AnswerBankViewProps> = ({
  answers,
  onSaveAnswer,
  onDeleteAnswer,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('general');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const filteredAnswers = answers.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return a.question.toLowerCase().includes(q) || a.answer.toLowerCase().includes(q) || a.category.toLowerCase().includes(q);
  });

  const handleSaveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim()) return;
    setIsSaving(true);
    try {
      await onSaveAnswer(question.trim(), answer.trim(), category);
      setShowAddModal(false);
      setQuestion('');
      setAnswer('');
      setCategory('general');
    } catch (e: any) {
      alert('Error saving answer: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div id="answer-bank-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Application Answer Bank</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Store verified answers to repetitive job application questions (compensation, relocation, motivation, sponsorship) for seamless 1-click autofill.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-2xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Reusable Answer</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search answers by question or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Answers Grid */}
      {filteredAnswers.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 shadow-2xs">
          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No answers stored yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Save answers to common application screening questions so CareerHub can automatically fill them for you.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
          >
            Add First Answer
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAnswers.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-700 uppercase tracking-wider rounded-md">
                    {item.category}
                  </span>
                  <button
                    onClick={() => {
                      if (confirm('Delete this answer?')) onDeleteAnswer(item.id);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded"
                    title="Delete Answer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-xs font-bold text-slate-900">{item.question}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {item.answer}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                <span>Autofill ready</span>
                <span>Updated {new Date(item.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Answer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-200 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Reusable Application Answer</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubmit} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Question or Prompt *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Why do you want to join our company?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
                >
                  <option value="general">General</option>
                  <option value="compensation">Compensation & Salary</option>
                  <option value="relocation">Relocation & Location</option>
                  <option value="sponsorship">Work Authorization & Visa</option>
                  <option value="motivation">Motivation & Culture</option>
                  <option value="technical">Technical Architecture</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Your Standard Verified Answer *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Enter your verified answer here..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-xs font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  disabled={isSaving}
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl"
                >
                  {isSaving ? 'Saving...' : 'Save to Answer Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
