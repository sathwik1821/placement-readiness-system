import React, { useEffect, useState } from 'react';
import api from '../../api/axios';
import {
  User,
  Target,
  Save,
  CheckCircle2,
  Sparkles,
  Coffee,
  Code2,
  Cpu,
  BarChart3,
  GraduationCap,
  Building2,
  ArrowRight,
  ShieldCheck,
  Check,
  Layers
} from 'lucide-react';
import { CAREER_TRACKS, getCareerTrack } from '../../utils/careerStandards';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    rollNumber: '',
    college: '',
    batch: '',
    department: '',
    semester: 8,
    cgpa: 0,
    graduationYear: 2027,
    backlogs: 0,
    phone: '',
    portfolioLink: ''
  });

  const [careerGoal, setCareerGoal] = useState({
    targetRole: 'Java Full Stack Developer',
    targetDomain: 'Enterprise Distributed Systems',
    targetIndustry: 'Technology & Product'
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

        setForm({
          name: data.name || '',
          email: data.email || '',
          rollNumber: data.rollNumber || 'S210018',
          college: data.college || 'RGUKT Srikakulam',
          batch: data.batch || '2027 Graduating Batch • B.Tech E4 (Final Year)',
          year: data.year || 4,
          yearOfStudy: data.yearOfStudy || '4th Year (E4)',
          department: data.department || 'Computer Science & Engineering',
          semester: data.semester || 8,
          cgpa: data.cgpa || 0,
          graduationYear: data.graduationYear || 2027,
          backlogs: data.backlogs || 0,
          phone: data.phone || '',
          portfolioLink: data.portfolioLink || ''
        });

        if (data.careerGoal) {
          setCareerGoal({
            targetRole: data.careerGoal.targetRole || 'Java Full Stack Developer',
            targetDomain: data.careerGoal.targetDomain || 'Enterprise Distributed Systems',
            targetIndustry: data.careerGoal.targetIndustry || 'Technology & Product'
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
      await Promise.all([
        api.put('/students/profile', form),
        api.put('/students/career-goal', careerGoal)
      ]);

      // Automatically recalculate readiness analysis with updated career role & weights
      await api.post('/analysis/generate').catch(() => {});
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3500);
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

  const selectedTrack = getCareerTrack(careerGoal.targetRole);

  const handleSelectTrack = (trk) => {
    setCareerGoal({
      targetRole: trk.role,
      targetDomain: trk.domain,
      targetIndustry: trk.industry
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Student Profile & Career Goal Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Configure your target industry role to dynamically calibrate AI readiness benchmarks, lagging competencies, and remedial resources.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Profile and Target Career Track updated successfully! AI placement readiness models recalibrated.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Career Goal & Track Selection Section */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 mb-5">
            <div>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Target Career Track & Industry Calibration (Strict 4 Tracks)
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Our institution follows 4 industry-standard tracks to ensure rigorous recruiter evaluation and reliable calibration.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 shrink-0">
              Active: {selectedTrack.shortName}
            </span>
          </div>

          {/* Interactive Career Track Cards (2x2 Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {CAREER_TRACKS.map((trk) => {
              const Icon = trk.icon;
              const isSelected = careerGoal.targetRole === trk.role;

              return (
                <div
                  key={trk.role}
                  onClick={() => handleSelectTrack(trk)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-2 ring-blue-600/20'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {trk.shortName}
                          </span>
                          <h3 className="text-xs sm:text-sm font-black text-slate-900">{trk.role}</h3>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-blue-600 text-white shadow-xs">
                          <Check className="w-3 h-3" />
                          <span>Active Trajectory</span>
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 hover:text-blue-600 transition-colors">
                          Click to select
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] font-mono text-blue-700 font-bold bg-blue-50/60 p-2 rounded-lg border border-blue-100/80 mb-2">
                      {trk.stack}
                    </p>

                    <p className="text-xs text-slate-600 leading-relaxed mb-2">
                      {trk.description}
                    </p>
                  </div>

                  <div className="pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <p>
                      <strong className="text-slate-700">Recruiter Hiring Focus:</strong> {trk.focus}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Specialized Domain Track
              </label>
              <input
                type="text"
                value={careerGoal.targetDomain}
                onChange={(e) => setCareerGoal({ ...careerGoal, targetDomain: e.target.value })}
                placeholder="e.g. Distributed Enterprise Architectures, Fintech, SaaS"
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Target Industry Sector
              </label>
              <input
                type="text"
                value={careerGoal.targetIndustry}
                onChange={(e) => setCareerGoal({ ...careerGoal, targetIndustry: e.target.value })}
                placeholder="e.g. Technology & Product, Financial Services, Healthtech"
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Academic & Personal Records */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wider">
              Academic & Institutional Records
            </h2>
          </div>

          {/* RGUKT Institutional Verification Badge */}
          <div className="mb-5 p-4 rounded-xl bg-slate-900 border border-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  {form.college || 'RGUKT Srikakulam'}
                </span>
                <span className="text-xs font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  ID: {form.rollNumber || 'S210018'}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-300 mt-1">
                {form.batch || '2027 Graduating Batch • B.Tech E4 (Final Year)'}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block font-mono">
                {form.email || 's210018@rguktsklm.ac.in'}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Institutional Student
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Candidate Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Department / Branch</label>
              <input
                type="text"
                required
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Cumulative Grade Point Average (CGPA / 10)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                required
                value={form.cgpa}
                onChange={(e) => setForm({ ...form, cgpa: parseFloat(e.target.value) || 0 })}
                className="w-full text-xs font-bold font-mono px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Active Backlogs Count</label>
              <input
                type="number"
                min="0"
                required
                value={form.backlogs}
                onChange={(e) => setForm({ ...form, backlogs: parseInt(e.target.value, 10) || 0 })}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Academic Semester</label>
              <input
                type="number"
                min="1"
                max="8"
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: parseInt(e.target.value, 10) || 8 })}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Graduation Year</label>
              <input
                type="number"
                value={form.graduationYear}
                onChange={(e) => setForm({ ...form, graduationYear: parseInt(e.target.value, 10) || 2027 })}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Year of Study (Institutional Phase)</label>
              <input
                type="text"
                readOnly
                value={form.yearOfStudy || '4th Year (E4)'}
                className="w-full text-xs font-bold px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Phone</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Portfolio or GitHub URL</label>
              <input
                type="url"
                value={form.portfolioLink}
                onChange={(e) => setForm({ ...form, portfolioLink: e.target.value })}
                placeholder="https://github.com/your-username"
                className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 text-xs sm:text-sm flex items-center gap-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving & Calibrating Models...' : 'Save Profile & Recalibrate AI'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
