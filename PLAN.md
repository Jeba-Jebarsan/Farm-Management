# Titan Fleet - Implementation Plan

## Overview
Complete missing features and remove AI dependency from the existing fleet management system.

---

## Changes Summary

### 1. Remove Google Gemini AI Dependency
- **Files**: `DashboardView.tsx`, `index.html`, `package.json`
- Remove `@google/genai` from importmap and package.json
- Replace AI Insights sidebar panel with **Alerts & Reminders** panel (more useful)
- Remove `services/geminiService` import

### 2. Add Alerts & Reminders System (NEW)
- **File**: New component `components/AlertsView.tsx`
- **Add nav item**: "Alerts" tab in sidebar (constants.tsx, App.tsx)
- Auto-detect:
  - **Service overdue**: maintenance logs where `nextDueDate <= today`
  - **Service upcoming**: maintenance logs where `nextDueDate` is within 14 days
  - **Insurance expiring soon**: insurance logs where `endDate` is within 30 days
  - **Insurance expired**: insurance logs where `endDate < today`
- Show alert count badge on sidebar nav item and header bell icon
- Dashboard sidebar panel replaced with Alerts Summary (top 5 alerts)
- Full Alerts page shows all alerts grouped by urgency (Overdue > Expiring Soon > Upcoming)

### 3. Add Notification Bell to Header
- **File**: `App.tsx`
- Add bell icon with red badge showing count of active alerts
- Clicking bell navigates to Alerts tab

### 4. Add Edit/Delete for Log Entries
- **File**: `LogView.tsx`
- Admin can delete log entries (with confirmation)
- Admin can edit existing log entries (reopen form with pre-filled data)
- Pass `onDelete` and `onUpdate` callbacks from App.tsx

### 5. Fix Currency Display Consistency
- **Files**: `DashboardView.tsx`, `ReportView.tsx`
- Change all `$` to `Rs.` (LKR) throughout the app
- Already correct in LogView.tsx

### 6. Fix Missing index.css
- **File**: Create `index.css` with minimal styles (scrollbar, animations)

### 7. Clean Up package.json
- Remove `@google/genai` dependency
- Remove `GEMINI_API_KEY` from vite.config.ts

---

## File-by-File Changes

| File | Action |
|------|--------|
| `types.ts` | No changes needed |
| `constants.tsx` | Add "Alerts" navigation item |
| `index.html` | Remove `@google/genai` from importmap, keep index.css ref |
| `index.css` | Create with minimal styles |
| `package.json` | Remove `@google/genai` |
| `vite.config.ts` | Remove GEMINI_API_KEY env |
| `App.tsx` | Add Alerts tab routing, bell icon with badge, pass edit/delete to LogView |
| `components/DashboardView.tsx` | Replace AI panel with alerts summary, fix currency |
| `components/AlertsView.tsx` | **NEW** - Full alerts page |
| `components/LogView.tsx` | Add edit/delete for entries |
| `components/ReportView.tsx` | Fix currency to Rs. |
| `components/VehicleView.tsx` | No changes needed |
| `components/SOPView.tsx` | No changes needed |

---

## No Changes To
- Data model / types (alerts are computed from existing data, no new storage needed)
- Backup/restore system
- Vehicle management
- Role-based access control
