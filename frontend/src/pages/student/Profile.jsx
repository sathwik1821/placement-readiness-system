import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import { User, Target, Save, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    department: '',
    semester: 8,
    cgpa: 0,
    graduationYear: 2025,
    backlogs: 0,
    phone: '',
    portfolioLink: '',
    skills: '',
    interests: ''
  });

  const [careerGoal, setCareerGoal] = useState({
    targetRole: 'Software Developer',
    targetDomain: 'Engineering',
    targetIndustry: 'Technology'
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await api.get('/students/profile');
        const data = res.data;
        setProfile(data);

        let parsedSkills = [];
        try { parsedSkills = JSON.parse(data.skills); } catch { parsedSkills = []; }
        let parsedInterests = [];
        try { parsedInterests = JSON.parse(data.interests); } catch { parsedInterests = []; }

        setForm({
          name: data.name || '',
          department: data.department || '',
          semester: data.semester || 8,
          cgpa: data.cgpa || 0,
          graduationYear: data.graduationYear || 2025,
          backlogs: data.backlogs || 0,
          phone: data.phone || '',
          portfolioLink: data.portfolioLink || '',
          skills: parsedSkills.join(', '),
          interests: parsedInterests.join(', ')
        });

        if (data.careerGoal) {
          setCareerGoal({
            targetRole: data.careerGoal.targetRole || 'Software Developer',
            targetDomain: data.careerGoal.targetDomain || 'Engineering',
            targetIndustry: data.careerGoal.targetIndustry || 'Technology'
          });
        }
      } catch (err) {
        console.error('Failed fetching student profile', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const skillsArray = form.skills.split(',').map((s) => s.trim()).filter(Boolean);
      const interestsArray = form.interests.split(',').map((s) => s.trim()).filter(Boolean);

      await Promise.all([
        api.put('/students/profile', {
          ...form,
          skills: skillsArray,
          interests: interestsArray
        }),
        api.put('/students/career-goal', careerGoal)
      ]);

      // Trigger analysis recalculation
      await api.post('/analysis/generate').catch(() => { });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Error updating profile: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
          Student Profile & Career Goal Repository
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Maintain verified academic credentials, verified skills, and target role ontologies.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile and Career Goal successfully updated! AI models refreshed.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Career Goal Selection */}
        <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <Target className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Primary Target Career Goal
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Target Industry Job Role</label>
              <select
                value={careerGoal.targetRole}
                onChange={(e) => setCareerGoal({ ...careerGoal, targetRole: e.target.value })}
                className="input"
              >
                <option value="Software Developer">Software Developer (SDE-1)</option>
                <option value="Full Stack Developer">Full Stack Engineer</option>
                <option value="Systems Engineer">Systems & Embedded Engineer</option>
                <option value="Data Analyst">Data Analyst & Quantitative Trainee</option>
                <option value="DevOps Engineer">DevOps & Cloud Automation Engineer</option>
              </select>
            </div>

            <div>
              <label className="label">Domain Track</label>
              <input
                type="text"
                value={careerGoal.targetDomain}
                onChange={(e) => setCareerGoal({ ...careerGoal, targetDomain: e.target.value })}
                placeholder="e.g. Distributed Cloud Systems"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Academic & Personal Records */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Academic & Contact Metrics
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Full Candidate Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="label">Department / Branch</label>
              <input
                type="text"
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="label">Cumulative Grade Point Average (CGPA / 10)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={form.cgpa}
                onChange={(e) => setForm({ ...form, cgpa: parseFloat(e.target.value) || 0 })}
                className="input font-bold"
              />
            </div>

            <div>
              <label className="label">Active Backlogs Count</label>
              <input
                type="number"
                min="0"
                required
                value={form.backlogs}
                onChange={(e) => setForm({ ...form, backlogs: parseInt(e.target.value, 10) || 0 })}
                className="input"
              />
            </div>

            <div>
              <label className="label">Current Academic Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value, 10) || 8 })}
                className="input"
              />
            </div>

            <div>
              <label className="label">Graduation Year</label>
              <input
                type="number"
                value={form.graduationYear}
                onChange={(e) => setForm({ ...form, graduationYear: parseInt(e.target.value, 10) || 2025 })}
                className="input"
              />
            </div>

            <div>
              <label className="label">Contact Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label className="label">Portfolio or GitHub URL</label>
              <input
                type="url"
                value={form.portfolioLink}
                onChange={(e) => setForm({ ...form, portfolioLink: e.target.value })}
                placeholder="https://github.com/..."
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Technical Skills & Interests */}
        <div className="card">
          <div className="space-y-4">
            <div>
              <label className="label">
                Verified Technical Skills <span className="text-gray-400 font-normal">(Comma-delimited)</span>
              </label>
              <input
                type="text"
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                placeholder="e.g. Python, React, SQL, Docker, C++"
                className="input"
              />
            </div>

            <div>
              <label className="label">
                Professional Interests <span className="text-gray-400 font-normal">(Comma-delimited)</span>
              </label>
              <input
                type="text"
                value={form.interests}
                onChange={(e) => setForm({ ...form, interests: e.target.value })}
                placeholder="e.g. Microservices, AI/ML Engineering, Cloud Security"
                className="input"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary bg-blue-600 hover:bg-blue-500 py-3 px-6 text-xs sm:text-sm font-bold flex items-center gap-2 rounded-xl shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Persisting Changes...' : 'Save & Sync AI Models'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
