import React from 'react';
import { Server, Database, FolderPlus } from 'lucide-react';

export default function AdminStatsTab({ categories, questions, openCreateCategoryModal }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center gap-2.5 mb-5 pb-3 border-b border-gray-100">
          <Server className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            System Infrastructure Status
          </h2>
        </div>
        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-gray-100">
            <span className="font-bold text-gray-700">Backend Framework</span>
            <span className="font-mono font-bold text-slate-900">Spring Boot 3.3.4 (Java 25 Ready)</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-gray-100">
            <span className="font-bold text-gray-700">Persistent Storage Engine</span>
            <span className="font-mono font-bold text-emerald-700">PostgreSQL Relational DB</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-gray-100">
            <span className="font-bold text-gray-700">Authentication & Security</span>
            <span className="font-mono font-bold text-slate-900">Stateless JWT + Spring Security RBAC</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50/70 rounded-xl border border-gray-100">
            <span className="font-bold text-gray-700">Evaluation Engine</span>
            <span className="font-mono font-bold text-slate-900">Stratified Random Sampling + Live Scoring</span>
          </div>
        </div>
      </div>

      <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Test Category Repositories
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">{categories.length} Active Tracks</span>
            <button
              onClick={openCreateCategoryModal}
              className="px-2.5 py-1 text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ Suite</span>
            </button>
          </div>
        </div>
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {categories.map((cat) => {
            const count = questions.filter(
              (q) => q.testCategoryId === cat.id || q.category?.id === cat.id
            ).length;
            return (
              <div
                key={cat.id}
                className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 text-xs transition-colors"
              >
                <div>
                  <span className="font-bold text-gray-900 block">{cat.name}</span>
                  <span className="text-xs text-gray-500 mt-0.5">{cat.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {count} {count === 1 ? 'question' : 'questions'}
                  </span>
                  <span className="badge-blue text-xs font-bold">{cat.type}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
