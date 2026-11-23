import React from 'react';
import { Search } from 'lucide-react';

export default function AdminUsersTab({
  users,
  filteredUsers,
  userSearch,
  setUserSearch,
  userRoleFilter,
  setUserRoleFilter
}) {
  return (
    <div className="space-y-4">
      {/* User Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            placeholder="Search users by name or institutional email..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={userRoleFilter}
            onChange={(e) => setUserRoleFilter(e.target.value)}
            className="text-xs bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700 cursor-pointer"
          >
            <option value="ALL">All Roles ({users.length})</option>
            <option value="STUDENT">Students</option>
            <option value="PLACEMENT_OFFICER">Placement Officers</option>
            <option value="COMPANY">Recruiters</option>
            <option value="ADMIN">System Admins</option>
          </select>
        </div>
      </div>

      {/* User Table */}
      <div className="card bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-bold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">User Identifier</th>
                <th className="py-3 px-4">Entity Profile Name</th>
                <th className="py-3 px-4">Department / Affiliation</th>
                <th className="py-3 px-4">Academic Year / Batch</th>
                <th className="py-3 px-4">Assigned RBAC Role</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-gray-400 text-xs">
                    No user accounts match your search or filter.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const name =
                    u.student?.name ||
                    u.placementOfficer?.name ||
                    u.company?.companyName ||
                    'System Administrator';
                  const affiliation =
                    u.student?.department ||
                    u.placementOfficer?.department ||
                    u.company?.industry ||
                    'Platform Governance';
                  const yearOfStudy =
                    u.student?.yearOfStudy || u.student?.year
                      ? `Year ${u.student.year || u.student.yearOfStudy}`
                      : 'N/A';

                  return (
                    <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-gray-900 flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                          {name.charAt(0).toUpperCase()}
                        </div>
                        <span>{u.email}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-gray-800">{name}</td>
                      <td className="py-3 px-4 text-gray-600">{affiliation}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {u.role === 'STUDENT' ? (
                          <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                            {yearOfStudy}
                          </span>
                        ) : (
                          'Staff / Enterprise'
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`font-bold px-2.5 py-0.5 rounded-full text-xs ${
                            u.role === 'ADMIN'
                              ? 'bg-slate-800 text-slate-100'
                              : u.role === 'PLACEMENT_OFFICER'
                              ? 'bg-emerald-100 text-emerald-800'
                              : u.role === 'COMPANY'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-600 font-bold inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>Active</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
