import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { Users, Filter, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';

export default function Applications() {
  const { driveId } = useParams();
  const navigate = useNavigate();

  const [drives, setDrives] = useState([]);
  const [selectedDriveId, setSelectedDriveId] = useState(driveId || '');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDrives() {
      try {
        const res = await api.get('/officer/drives');
        setDrives(res.data || []);
        if (!selectedDriveId && res.data?.length > 0) {
          setSelectedDriveId(res.data[0].id);
        }
      } catch (err) {
        console.error('Failed fetching drives list', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDrives();
  }, [selectedDriveId]);

  useEffect(() => {
    if (!selectedDriveId) return;
    async function fetchApps() {
      try {
        const res = await api.get(`/officer/drives/${selectedDriveId}/applications`);
        setApplications(res.data || []);
      } catch (err) {
        console.error('Failed fetching applications', err);
      }
    }
    fetchApps();
  }, [selectedDriveId]);

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await api.put(`/officer/drives/${selectedDriveId}/applications/${appId}/status`, {
        status: newStatus
      });
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
    } catch (err) {
      alert('Error updating status: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const stages = [
    'APPLIED',
    'ASSESSMENT_PENDING',
    'ASSESSMENT_COMPLETED',
    'SHORTLISTED',
    'INTERVIEW_SCHEDULED',
    'SELECTED',
    'NOT_SELECTED'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Multi-Stage Candidate Pipeline Tracking
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Enforce screening cutoffs, monitor assessment milestones, and manage corporate rosters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500">Recruitment Drive:</label>
          <select
            value={selectedDriveId}
            onChange={(e) => setSelectedDriveId(e.target.value)}
            className="input py-1.5 text-xs max-w-xs font-medium"
          >
            {drives.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title} ({d.jobRole})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="card bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
          <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Applicant Roster ({applications.length} Candidates)</span>
          </h2>
        </div>

        {applications.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            No student applications logged for this recruitment drive yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Candidate Name</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Academic CGPA</th>
                  <th className="py-3 px-4">Target Role</th>
                  <th className="py-3 px-4">Current Pipeline Stage</th>
                  <th className="py-3 px-4 text-right">Update Selection Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {applications.map((app) => {
                  const student = app.student;
                  return (
                    <tr key={app.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        {student?.name}
                        <span className="block text-xs font-normal text-gray-400">
                          {student?.user?.email}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600">{student?.department}</td>
                      <td className="py-3.5 px-4 font-bold text-gray-900">{student?.cgpa}</td>
                      <td className="py-3.5 px-4 text-slate-800 font-semibold">
                        {student?.careerGoal?.targetRole || 'Software'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-semibold px-2.5 py-0.5 rounded-full text-xs ${
                            app.status === 'SELECTED'
                              ? 'bg-emerald-100 text-emerald-800'
                              : app.status === 'SHORTLISTED'
                              ? 'bg-blue-100 text-blue-800'
                              : app.status === 'NOT_SELECTED'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {app.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <select
                          value={app.status}
                          onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                          className="px-2.5 py-1 text-xs border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                        >
                          {stages.map((stg) => (
                            <option key={stg} value={stg}>
                              {stg.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
