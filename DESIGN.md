# Design System & Guidelines: PlacementAI

## 1. Visual Language & Principles

- **Clarity Over Clutter:** Interfaces should present complex analytics (test percentages, multi-factor readiness scores, competency radar breakdowns) in clean, digestible tiers.
- **Semantic Feedback:** Colors directly communicate status and urgency, never mere decoration.
- **Consistent Elevation:** Clean 1px borders (`border-gray-200`) with subtle backdrop blurs or light shadows (`shadow-xs` / `shadow-sm`) instead of heavy, dark drop shadows.

---

## 2. Color Palette & Semantic Tokens

| Token | Tailwind Class | Hex / Role | Usage |
|---|---|---|---|
| **Canvas Background** | `bg-gray-50` | `#f9fafb` | Primary app workspace background |
| **Surface Card** | `bg-white` | `#ffffff` | Content containers with `border border-gray-200/80` |
| **Header / Hero Dark**| `bg-slate-900` | `#0f172a` | High-impact portal greeting banners |
| **Primary Brand** | `bg-indigo-600` | `#4f46e5` | Primary action buttons, active navigation states |
| **Primary Hover** | `hover:bg-indigo-700` | `#4338ca` | Button interactive hover |
| **Success / Strength**| `emerald-600` / `emerald-50` | `#059669` | High readiness (>=75%), verified strengths, eligible drives |
| **Warning / Moderate**| `amber-600` / `amber-50` | `#d97706` | Medium readiness (50–74%), in-progress tests |
| **Danger / Deficit** | `rose-600` / `rose-50` | `#e11d48` | Critical skill gaps (<50%), ineligible drives, deletions |

---

## 3. Typography & Hierarchy

- **Font Family:** Modern Sans-Serif (`font-sans` - Inter / System UI stack).
- **Page Titles:** `text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900`
- **Section Headers:** `text-sm font-bold uppercase tracking-wider text-gray-900`
- **Metric Big Numbers:** `text-2xl font-extrabold font-mono`
- **Body Text:** `text-xs sm:text-sm text-gray-600 leading-relaxed`
- **Subtext / Captions:** `text-[10px] sm:text-xs text-gray-400 font-medium`

---

## 4. Reusable Component Patterns

### Badges
- **Blue Badge:** `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200`
- **Green Badge:** `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200`
- **Red Badge:** `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200`
- **Gray Badge:** `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200`

### Buttons
- **Primary:** `px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2`
- **Secondary / Ghost:** `px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors`
- **Danger:** `px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors`

### Cards
- Standard surface card: `bg-white border border-gray-200/80 rounded-2xl p-6 shadow-xs`
- Interactive card: `hover:border-indigo-200 hover:shadow-sm transition-all duration-150`

---

## 5. Anti-Patterns Guardrails

1. ❌ **No Over-Nesting:** Do not nest card containers inside card containers without functional separation.
2. ❌ **No Low-Contrast Text:** Always ensure text contrast ratio exceeds WCAG 2.1 AA standards (minimum 4.5:1 for body copy).
3. ❌ **No Unlabeled Spinners:** Always pair loaders with contextual messaging (e.g. *"Calculating readiness score..."*).
4. ❌ **No Hidden Eligibility Barriers:** If a student cannot apply for a recruitment drive, state the exact unsatisfied criteria (e.g. *"Required CGPA 7.5; Your CGPA: 7.2"*).
