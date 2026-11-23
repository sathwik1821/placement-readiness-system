import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Building2, Save, ArrowLeft } from 'lucide-react';

export default function CreateDrive() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    jobRole: '',
    ctc: '',
    workMode: 'ONSITE',
    jobDescription: '',
    location: 'Campus / Bangalore',
    deadline: '',
    minCgpa: 7.0,
    maxBacklogs: 0,
    targetBatch: 'ALL',
    departments: 'CSE, ECE, ME, CE, CHE, MME'
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const depts = form.departments.split(',').map((d) => d.trim()).filter(Boolean);
      let allowedYears = [4, 3];
      let allowedGradYears = [2027, 2028];
      if (form.targetBatch === '2027') {
        allowedYears = [4];
        allowedGradYears = [2027];
      } else if (form.targetBatch === '2028') {
        allowedYears = [3];
        allowedGradYears = [2028];
      }

      const eligibilityCriteria = {
        minCgpa: parseFloat(form.minCgpa) || 0,
        maxBacklogs: parseInt(form.maxBacklogs, 10) || 0,
        departments: depts,
        allowedYears,
        allowedGradYears
      };

      await api.post('/officer/drives', {
        title: form.title,
        jobRole: form.jobRole,
        ctc: form.ctc,
        workMode: form.workMode,
        jobDescription: form.jobDescription,
        location: form.location,
        deadline: form.deadline ? new Date(form.deadline) : null,
        eligibilityCriteria
      });

      alert('Campus placement drive published successfully!');
      navigate('/officer');
    } catch (err) {
      alert('Error creating drive: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/officer')} className="btn-secondary text-xs p-2">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Publish Campus Placement Drive
          </h1>
          <p className="text-xs text-gray-500">Configure corporate recruitment specifications and strict eligibility gates.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
        <div>
          <label className="label">Recruitment Drive Title</label>
          <input
            type="text"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Amazon WOW 2025 SDE Campus Hiring"
            className="input"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Designation / Job Role</label>
            <input
              type="text"
              required
              value={form.jobRole}
              onChange={(e) => setForm({ ...form, jobRole: e.target.value })}
              placeholder="e.g. Software Development Engineer"
              className="input"
            />
          </div>

          <div>
            <label className="label">CTC / Compensation Package</label>
            <input
              type="text"
              required
              value={form.ctc}
              onChange={(e) => setForm({ ...form, ctc: e.target.value })}
              placeholder="e.g. ₹12.5 LPA Fixed"
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Work Arrangement</label>
            <select
              value={form.workMode}
              onChange={(e) => setForm({ ...form, workMode: e.target.value })}
              className="input"
            >
              <option value="ONSITE">Onsite Campus / Office</option>
              <option value="HYBRID">Hybrid Model</option>
              <option value="REMOTE">Fully Remote</option>
            </select>
          </div>

          <div>
            <label className="label">Posting Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="e.g. Bangalore / Hyderabad"
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="label">Application Deadline</label>
          <input
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            className="input"
          />
        </div>

        <div>
          <label className="label">Job Description & Responsibilities</label>
          <textarea
            rows={4}
            required
            value={form.jobDescription}
            onChange={(e) => setForm({ ...form, jobDescription: e.target.value })}
            placeholder="Outline expected competencies, interview round formats, and day-to-day requirements..."
            className="input"
          />
        </div>

        {/* Eligibility Verification Rules */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-4">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
            Automated Eligibility Constraints
          </span>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Minimum CGPA Cutoff</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                required
                value={form.minCgpa}
                onChange={(e) => setForm({ ...form, minCgpa: e.target.value })}
                className="input font-bold"
              />
            </div>

            <div>
              <label className="label">Maximum Allowable Backlogs</label>
              <input
                type="number"
                min="0"
                required
                value={form.maxBacklogs}
                onChange={(e) => setForm({ ...form, maxBacklogs: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Eligible Graduating Batch / Year</label>
              <select
                value={form.targetBatch}
                onChange={(e) => setForm({ ...form, targetBatch: e.target.value })}
                className="input font-semibold"
              >
                <option value="ALL">All Eligible Batches (4th Year E4 & 3rd Year E3)</option>
                <option value="2027">4th Year (E4) • 2027 Graduating Batch Only (Full Time)</option>
                <option value="2028">3rd Year (E3) • 2028 Batch Only (Internship / PPO)</option>
              </select>
            </div>

            <div>
              <label className="label">Allowed Academic Departments</label>
              <input
                type="text"
                value={form.departments}
                onChange={(e) => setForm({ ...form, departments: e.target.value })}
                placeholder="CSE, ECE, ME, CE, CHE, MME or ALL"
                className="input mb-1.5"
              />
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-gray-500 font-medium mr-1">Quick Select:</span>
                {['ALL', 'CSE', 'ECE', 'ME', 'CE', 'CHE', 'MME'].map((dept) => {
                  const isSelected = form.departments === 'ALL' && dept === 'ALL'
                    || (dept !== 'ALL' && form.departments.includes(dept));
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => {
                        if (dept === 'ALL') {
                          setForm({ ...form, departments: 'ALL' });
                        } else {
                          const current = form.departments === 'ALL' || !form.departments
                            ? []
                            : form.departments.split(',').map((d) => d.trim()).filter(Boolean);
                          const updated = current.includes(dept)
                            ? current.filter((d) => d !== dept)
                            : [...current, dept];
                          setForm({ ...form, departments: updated.join(', ') });
                        }
                      }}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {dept}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/officer')}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm flex items-center gap-1.5 font-semibold text-xs py-2 px-5 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing Drive...' : 'Publish Campus Drive'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
