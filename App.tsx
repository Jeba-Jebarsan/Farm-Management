
import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, Truck, BarChart3, ClipboardCheck, Bell,
  User, LogOut, ShieldAlert, Loader2, Package, Users,
  Moon, Sun, Tractor, Leaf, Globe, ChevronRight, Calendar, Archive,
  Menu, X
} from 'lucide-react';
import { FleetState, Role, Vehicle, FuelLog, MaintenanceLog, StockItem, StockIn, StockOut, Employee, LeaveRecord, OvertimeRecord, DailyVehicleLog, InventoryItem, CroppingActivity } from './types';
import { INITIAL_STATE, NAVIGATION_ITEMS } from './constants';
import {
  fetchAllData,
  addVehicle, updateVehicle, deleteVehicle,
  addFuelLog, updateFuelLog, deleteFuelLog,
  addMaintenanceLog, updateMaintenanceLog, deleteMaintenanceLog,
  addStockItem, updateStockItem, deleteStockItem,
  addStockIn, updateStockIn, deleteStockIn,
  addStockOut, updateStockOut, deleteStockOut,
  addEmployee, updateEmployee, deleteEmployee,
  addLeaveRecord, updateLeaveRecord, deleteLeaveRecord,
  addOvertimeRecord, updateOvertimeRecord, deleteOvertimeRecord,
  addDailyVehicleLog, updateDailyVehicleLog, deleteDailyVehicleLog,
  addInventoryItem, updateInventoryItem, deleteInventoryItem,
  addCroppingActivity, updateCroppingActivity, deleteCroppingActivity,
  restoreAllData,
} from './lib/database';
import { signIn, signOut, getSession, onAuthStateChange } from './lib/supabase';
import DashboardView from './components/DashboardView';
import ReportView from './components/ReportView';
import SOPView from './components/SOPView';
import AlertsView from './components/AlertsView';
import StoreStockView from './components/StoreStockView';
import HRManagementView from './components/HRManagementView';
import VehicleMaintenanceView from './components/VehicleMaintenanceView';
import CroppingCalendarView from './components/CroppingCalendarView';
import InventoryView from './components/InventoryView';

const ICON_MAP: Record<string, React.FC<any>> = {
  LayoutDashboard, Truck, BarChart3, ClipboardCheck, Bell, Package, Users, Calendar, Archive
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [session, setSession] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [fleetData, setFleetData] = useState<FleetState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role: Role = session ? 'ADMIN' : 'STAFF';

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = onAuthStateChange((s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAllData();
      setFleetData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load data from database.');
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = role === 'ADMIN';

  const checkAdmin = (): boolean => {
    if (role !== 'ADMIN') {
      alert("Permission Denied: Only Administrator can modify records.");
      return false;
    }
    return true;
  };

  const handleAddVehicle = async (v: Vehicle) => {
    if (!checkAdmin()) return;
    await addVehicle(v);
    setFleetData(prev => ({ ...prev, vehicles: [...prev.vehicles, v] }));
  };

  const handleUpdateVehicle = async (v: Vehicle) => {
    if (!checkAdmin()) return;
    await updateVehicle(v);
    setFleetData(prev => ({ ...prev, vehicles: prev.vehicles.map(x => x.id === v.id ? v : x) }));
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!checkAdmin()) return;
    await deleteVehicle(id);
    setFleetData(prev => ({ ...prev, vehicles: prev.vehicles.filter(x => x.id !== id) }));
  };

  const makeLogHandlers = (
    logKey: keyof FleetState,
    dbAdd: (l: any) => Promise<void>,
    dbUpdate: (l: any) => Promise<void>,
    dbDelete: (id: string) => Promise<void>,
  ) => ({
    onAdd: async (log: any) => {
      if (!checkAdmin()) return;
      await dbAdd(log);
      setFleetData(prev => ({ ...prev, [logKey]: [...(prev[logKey] as any[]), log] }));
    },
    onUpdate: async (log: any) => {
      if (!checkAdmin()) return;
      await dbUpdate(log);
      setFleetData(prev => ({ ...prev, [logKey]: (prev[logKey] as any[]).map(l => l.id === log.id ? log : l) }));
    },
    onDelete: async (logId: string) => {
      if (!checkAdmin()) return;
      await dbDelete(logId);
      setFleetData(prev => ({ ...prev, [logKey]: (prev[logKey] as any[]).filter(l => l.id !== logId) }));
    },
  });

  const stockItemHandlers = {
    onAddItem: async (item: StockItem) => {
      if (!checkAdmin()) return;
      await addStockItem(item);
      setFleetData(prev => ({ ...prev, stockItems: [...prev.stockItems, item] }));
    },
    onUpdateItem: async (item: StockItem) => {
      if (!checkAdmin()) return;
      await updateStockItem(item);
      setFleetData(prev => ({ ...prev, stockItems: prev.stockItems.map(x => x.itemCode === item.itemCode ? item : x) }));
    },
    onDeleteItem: async (itemCode: string) => {
      if (!checkAdmin()) return;
      await deleteStockItem(itemCode);
      setFleetData(prev => ({ ...prev, stockItems: prev.stockItems.filter(x => x.itemCode !== itemCode) }));
    },
  };

  const stockInHandlers = makeLogHandlers('stockInRecords', addStockIn, updateStockIn, deleteStockIn);
  const stockOutHandlers = makeLogHandlers('stockOutRecords', addStockOut, updateStockOut, deleteStockOut);

  const employeeHandlers = {
    onAddEmployee: async (emp: Employee) => {
      if (!checkAdmin()) return;
      await addEmployee(emp);
      setFleetData(prev => ({ ...prev, employees: [...prev.employees, emp] }));
    },
    onUpdateEmployee: async (emp: Employee) => {
      if (!checkAdmin()) return;
      await updateEmployee(emp);
      setFleetData(prev => ({ ...prev, employees: prev.employees.map(x => x.empId === emp.empId ? emp : x) }));
    },
    onDeleteEmployee: async (empId: string) => {
      if (!checkAdmin()) return;
      await deleteEmployee(empId);
      setFleetData(prev => ({ ...prev, employees: prev.employees.filter(x => x.empId !== empId) }));
    },
  };

  const leaveHandlers = makeLogHandlers('leaveRecords', addLeaveRecord, updateLeaveRecord, deleteLeaveRecord);
  const overtimeHandlers = makeLogHandlers('overtimeRecords', addOvertimeRecord, updateOvertimeRecord, deleteOvertimeRecord);
  const dailyLogHandlers = makeLogHandlers('dailyVehicleLogs', addDailyVehicleLog, updateDailyVehicleLog, deleteDailyVehicleLog);
  const fuelLogHandlers = makeLogHandlers('fuelLogs', addFuelLog, updateFuelLog, deleteFuelLog);
  const maintLogHandlers = makeLogHandlers('maintenanceLogs', addMaintenanceLog, updateMaintenanceLog, deleteMaintenanceLog);
  const inventoryHandlers = makeLogHandlers('inventoryItems', addInventoryItem, updateInventoryItem, deleteInventoryItem);
  const croppingHandlers = makeLogHandlers('croppingActivities', addCroppingActivity, updateCroppingActivity, deleteCroppingActivity);

  const handleRestore = async (data: FleetState) => {
    await restoreAllData(data);
    setFleetData(data);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'Dashboard': return <DashboardView data={fleetData} setActiveTab={setActiveTab} />;
      case 'Vehicle Maint.': return (
        <VehicleMaintenanceView
          vehicles={fleetData.vehicles}
          fuelLogs={fleetData.fuelLogs}
          maintenanceLogs={fleetData.maintenanceLogs}
          dailyVehicleLogs={fleetData.dailyVehicleLogs}
          onAddVehicle={handleAddVehicle}
          onUpdateVehicle={handleUpdateVehicle}
          onDeleteVehicle={handleDeleteVehicle}
          onAddFuelLog={fuelLogHandlers.onAdd}
          onUpdateFuelLog={fuelLogHandlers.onUpdate}
          onDeleteFuelLog={fuelLogHandlers.onDelete}
          onAddMaintenanceLog={maintLogHandlers.onAdd}
          onUpdateMaintenanceLog={maintLogHandlers.onUpdate}
          onDeleteMaintenanceLog={maintLogHandlers.onDelete}
          onAddDailyLog={dailyLogHandlers.onAdd}
          onUpdateDailyLog={dailyLogHandlers.onUpdate}
          onDeleteDailyLog={dailyLogHandlers.onDelete}
          isAdmin={isAdmin}
        />
      );
      case 'Store & Stock': return (
        <StoreStockView
          stockItems={fleetData.stockItems}
          stockInRecords={fleetData.stockInRecords}
          stockOutRecords={fleetData.stockOutRecords}
          {...stockItemHandlers}
          onAddStockIn={stockInHandlers.onAdd}
          onUpdateStockIn={stockInHandlers.onUpdate}
          onDeleteStockIn={stockInHandlers.onDelete}
          onAddStockOut={stockOutHandlers.onAdd}
          onUpdateStockOut={stockOutHandlers.onUpdate}
          onDeleteStockOut={stockOutHandlers.onDelete}
          isAdmin={isAdmin}
        />
      );
      case 'HR Management': return (
        <HRManagementView
          employees={fleetData.employees}
          leaveRecords={fleetData.leaveRecords}
          overtimeRecords={fleetData.overtimeRecords}
          {...employeeHandlers}
          onAddLeave={leaveHandlers.onAdd}
          onUpdateLeave={leaveHandlers.onUpdate}
          onDeleteLeave={leaveHandlers.onDelete}
          onAddOvertime={overtimeHandlers.onAdd}
          onUpdateOvertime={overtimeHandlers.onUpdate}
          onDeleteOvertime={overtimeHandlers.onDelete}
          isAdmin={isAdmin}
        />
      );
      case 'Cropping Calendar': return (
        <CroppingCalendarView
          data={fleetData.croppingActivities}
          onAdd={croppingHandlers.onAdd}
          onUpdate={croppingHandlers.onUpdate}
          onDelete={croppingHandlers.onDelete}
          isAdmin={isAdmin}
        />
      );
      case 'Inventory': return (
        <InventoryView
          data={fleetData.inventoryItems}
          onAdd={inventoryHandlers.onAdd}
          onUpdate={inventoryHandlers.onUpdate}
          onDelete={inventoryHandlers.onDelete}
          isAdmin={isAdmin}
        />
      );
      case 'Alerts': return (
        <div className="relative">
          <div className="blur-sm pointer-events-none select-none opacity-50">
            <AlertsView data={fleetData} setActiveTab={setActiveTab} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-8 py-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 text-center">
              <Bell size={32} className="text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-700 dark:text-slate-200 font-extrabold text-lg font-heading">Coming Soon</p>
              <p className="text-slate-400 text-sm mt-1">Alerts module is under development</p>
            </div>
          </div>
        </div>
      );
      case 'Reports': return <ReportView data={fleetData} />;
      case 'SOP & Backups': return <SOPView data={fleetData} onRestore={handleRestore} isAdmin={isAdmin} />;
      default: return <DashboardView data={fleetData} setActiveTab={setActiveTab} />;
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const { error } = await signIn(loginEmail, loginPassword);
    setLoginLoading(false);
    if (error) {
      setLoginError(error.message);
    } else {
      setShowLoginModal(false);
      setLoginEmail('');
      setLoginPassword('');
      setLoginError('');
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center mx-auto mb-6">
            <Leaf className="text-brand-500 animate-spin" size={32} />
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-heading font-bold text-lg">Government Seed Production Farm</p>
          <p className="text-xs text-slate-400 mt-1 font-body">Murunkan - Connecting to database...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-900">
        <div className="text-center max-w-md">
          <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="text-red-500" size={28} />
          </div>
          <p className="text-slate-800 dark:text-slate-200 font-heading font-bold text-lg mb-2">Connection Failed</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-body">{error}</p>
          <button onClick={loadData} className="btn-gov">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const sidebarContent = (
    <>
      {/* Decorative leaf pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-[0.03]">
        <Leaf size={128} />
      </div>

      {/* Government-style header banner */}
      <div className="p-4 md:p-6 pb-4 md:pb-5 relative">
        <div className="flex items-center space-x-3 mb-2">
          <img
            src="/logo.jpg"
            alt="Department of Agriculture Logo"
            className="w-full h-12 md:h-16 object-contain"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden w-11 h-11 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <Tractor className="text-green-300" size={22} />
          </div>
        </div>
        <div className="mt-3">
          <h1 className="text-sm md:text-base font-heading font-extrabold tracking-tight leading-tight text-white">Government Seed Production Farm</h1>
          <p className="text-[10px] text-green-300/80 uppercase tracking-[0.2em] font-heading font-semibold">Murunkan</p>
        </div>
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="flex items-center space-x-2">
            <Globe size={11} className="text-green-400/60" />
            <p className="text-[9px] text-green-300/50 uppercase tracking-widest font-heading font-medium">Sri Lanka | Northern Province</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 mt-2 px-3 md:px-4 space-y-0.5 overflow-y-auto">
        {NAVIGATION_ITEMS.filter(item => !(item.label === 'SOP & Backups' && role === 'STAFF')).map((item) => {
          const Icon = ICON_MAP[item.icon];
          if (!Icon) return null;
          const isActive = activeTab === item.label;
          const isAlerts = item.label === 'Alerts';
          return (
            <button
              key={item.label}
              onClick={() => { setActiveTab(item.label); setMobileMenuOpen(false); }}
              className={`w-full flex items-center space-x-3 px-3 md:px-4 py-2.5 md:py-3 rounded-xl transition-all relative group ${
                isAlerts ? 'opacity-30 cursor-default' :
                isActive
                  ? 'bg-white/15 text-white shadow-lg shadow-black/20 border border-white/10'
                  : 'text-green-200/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center transition-all ${
                isActive ? 'bg-brand-500 shadow-md shadow-brand-900/50' : 'bg-white/5 group-hover:bg-white/10'
              }`}>
                <Icon size={15} />
              </div>
              <span className="font-heading font-semibold text-[13px]">{item.label}</span>
              {isActive && <ChevronRight size={14} className="ml-auto opacity-50" />}
              {isAlerts && (
                <span className="ml-auto text-[8px] font-heading font-bold text-green-400/40 uppercase tracking-wider">Soon</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Dark mode toggle */}
      <div className="mx-3 md:mx-4 mb-2">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-full flex items-center space-x-3 px-3 md:px-4 py-2.5 rounded-xl text-green-300/60 hover:text-white hover:bg-white/5 transition-all"
        >
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/5 flex items-center justify-center">
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </div>
          <span className="font-heading font-semibold text-[13px]">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
      </div>

      {/* User panel */}
      <div className="m-3 md:m-4 mt-2 p-3 md:p-4 rounded-2xl bg-black/20 backdrop-blur-sm border border-white/10">
        <div className="flex items-center space-x-3 mb-3">
          <div className={`w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center border-2 ${
            isAdmin ? 'bg-brand-500 border-brand-300' : 'bg-white/10 border-white/20'
          }`}>
            <User size={14} />
          </div>
          <div className="overflow-hidden">
            <p className="text-[11px] font-heading font-bold truncate">{isAdmin ? 'Administrator' : 'Staff Member'}</p>
            <p className="text-[9px] text-green-400/50 uppercase tracking-widest font-heading">{role} Access</p>
          </div>
        </div>
        <button
          onClick={isAdmin ? handleLogout : () => { setShowLoginModal(true); setMobileMenuOpen(false); }}
          className={`w-full py-2.5 rounded-xl text-[10px] font-heading font-bold uppercase tracking-wider transition-all flex items-center justify-center space-x-1.5 ${
            isAdmin
              ? 'bg-white/5 text-green-300/70 hover:bg-white/10 hover:text-white border border-white/5'
              : 'bg-brand-500/30 text-brand-300 hover:bg-brand-500/40 border border-brand-500/20'
          }`}
        >
          {isAdmin ? <LogOut size={11} /> : <ShieldAlert size={11} />}
          <span>{isAdmin ? 'Logout' : 'Admin Login'}</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-900">
      {/* ======== MOBILE MENU OVERLAY ======== */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-gradient-to-b from-[#003d10] via-[#004a13] to-[#002a0b] text-white flex flex-col shadow-2xl relative overflow-hidden animate-slide-in-left">
            {/* Close button */}
            <button onClick={() => setMobileMenuOpen(false)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
              <X size={16} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* ======== DESKTOP SIDEBAR ======== */}
      <aside className="w-72 bg-gradient-to-b from-[#003d10] via-[#004a13] to-[#002a0b] text-white hidden md:flex flex-col shadow-2xl relative overflow-hidden">
        {sidebarContent}
      </aside>

      {/* ======== LOGIN MODAL ======== */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-slide-down">
            {/* Green top bar */}
            <div className="gov-header-accent h-2"></div>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
                  <ShieldAlert className="text-brand-500" size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-heading font-bold text-slate-800 dark:text-white">Admin Login</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-body">Enter your credentials to continue</p>
                </div>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="label-gov">Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="input-gov"
                    placeholder="admin@example.com"
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label-gov">Password</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="input-gov"
                    placeholder="Enter password"
                    required
                  />
                </div>
                {loginError && (
                  <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-xs font-medium px-3 py-2 rounded-lg border border-red-200 dark:border-red-800">
                    {loginError}
                  </div>
                )}
                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowLoginModal(false); setLoginError(''); setLoginEmail(''); setLoginPassword(''); }}
                    className="btn-gov-outline flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="btn-gov flex-1"
                  >
                    {loginLoading && <Loader2 className="animate-spin" size={14} />}
                    <span>{loginLoading ? 'Signing in...' : 'Sign In'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ======== MAIN CONTENT ======== */}
      <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-900 min-w-0">
        {/* Government-style header with green accent bar */}
        <div className="gov-header-accent h-1.5"></div>
        <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center relative">
          <div className="flex items-center space-x-3">
            {/* Mobile hamburger */}
            <button onClick={() => setMobileMenuOpen(true)} className="md:hidden w-9 h-9 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-base md:text-xl font-heading font-extrabold text-slate-800 dark:text-white tracking-tight">{activeTab}</h1>
              <div className="hidden sm:flex items-center space-x-2 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                <p className="text-[11px] text-slate-400 font-heading font-medium tracking-wide">Government Seed Production Farm - Murunkan</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2 md:space-x-5">
            <div className="text-right hidden sm:block">
              <p className="text-[11px] font-heading font-bold text-slate-700 dark:text-slate-200 tracking-tight">
                {new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <div className="flex items-center justify-end space-x-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[9px] text-brand-500 font-heading font-semibold uppercase tracking-wider">Cloud Connected</p>
              </div>
            </div>
            <div className="hidden sm:block h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
            <div className={`px-2.5 md:px-3 py-1 md:py-1.5 rounded-full text-[8px] md:text-[9px] font-heading font-bold uppercase tracking-wider border ${
              isAdmin
                ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border-brand-200 dark:border-brand-800'
                : 'bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600'
            }`}>
              {role}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 px-4 md:px-8 py-3 md:py-4 text-center">
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-heading font-medium tracking-wide">
            Government Seed Production Farm - Murunkan &copy; {new Date().getFullYear()} | Northern Province, Sri Lanka
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
