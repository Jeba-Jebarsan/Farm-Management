# Titan Fleet Management System - How It Works (Start to End)

---

## 1. System Overview

Titan Fleet is a web-based fleet management system built for a Sri Lankan business owner to track vehicles, fuel, maintenance, repairs, and insurance. It runs as a local Vite dev server on the owner's machine and stores all data in the cloud via **Supabase** (PostgreSQL database).

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript |
| Styling | Tailwind CSS (CDN) + Inter font |
| Charts | Recharts |
| Icons | Lucide React |
| Build Tool | Vite 6 |
| Database | Supabase (PostgreSQL in the cloud) |
| Auth | Supabase Auth (email/password for Admin, anonymous for Staff) |

---

## 2. Project File Structure

```
E:\Management System\
│
├── index.html              ← Entry point (loads Tailwind, fonts, importmap)
├── index.tsx               ← React app mount point (renders <App />)
├── index.css               ← Custom animations (fade-in, pulse-dot, scrollbar)
├── App.tsx                 ← Main app shell (sidebar, routing, state, DB calls)
├── types.ts                ← All TypeScript interfaces & enums
├── constants.tsx            ← Initial state, nav items, Sri Lanka provinces
│
├── lib/
│   ├── supabase.ts         ← Supabase client initialization
│   └── database.ts         ← All CRUD operations (24 functions + fetch + restore)
│
├── components/
│   ├── DashboardView.tsx   ← KPI cards, fuel chart, asset grid, alerts sidebar
│   ├── VehicleView.tsx     ← Vehicle registration, search, edit, delete
│   ├── LogView.tsx         ← Reusable log table (fuel, maintenance, repair, insurance)
│   ├── AlertsView.tsx      ← Alert generation logic + alerts display page
│   ├── ReportView.tsx      ← Pie chart, bar chart, pivot table
│   ├── SOPView.tsx         ← Operating rules, backup/restore, cloud info
│   └── StoreStockView.tsx  ← Store & Stock management (Item Master, Stock In/Out, Balance)
│
├── supabase-schema.sql     ← SQL to create all 5 database tables
├── .env                    ← Supabase URL + anon key (not committed to git)
├── vite.config.ts          ← Vite config (port 3000, React plugin)
├── tsconfig.json           ← TypeScript config
├── package.json            ← Dependencies
├── .gitignore              ← Ignores node_modules, dist, .env
├── SETUP-GUIDE.md          ← Setup + daily use instructions for owner
└── HOW-IT-WORKS.md         ← This file
```

---

## 3. Data Model

### Enums

| Enum | Values |
|------|--------|
| `VehicleType` | Tractor, Lorry, Bike, Generator, Other |
| `VehicleStatus` | Active, Under Repair, Out of Service |

### Database Tables (8 total)

All data flows through these 8 Supabase tables:

```
┌──────────────────┐                    ┌──────────────────┐
│    vehicles       │  ← Primary table  │   item_master    │  ← Stock Primary
│  (id = TEXT PK)   │                    │ (item_code PK)   │
└────────┬─────────┘                    └────────┬─────────┘
         │ vehicle_id (FK)                       │ item_code (FK)
    ┌────┴────┬──────────┬──────────┐       ┌────┴────┐
    ▼         ▼          ▼          ▼       ▼         ▼
┌─────────┐ ┌──────────┐ ┌────────┐ ┌───────────┐ ┌────────┐ ┌─────────┐
│fuel_logs│ │maint_logs│ │repair  │ │insurance  │ │stock_in│ │stock_out│
│         │ │          │ │_logs   │ │_logs      │ │        │ │         │
└─────────┘ └──────────┘ └────────┘ └───────────┘ └────────┘ └─────────┘
```

**vehicles** — id, legal_plate_no, province_code, type, make_model, year, engine_no, chassis_no, status, joined_date

**fuel_logs** — id, vehicle_id (FK), legal_plate_no, date, quantity, cost, mileage, supplier

**maintenance_logs** — id, vehicle_id (FK), date, type, odometer, description, cost, next_due_date

**repair_logs** — id, vehicle_id (FK), date, issue, action_taken, parts_used, cost, downtime_days

**insurance_logs** — id, vehicle_id (FK), legal_plate_no, policy_no, start_date, end_date, company, premium

**item_master** — item_code (PK), item_name, category, unit, reorder_level

**stock_in** — id, date, item_code (FK→item_master), qty, supplier, grn_no

**stock_out** — id, date, item_code (FK→item_master), qty, issued_to, purpose

### camelCase vs snake_case

TypeScript uses camelCase (`vehicleId`, `legalPlateNo`). Supabase tables use snake_case (`vehicle_id`, `legal_plate_no`). The `lib/database.ts` file has `toSnake()` and `toCamel()` helper functions that convert between the two formats on every read/write.

---

## 4. Application Startup Flow

```
User double-clicks launcher
        │
        ▼
   npm run dev
        │
        ▼
   Vite starts on port 3000
        │
        ▼
   Browser opens http://localhost:3000
        │
        ▼
   index.html loads
   ├── Tailwind CSS (CDN)
   ├── Inter font (Google Fonts)
   ├── Import map (React, Recharts, Lucide, Supabase from esm.sh)
   └── index.tsx (module entry)
        │
        ▼
   index.tsx renders <App />
        │
        ▼
   App.tsx initializes:
   ├── State: fleetData = INITIAL_STATE (empty)
   ├── State: loading = true
   ├── State: role = 'STAFF'
   │
   ├── Shows loading spinner (Loader2 icon)
   │
   └── useEffect → calls loadData()
              │
              ▼
        fetchAllData() in lib/database.ts
              │
              ▼
        8 parallel Supabase SELECT queries:
        ├── supabase.from('vehicles').select('*')
        ├── supabase.from('fuel_logs').select('*')
        ├── supabase.from('maintenance_logs').select('*')
        ├── supabase.from('repair_logs').select('*')
        ├── supabase.from('insurance_logs').select('*')
        ├── supabase.from('item_master').select('*')
        ├── supabase.from('stock_in').select('*')
        └── supabase.from('stock_out').select('*')
              │
              ▼
        Convert snake_case → camelCase
              │
              ▼
        setFleetData(data), setLoading(false)
              │
              ▼
        App renders with full data
        └── Shows Dashboard by default
```

### Error Handling on Startup

If Supabase is unreachable (no internet, wrong credentials, etc.):
- `loading` is set to false
- `error` is set to the error message
- App shows an error screen with "Connection Failed" and a **Retry Connection** button

---

## 5. Navigation & Routing

There is no URL-based router. Navigation is state-based using `activeTab`:

```tsx
const [activeTab, setActiveTab] = useState('Dashboard');
```

The sidebar has 10 navigation items defined in `constants.tsx`:

| Tab | Component | Description |
|-----|-----------|-------------|
| Dashboard | `DashboardView` | KPIs, fuel chart, asset grid, top 5 alerts |
| Vehicles | `VehicleView` | Register/edit/delete vehicles |
| Fuel | `LogView` | Fuel log entries |
| Maintenance | `LogView` (isMaintenance) | Maintenance log entries |
| Repairs | `LogView` (isRepair) | Repair log entries |
| Insurance | `LogView` (isInsurance) | Insurance log entries |
| Store & Stock | `StoreStockView` | Item Master, Stock In/Out, Stock Balance |
| Alerts | `AlertsView` | All generated alerts |
| Reports | `ReportView` | Charts and pivot table |
| SOP & Backups | `SOPView` | Rules, backup, restore (Admin only) |

`LogView` is a **single reusable component** that changes its form fields based on boolean props (`isMaintenance`, `isRepair`, `isInsurance`). Default (no props) = Fuel mode.

---

## 6. Role System

Two roles determined by authentication status:

| Role | Can View | Can Add/Edit/Delete | SOP & Backups |
|------|----------|-------------------|---------------|
| STAFF | Everything except SOP | Nothing | Hidden |
| ADMIN | Everything | Everything | Visible |

- **STAFF** = default (no login required). Can view all data and reports but cannot modify anything.
- **ADMIN** = requires Supabase email/password login. Can add, edit, and delete all records.
- The "SOP & Backups" nav item is hidden from STAFF users.
- Admin clicks "Admin Login" in the sidebar, enters credentials, and the session persists until logout.

Every mutation checks `role === 'ADMIN'` before proceeding. If staff tries to modify, an alert says "Permission Denied."

---

## 7. Data Flow: How a Record is Created

Example: Admin adds a fuel log entry.

```
Admin clicks "Add Entry" on Fuel page
        │
        ▼
LogView opens form (empty, new random ID)
        │
        ▼
Admin fills: vehicle, date, cost, liters, supplier
        │
        ▼
Admin clicks "Commit Record"
        │
        ▼
LogView.handleSubmit():
├── Sets saving = true (button shows spinner)
├── Attaches legalPlateNo from selected vehicle
├── Calls onAdd(logData) — this is an async prop from App.tsx
│       │
│       ▼
│   App.makeLogHandlers('fuelLogs', addFuelLog, ...).onAdd:
│   ├── checkAdmin() — verifies role
│   ├── await addFuelLog(log) — calls lib/database.ts
│   │       │
│   │       ▼
│   │   database.ts → addFuelLog():
│   │   ├── toSnake(log) — converts camelCase to snake_case
│   │   └── supabase.from('fuel_logs').insert(snakeData)
│   │       │
│   │       ▼
│   │   Supabase inserts row into fuel_logs table
│   │
│   └── setFleetData(prev => ({ ...prev, fuelLogs: [...prev.fuelLogs, log] }))
│       (optimistic local state update)
│
├── setShowForm(false)
└── setSaving(false)
```

The same pattern applies to **all CRUD operations** across all 5 data types:
1. UI calls async handler prop
2. App.tsx checks admin, calls database function, updates local state
3. database.ts converts case and calls Supabase API
4. If Supabase returns an error, it's thrown and caught by the UI (shows alert)

---

## 8. Data Flow: How a Record is Updated

Same as create, except:
- `supabase.from('table').update(data).eq('id', id)` instead of `.insert(data)`
- Local state uses `.map()` to replace the matching record

---

## 9. Data Flow: How a Record is Deleted

Same pattern:
- UI shows confirmation dialog first
- `supabase.from('table').delete().eq('id', id)`
- Local state uses `.filter()` to remove the matching record

---

## 10. Alert System

Alerts are **computed on the fly** from the data — they are not stored in the database.

The function `getAlerts(data: FleetState)` in `AlertsView.tsx` runs every time `fleetData` changes (via `useMemo`).

### Alert Types

| Type | Trigger | Severity |
|------|---------|----------|
| `overdue_service` | Maintenance `nextDueDate` is in the past | Critical (red) |
| `upcoming_service` | Maintenance `nextDueDate` is within 14 days | Warning (orange) |
| `expired_insurance` | Insurance `endDate` is in the past | Critical (red) |
| `expiring_insurance` | Insurance `endDate` is within 30 days | Warning (orange) |

### Alert Logic

For maintenance:
- Groups by vehicle, finds the latest maintenance record per vehicle
- Compares `nextDueDate` against today
- If overdue → critical alert. If within 14 days → warning alert.

For insurance:
- Groups by vehicle, finds the latest insurance record per vehicle
- Compares `endDate` against today
- If expired → critical alert. If within 30 days → warning alert.

Alerts are sorted: critical first, then by date (earliest first).

### Where Alerts Appear

1. **Bell icon** in header — shows red badge with count
2. **Sidebar** — "Alerts" nav item shows red badge with count
3. **Dashboard** — KPI card shows count + top 5 alerts in dark sidebar
4. **Alerts page** — full list with summary cards

---

## 11. Dashboard

`DashboardView.tsx` computes everything from `fleetData` state:

### KPI Cards (top row)
- **Total Fleet Expense** — sum of all fuel + maintenance + repair costs
- **Active Assets** — count of vehicles with status "Active" / total vehicles
- **Pending Services** — count of maintenance records where `nextDueDate <= today`
- **Active Alerts** — count from `getAlerts()`

### Fuel Cost Chart
- Area chart showing daily fuel costs for the last 7 days
- Uses Recharts `AreaChart` with gradient fill

### Asset Utilization Grid
- Shows every vehicle as a card with status indicator (green dot = active, red = other)

### Alerts Sidebar
- Dark panel showing top 5 alerts
- "Open Alerts Center" button navigates to Alerts tab

---

## 12. Reports

`ReportView.tsx` computes everything from `fleetData` state:

### Expense Distribution (Pie Chart)
- Donut chart splitting total costs into: Fuel, Maintenance, Repairs, Insurance
- Legend shows amounts per category

### Top Vehicle Expenses (Bar Chart)
- Horizontal bar chart of top 5 vehicles by total cost
- Costs = sum of all fuel + maintenance + repair + insurance for each vehicle

### Fleet Pivot Table
- Dark-themed table showing every vehicle's costs broken down by category
- Columns: Vehicle ID | Fuel | Maintenance | Repairs | Insurance | Total
- Sorted by total cost (highest first)

---

## 13. Backup & Restore

Located in `SOPView.tsx`.

### Backup (Download)
1. Takes current `fleetData` state (already in memory)
2. `JSON.stringify(data, null, 2)` — pretty-printed JSON
3. Creates a Blob → generates download link → triggers click
4. File: `titan_fleet_backup_YYYY-MM-DD.json`

The backup file contains the exact `FleetState` structure:
```json
{
  "vehicles": [...],
  "fuelLogs": [...],
  "maintenanceLogs": [...],
  "repairLogs": [...],
  "insuranceLogs": [...]
}
```

### Restore (Upload)
1. User selects a `.json` file
2. File is parsed with `JSON.parse()`
3. Confirmation dialog: "Replace entire cloud database?"
4. If confirmed, calls `onRestore(parsedData)` which triggers:
   - `restoreAllData()` in `database.ts`:
     - Deletes ALL rows from all 5 tables (logs first due to FK constraints, then vehicles)
     - Inserts all rows from the backup file (vehicles first, then logs)
   - Updates local state with the restored data
5. Shows success/error alert

---

## 14. Supabase Connection

### Client Initialization (`lib/supabase.ts`)
```
VITE_SUPABASE_URL    → from .env file
VITE_SUPABASE_ANON_KEY → from .env file
```
These are read at build time by Vite via `import.meta.env.VITE_*`. The Supabase client is created once and exported.

### Row Level Security (RLS)
All 5 tables have RLS enabled with a single open policy:
```sql
CREATE POLICY "Allow all access" ON table FOR ALL USING (true) WITH CHECK (true);
```
This means the anon key can read/write everything. This is acceptable because:
- Single-user system (one business owner)
- No sensitive multi-tenant data
- The anon key is only in the `.env` file on the owner's machine

### Database Operations (`lib/database.ts`)

24 CRUD functions + 2 utility functions:

| Function | Table | Operation |
|----------|-------|-----------|
| `fetchAllData()` | All 8 | SELECT * (parallel) |
| `addVehicle(v)` | vehicles | INSERT |
| `updateVehicle(v)` | vehicles | UPDATE |
| `deleteVehicle(id)` | vehicles | DELETE |
| `addFuelLog(l)` | fuel_logs | INSERT |
| `updateFuelLog(l)` | fuel_logs | UPDATE |
| `deleteFuelLog(id)` | fuel_logs | DELETE |
| `addMaintenanceLog(l)` | maintenance_logs | INSERT |
| `updateMaintenanceLog(l)` | maintenance_logs | UPDATE |
| `deleteMaintenanceLog(id)` | maintenance_logs | DELETE |
| `addRepairLog(l)` | repair_logs | INSERT |
| `updateRepairLog(l)` | repair_logs | UPDATE |
| `deleteRepairLog(id)` | repair_logs | DELETE |
| `addInsuranceLog(l)` | insurance_logs | INSERT |
| `updateInsuranceLog(l)` | insurance_logs | UPDATE |
| `deleteInsuranceLog(id)` | insurance_logs | DELETE |
| `addStockItem(item)` | item_master | INSERT |
| `updateStockItem(item)` | item_master | UPDATE |
| `deleteStockItem(itemCode)` | item_master | DELETE |
| `addStockIn(record)` | stock_in | INSERT |
| `updateStockIn(record)` | stock_in | UPDATE |
| `deleteStockIn(id)` | stock_in | DELETE |
| `addStockOut(record)` | stock_out | INSERT |
| `updateStockOut(record)` | stock_out | UPDATE |
| `deleteStockOut(id)` | stock_out | DELETE |
| `restoreAllData(data)` | All 8 | DELETE all + INSERT all |

---

## 15. Vehicle ID System

Vehicles use a structured Internal ID format:

| Prefix | Type |
|--------|------|
| TR-xxxx | Tractor |
| LR-xxxx | Lorry |
| BK-xxxx | Bike |
| GN-xxxx | Generator |
| OT-xxxx | Other |

Validated with regex: `/^(TR|LR|BK|GN|OT)-\d+$/`

Province codes follow Sri Lanka's 9 provinces: WP, CP, SP, NW, NC, UVA, SAB, NP, EP.

---

## 16. Complete Request Lifecycle

Here is every step from the moment the user clicks a button to the data appearing on screen:

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌───────────┐
│  Component   │────▶│   App.tsx     │────▶│ database.ts  │────▶│ Supabase  │
│ (UI Event)   │     │ (Handler)    │     │ (API Call)   │     │ (Cloud DB)│
└─────────────┘     └──────────────┘     └──────────────┘     └───────────┘
       │                   │                    │                    │
   User clicks         Checks admin         Converts to           Executes
   button/form         permission           snake_case            SQL query
       │                   │                    │                    │
       │              Calls DB func         Calls supabase          │
       │                   │               .from().insert()         │
       │                   │                    │                    │
       │              Updates local         Returns result       Stores row
       │              React state           or throws error      in PostgreSQL
       │                   │                    │                    │
   UI re-renders      React re-render      Error bubbles up     Persisted in
   with new data      triggers all         to UI as alert()     cloud forever
                      dependent views
```

---

## 17. What Happens on Page Refresh

1. Browser reloads `index.html`
2. React app re-mounts
3. `App.tsx` sets `loading = true`, shows spinner
4. `fetchAllData()` queries all 5 Supabase tables
5. Data loads into state → spinner disappears → app renders with full data

Data is NOT lost on refresh, cache clear, or browser switch — it's all in Supabase.

---

## 18. Error Handling

| Scenario | What Happens |
|----------|-------------|
| No internet on startup | Error screen: "Connection Failed" + Retry button |
| No internet during save | `alert('Failed to save: ...')`, data NOT saved |
| Invalid .env credentials | Error screen on startup |
| Supabase table missing | Error on first query |
| Duplicate vehicle ID | Client-side check before insert, shows alert |
| Invalid backup JSON | `alert('Invalid Backup File Format')` |
| Restore fails | `alert('Restore failed: ...')`, original data unchanged |

---

## 19. Security Model

| Concern | Implementation |
|---------|---------------|
| Database access | Supabase anon key (in .env, not committed to git) |
| RLS | Enabled with open policy (single-user system) |
| Role control | Supabase Auth (email/password login for Admin) |
| Backup files | Unencrypted JSON — user warned to store securely |
| .env protection | Listed in .gitignore, never committed |
| Service role key | Used only for admin tasks (schema creation), never in app code |

---

## 20. Dependencies

### Production
| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.2.4 | UI framework |
| react-dom | ^19.2.4 | DOM rendering |
| recharts | ^3.7.0 | Charts (pie, bar, area) |
| lucide-react | ^0.563.0 | Icon library |
| @supabase/supabase-js | ^2 | Supabase client SDK |

### Dev
| Package | Version | Purpose |
|---------|---------|---------|
| vite | ^6.2.0 | Build tool + dev server |
| @vitejs/plugin-react | ^5.0.0 | React JSX transform |
| typescript | ~5.8.2 | Type checking |
| @types/node | ^22.14.0 | Node.js type definitions |
