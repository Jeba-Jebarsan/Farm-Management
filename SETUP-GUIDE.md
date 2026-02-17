# Titan Fleet - Setup & User Guide

---

# PART A: FIRST-TIME SETUP (Developer does this once)

> Do these steps ONCE before handing over to the owner.

## A1. Create Supabase Project (Cloud Database)

1. Go to **https://supabase.com** → Sign up (free plan is fine)
2. Click **New Project** → name it **TitanFleet**
3. Choose a strong database password (save it somewhere safe)
4. Select the closest region → Click **Create new project**
5. Wait for project to finish setting up (~2 minutes)

## A2. Get Your API Keys

1. In your Supabase project, go to **Settings** → **API**
2. Copy the **Project URL** (looks like `https://xxxx.supabase.co`)
3. Copy the **anon public** key (long string starting with `eyJ...`)
4. Open the `.env` file in the TitanFleet project folder
5. Replace the placeholders:
   ```
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...your-key-here
   ```

## A3. Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New query**
3. Open the file `supabase-schema.sql` from the project folder
4. Copy the entire contents and paste into the SQL Editor
5. Click **Run** → all tables will be created
6. Verify: go to **Table Editor** → you should see 8 tables (vehicles, fuel_logs, maintenance_logs, repair_logs, insurance_logs, item_master, stock_in, stock_out)

## A4. Install Node.js

1. Go to **https://nodejs.org** → download the **LTS** version
2. Install it (follow the prompts)

## A5. Download & Setup the Project

1. Open **Terminal** (Mac) or **Command Prompt** (Windows)
2. Run:
   ```
   cd ~/Desktop
   git clone https://github.com/YOUR-USERNAME/YOUR-REPO.git TitanFleet
   cd ~/Desktop/TitanFleet
   npm install
   ```
3. Make sure you've added the `.env` file with Supabase credentials (step A2)

## A6. Create Admin User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter the admin's email and a strong password
4. Click **Create user**
5. This email/password is what the admin will use to log in to the system

## A7. Test It Works

1. Run:
   ```
   cd ~/Desktop/TitanFleet && npm run dev
   ```
2. Open browser → go to `http://localhost:3000`
3. The system should load with a brief loading spinner, then show the dashboard
4. Click **Admin Login** and sign in with the credentials from step A6
5. Try adding a test vehicle → verify it appears
6. Refresh the page → data should still be there (it's in the cloud now!)

## A8. Create a One-Click Launcher (Mac)

```
cat > ~/Desktop/StartTitanFleet.command << 'EOF'
#!/bin/bash
cd ~/Desktop/TitanFleet
echo ""
echo "============================================"
echo "   TITAN FLEET is starting..."
echo "   Opening your browser automatically..."
echo "============================================"
echo ""
echo ">>> DO NOT CLOSE THIS WINDOW <<<"
echo ">>> Minimize it and keep it running <<<"
echo ""
sleep 2
open http://localhost:3000
npm run dev
EOF
```

```
chmod +x ~/Desktop/StartTitanFleet.command
```

## A9. Handover Checklist

Before you leave, confirm:

- [ ] `.env` file has real Supabase URL and key
- [ ] SQL schema has been run in Supabase
- [ ] Double-click launcher → system opens in browser
- [ ] Owner can click "Admin Login" in sidebar
- [ ] Owner can add a test vehicle (then delete it)
- [ ] Refresh page → data persists
- [ ] Owner can do a Backup from SOP & Backups
- [ ] Owner understands the daily routine (Part B below)

---

# PART B: DAILY USE (For the Owner)

> Print this page and keep it near your laptop.
> No coding needed. Just follow these simple steps.

---

## HOW TO START (Every Day)

1. **Double-click** the `StartTitanFleet` icon on your Desktop
2. A black window (Terminal) will open — **DON'T CLOSE IT, just minimize it**
3. Your browser will open automatically with the system
4. If browser doesn't open, manually go to: **localhost:3000**

---

## HOW TO STOP (End of Day)

1. Close the browser tab
2. Open the black Terminal window
3. Press **Ctrl + C** on your keyboard
4. Close Terminal
5. Done!

---

## HOW TO LOGIN

- Click **"Admin Login"** at the bottom-left corner
- Enter your admin email and password
- This lets you add, edit, and delete records
- When you're just viewing, click **"Logout"** to switch to STAFF mode (safer)
- Staff users can view everything but cannot make changes
- The **SOP & Backups** section is only visible when logged in as Admin

---

## ADDING VEHICLES

1. Click **Vehicles** in the left menu
2. Click the blue **New Asset** button (top right)
3. Fill in the form:

| Field | What to Enter | Example |
|-------|--------------|---------|
| Internal ID | TR-number, LR-number, BK-number, GN-number | TR-1001 |
| | TR = Tractor, LR = Lorry, BK = Bike, GN = Generator | LR-2001 |
| Province | Select from dropdown | WP |
| Plate Number | Your vehicle plate | WP CAE-1234 |
| Make & Model | Vehicle brand and model | Toyota Hilux |
| Year | Manufacturing year | 2022 |
| Engine No | From vehicle documents | 2GD-1234567 |
| Chassis No | From vehicle documents | MRO-7654321 |

4. Click **Complete Registration**

---

## ADDING FUEL RECORDS

1. Click **Fuel** in the left menu
2. Click **Add Entry**
3. Select the vehicle from the dropdown
4. Enter date, cost (LKR), liters, fuel station name
5. Click **Commit Record**

---

## ADDING MAINTENANCE RECORDS

1. Click **Maintenance** in the left menu
2. Click **Add Entry**
3. Select vehicle, enter date, cost
4. **IMPORTANT: Always fill "Next Due Date"** — this creates automatic reminders!
5. Describe the work done (e.g., "Oil change + filter replacement")
6. Click **Commit Record**

---

## ADDING REPAIR RECORDS

1. Click **Repairs** in the left menu
2. Click **Add Entry**
3. Select vehicle, enter date, cost
4. Describe the issue and what action was taken
5. Click **Commit Record**

---

## ADDING INSURANCE

1. Click **Insurance** in the left menu
2. Click **Add Entry**
3. Select vehicle, enter date, cost
4. Enter policy number, start date, **expiry date**, company name
5. **IMPORTANT: Always fill "Expiry Date"** — the system will warn you 30 days before!
6. Click **Commit Record**

---

## STORE & STOCK MANAGEMENT

The Store & Stock module tracks inventory items, stock movements, and balances.

### Adding Items (Item Master)
1. Click **Store & Stock** in the left menu
2. Make sure the **Item Master** tab is selected
3. Click **Add Entry**
4. Fill in the form:

| Field | What to Enter | Example |
|-------|--------------|---------|
| Item Code | Unique code for the item | OIL-001 |
| Item Name | Descriptive name | Engine Oil 20W-50 |
| Category | Select from dropdown | Lubricants |
| Unit | Select from dropdown | Litres |
| Reorder Level | Minimum stock before reorder | 10 |

5. Click **Add Item**

### Recording Stock In (Purchases/Receipts)
1. Click the **Stock In** tab
2. Click **Add Entry**
3. Select the item, enter quantity, supplier, and GRN number
4. Click **Commit Record**

### Recording Stock Out (Issues)
1. Click the **Stock Out** tab
2. Click **Add Entry**
3. Select the item, enter quantity, who it was issued to, and purpose
4. Click **Commit Record**

### Checking Stock Balance
1. Click the **Stock Balance** tab
2. This shows a summary of all items with:
   - **Total In** — total quantity received
   - **Total Out** — total quantity issued
   - **Closing** — current stock (In minus Out)
   - **Status** — OK (green) or REORDER (red) when stock is below reorder level

---

## EDITING / DELETING RECORDS

- Hover over any record in the table → you'll see a pencil (edit) and trash (delete) icon on the right
- Click pencil to edit, click trash to delete
- You must be in **ADMIN** mode to edit/delete

---

## CHECKING ALERTS & REMINDERS

The system automatically tracks:
- **Service reminders** — warns 14 days before next service is due
- **Insurance expiry** — warns 30 days before insurance expires

To check alerts:
1. Look at the **bell icon** at the top right — if there's a red number, you have alerts
2. Click **Alerts** in the left menu to see all alerts

| Color | Meaning | What To Do |
|-------|---------|-----------|
| RED | Overdue / Expired | Take action NOW |
| ORANGE | Coming soon | Plan and schedule |

---

## VIEWING REPORTS

1. Click **Reports** in the left menu
2. See:
   - Total expenses by category (pie chart)
   - Top vehicle expenses (bar chart)
   - Full cost breakdown table for every vehicle

---

## BACKING UP YOUR DATA

Your data is stored in the cloud and is safe across browsers and devices.
**Still, we recommend weekly backups for extra safety.**

### To Backup:
1. Click **SOP & Backups** in the left menu
2. Click the **Backup** button
3. A file will download (e.g., `titan_fleet_backup_2026-02-15.json`)
4. Copy this file to your **USB** or **cloud drive**

### To Restore (if needed):
1. Click **SOP & Backups** in the left menu
2. Click the **Restore** button
3. Select your backup file
4. Click confirm — data will be uploaded to the cloud database

---

## GOLDEN RULES

| # | Rule |
|---|------|
| 1 | **You can use any browser** — data is in the cloud |
| 2 | **Clearing browser cache is safe** — your data won't be lost |
| 3 | **Backup weekly** for extra safety |
| 4 | **Don't close the black Terminal window** while using the system |
| 5 | **Don't touch any files** inside the TitanFleet folder |
| 6 | **Use STAFF mode** when only viewing (prevents accidental changes) |
| 7 | **Always fill Next Due Date** in maintenance entries |
| 8 | **Always fill Expiry Date** in insurance entries |

---

## SOMETHING WENT WRONG?

| Problem | Solution |
|---------|----------|
| System won't open | Double-click StartTitanFleet again. If still broken, restart your computer and try again. |
| Blank white page | The Terminal window was closed. Open StartTitanFleet again. |
| "Connection Failed" | Check your internet connection. The system needs internet to reach the cloud database. |
| "Port in use" error | Close ALL Terminal windows. Wait 10 seconds. Try again. |
| Need to recover data | Go to SOP & Backups → Restore from your backup file. |

---

## CONTACT DEVELOPER

If anything breaks that you can't fix:

**Name:** [Developer Name]
**Phone:** [Phone Number]
**Email:** [Email Address]

---

> This system stores data in the cloud. Internet connection is required.
> Just start it, use it, and shut down. Your data is always safe!
