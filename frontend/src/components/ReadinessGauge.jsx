import React from 'react';

export default function ReadinessGauge({ score = 0, size = 190 }) {
  const cleanScore = Math.min(100, Math.max(0, Math.round(score)));
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (cleanScore / 100) * circumference;

  let color = '#dc2626'; // Red-600
  let statusText = 'CRITICAL SKILL GAP';
  let badgeClass = 'badge-red';

  if (cleanScore >= 75) {
    color = '#059669'; // Emerald-600
    statusText = 'PLACEMENT READY';
    badgeClass = 'badge-green';
  } else if (cleanScore >= 55) {
    color = '#d97706'; // Amber-600
    statusText = 'DEVELOPING COMPETENCY';
    badgeClass = 'badge-yellow';
  }

  return (
    <div className="flex flex-col items-center justify-center p-2">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#e2e8f0"
            strokeWidth="16"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="16"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-5xl font-black font-mono tracking-tight text-slate-900">{cleanScore}</span>
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-0.5">/ 100 PTS</span>
        </div>
      </div>
      <div className="mt-3.5">
        <span className={`${badgeClass} px-3 py-1 text-xs tracking-wider font-extrabold uppercase`}>{statusText}</span>
      </div>
    </div>
  );
}
