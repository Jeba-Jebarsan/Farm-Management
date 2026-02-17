
import React, { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, X, Loader2, Truck } from 'lucide-react';
import { Vehicle, VehicleType, VehicleStatus, FuelLog, MaintenanceLog, DailyVehicleLog } from '../types';
import { SRI_LANKA_PROVINCES } from '../constants';

interface Props {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  maintenanceLogs: MaintenanceLog[];
  dailyVehicleLogs: DailyVehicleLog[];
  onAddVehicle: (v: Vehicle) => Promise<void>;
  onUpdateVehicle: (v: Vehicle) => Promise<void>;
  onDeleteVehicle: (id: string) => Promise<void>;
  onAddFuelLog: (l: FuelLog) => Promise<void>;
  onUpdateFuelLog: (l: FuelLog) => Promise<void>;
  onDeleteFuelLog: (id: string) => Promise<void>;
  onAddMaintenanceLog: (l: MaintenanceLog) => Promise<void>;
  onUpdateMaintenanceLog: (l: MaintenanceLog) => Promise<void>;
  onDeleteMaintenanceLog: (id: string) => Promise<void>;
  onAddDailyLog: (l: DailyVehicleLog) => Promise<void>;
  onUpdateDailyLog: (l: DailyVehicleLog) => Promise<void>;
  onDeleteDailyLog: (id: string) => Promise<void>;
  isAdmin: boolean;
}

const SUB_TABS = ['Vehicle Register', 'Daily Vehicle Log', 'Vehicle Maintenance', 'Fuel Record'] as const;
type SubTab = typeof SUB_TABS[number];

const fmt = (n: number) => n.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const emptyVehicle = (): Vehicle => ({
  id: '',
  legalPlateNo: '',
  provinceCode: 'NP' as any,
  type: VehicleType.TRACTOR,
  makeModel: '',
  year: new Date().getFullYear().toString(),
  engineNo: '',
  chassisNo: '',
  status: VehicleStatus.ACTIVE,
  joinedDate: new Date().toISOString().split('T')[0],
});

const emptyDailyLog = (vehicles: Vehicle[]): DailyVehicleLog => ({
  id: Math.random().toString(36).substr(2, 9),
  date: new Date().toISOString().split('T')[0],
  vehicleId: vehicles[0]?.id || '',
  driver: '',
  purpose: '',
  kmStart: 0,
  kmEnd: 0,
  distance: 0,
  fuelUsed: 0,
  remarks: '',
});

const emptyMaintenance = (vehicles: Vehicle[]): MaintenanceLog => ({
  id: Math.random().toString(36).substr(2, 9),
  vehicleId: vehicles[0]?.id || '',
  date: new Date().toISOString().split('T')[0],
  type: 'Regular',
  odometer: 0,
  description: '',
  cost: 0,
  nextDueDate: '',
});

const emptyFuelLog = (vehicles: Vehicle[]): FuelLog => ({
  id: Math.random().toString(36).substr(2, 9),
  vehicleId: vehicles[0]?.id || '',
  legalPlateNo: vehicles[0]?.legalPlateNo || '',
  date: new Date().toISOString().split('T')[0],
  quantity: 0,
  cost: 0,
  mileage: 0,
  supplier: '',
});

const SERVICE_TYPES = ['Regular', 'Oil Change', 'Tyre Change', 'Engine Service', 'Body Work', 'Electrical', 'Other'];

const VehicleMaintenanceView: React.FC<Props> = ({
  vehicles, fuelLogs, maintenanceLogs, dailyVehicleLogs,
  onAddVehicle, onUpdateVehicle, onDeleteVehicle,
  onAddFuelLog, onUpdateFuelLog, onDeleteFuelLog,
  onAddMaintenanceLog, onUpdateMaintenanceLog, onDeleteMaintenanceLog,
  onAddDailyLog, onUpdateDailyLog, onDeleteDailyLog,
  isAdmin
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('Vehicle Register');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [vehicleForm, setVehicleForm] = useState<Vehicle>(emptyVehicle());
  const [dailyLogForm, setDailyLogForm] = useState<DailyVehicleLog>(emptyDailyLog(vehicles));
  const [maintForm, setMaintForm] = useState<MaintenanceLog>(emptyMaintenance(vehicles));
  const [fuelForm, setFuelForm] = useState<FuelLog>(emptyFuelLog(vehicles));

  const resetForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setVehicleForm(emptyVehicle());
    setDailyLogForm(emptyDailyLog(vehicles));
    setMaintForm(emptyMaintenance(vehicles));
    setFuelForm(emptyFuelLog(vehicles));
  };

  const wrap = async (fn: () => Promise<void>) => {
    setSaving(true);
    try { await fn(); resetForm(); } catch (e: any) { alert(e.message); } finally { setSaving(false); }
  };

  const getVehicleLabel = (id: string) => {
    const v = vehicles.find(v => v.id === id);
    return v ? `${v.id} - ${v.legalPlateNo}` : id;
  };

  // ===========================
  // VEHICLE REGISTER
  // ===========================
  const renderVehicleRegister = () => (
    <div>
      {isAdmin && !showForm && (
        <button onClick={() => { setVehicleForm(emptyVehicle()); setShowForm(true); setIsEditing(false); }}
          className="mb-4 flex items-center space-x-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700">
          <Plus size={16} /><span>Add Vehicle</span>
        </button>
      )}

      {showForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Vehicle No (ID)</label>
              <input value={vehicleForm.id} onChange={e => setVehicleForm({...vehicleForm, id: e.target.value})}
                disabled={isEditing}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Legal Plate No</label>
              <input value={vehicleForm.legalPlateNo} onChange={e => setVehicleForm({...vehicleForm, legalPlateNo: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Province</label>
              <select value={vehicleForm.provinceCode} onChange={e => setVehicleForm({...vehicleForm, provinceCode: e.target.value as any})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm">
                {SRI_LANKA_PROVINCES.map(p => <option key={p.code} value={p.code}>{p.code} - {p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Type</label>
              <select value={vehicleForm.type} onChange={e => setVehicleForm({...vehicleForm, type: e.target.value as VehicleType})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm">
                {Object.values(VehicleType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Model</label>
              <input value={vehicleForm.makeModel} onChange={e => setVehicleForm({...vehicleForm, makeModel: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Year</label>
              <input value={vehicleForm.year} onChange={e => setVehicleForm({...vehicleForm, year: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Engine No</label>
              <input value={vehicleForm.engineNo} onChange={e => setVehicleForm({...vehicleForm, engineNo: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Chassis No</label>
              <input value={vehicleForm.chassisNo} onChange={e => setVehicleForm({...vehicleForm, chassisNo: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Status</label>
              <select value={vehicleForm.status} onChange={e => setVehicleForm({...vehicleForm, status: e.target.value as VehicleStatus})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm">
                {Object.values(VehicleStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <button onClick={() => wrap(async () => isEditing ? await onUpdateVehicle(vehicleForm) : await onAddVehicle(vehicleForm))}
              disabled={saving || !vehicleForm.id}
              className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2">
              {saving && <Loader2 className="animate-spin" size={14} />}
              <span>{isEditing ? 'Update' : 'Save'}</span>
            </button>
            <button onClick={resetForm} className="px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-600 dark:text-slate-300">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                {['Vehicle No', 'Plate No', 'Type', 'Model', 'Year', 'Engine No', 'Status', ...(isAdmin ? ['Actions'] : [])].map(h =>
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {vehicles.map(v => (
                <tr key={v.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{v.id}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{v.legalPlateNo}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{v.type}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{v.makeModel}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{v.year}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{v.engineNo}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      v.status === VehicleStatus.ACTIVE ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      v.status === VehicleStatus.UNDER_REPAIR ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    }`}>{v.status}</span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button onClick={() => { setVehicleForm(v); setIsEditing(true); setShowForm(true); }}
                          className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded-lg"><Pencil size={14} /></button>
                        <button onClick={() => { if (confirm('Delete this vehicle?')) onDeleteVehicle(v.id); }}
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {vehicles.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No vehicles registered</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ===========================
  // DAILY VEHICLE LOG
  // ===========================
  const renderDailyLog = () => (
    <div>
      {isAdmin && !showForm && (
        <button onClick={() => { setDailyLogForm(emptyDailyLog(vehicles)); setShowForm(true); setIsEditing(false); }}
          className="mb-4 flex items-center space-x-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700">
          <Plus size={16} /><span>Add Daily Log</span>
        </button>
      )}

      {showForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">{isEditing ? 'Edit Daily Log' : 'Add Daily Log'}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Date</label>
              <input type="date" value={dailyLogForm.date} onChange={e => setDailyLogForm({...dailyLogForm, date: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Vehicle</label>
              <select value={dailyLogForm.vehicleId} onChange={e => setDailyLogForm({...dailyLogForm, vehicleId: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm">
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.id} - {v.legalPlateNo}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Driver</label>
              <input value={dailyLogForm.driver} onChange={e => setDailyLogForm({...dailyLogForm, driver: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Purpose</label>
              <input value={dailyLogForm.purpose} onChange={e => setDailyLogForm({...dailyLogForm, purpose: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Km Start</label>
              <input type="number" value={dailyLogForm.kmStart || ''} onChange={e => {
                const kmStart = parseFloat(e.target.value) || 0;
                setDailyLogForm({...dailyLogForm, kmStart, distance: Math.max(0, dailyLogForm.kmEnd - kmStart)});
              }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Km End</label>
              <input type="number" value={dailyLogForm.kmEnd || ''} onChange={e => {
                const kmEnd = parseFloat(e.target.value) || 0;
                setDailyLogForm({...dailyLogForm, kmEnd, distance: Math.max(0, kmEnd - dailyLogForm.kmStart)});
              }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Distance (Auto)</label>
              <input type="number" value={dailyLogForm.distance} readOnly
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-600 dark:text-white text-sm font-bold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Fuel Used (L)</label>
              <input type="number" value={dailyLogForm.fuelUsed || ''} onChange={e => setDailyLogForm({...dailyLogForm, fuelUsed: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Remarks</label>
              <input value={dailyLogForm.remarks} onChange={e => setDailyLogForm({...dailyLogForm, remarks: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <button onClick={() => wrap(async () => isEditing ? await onUpdateDailyLog(dailyLogForm) : await onAddDailyLog(dailyLogForm))}
              disabled={saving || !dailyLogForm.vehicleId}
              className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2">
              {saving && <Loader2 className="animate-spin" size={14} />}
              <span>{isEditing ? 'Update' : 'Save'}</span>
            </button>
            <button onClick={resetForm} className="px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-600 dark:text-slate-300">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                {['Date', 'Vehicle', 'Driver', 'Purpose', 'Km Start', 'Km End', 'Distance', 'Fuel (L)', 'Remarks', ...(isAdmin ? ['Actions'] : [])].map(h =>
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {dailyVehicleLogs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.date}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{getVehicleLabel(l.vehicleId)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.driver}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.purpose}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-right">{fmt(l.kmStart)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-right">{fmt(l.kmEnd)}</td>
                  <td className="px-4 py-3 font-bold text-green-700 dark:text-green-400 text-right">{fmt(l.distance)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-right">{l.fuelUsed}</td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400 text-xs">{l.remarks}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button onClick={() => { setDailyLogForm(l); setIsEditing(true); setShowForm(true); }}
                          className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded-lg"><Pencil size={14} /></button>
                        <button onClick={() => { if (confirm('Delete this log?')) onDeleteDailyLog(l.id); }}
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {dailyVehicleLogs.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-8 text-center text-slate-400">No daily logs recorded</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // ===========================
  // VEHICLE MAINTENANCE
  // ===========================
  const renderMaintenance = () => (
    <div>
      {isAdmin && !showForm && (
        <button onClick={() => { setMaintForm(emptyMaintenance(vehicles)); setShowForm(true); setIsEditing(false); }}
          className="mb-4 flex items-center space-x-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700">
          <Plus size={16} /><span>Add Maintenance</span>
        </button>
      )}

      {showForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">{isEditing ? 'Edit Maintenance' : 'Add Maintenance'}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Date</label>
              <input type="date" value={maintForm.date} onChange={e => setMaintForm({...maintForm, date: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Vehicle</label>
              <select value={maintForm.vehicleId} onChange={e => setMaintForm({...maintForm, vehicleId: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm">
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.id} - {v.legalPlateNo}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Service Type</label>
              <select value={maintForm.type} onChange={e => setMaintForm({...maintForm, type: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm">
                {SERVICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Cost (Rs)</label>
              <input type="number" value={maintForm.cost || ''} onChange={e => setMaintForm({...maintForm, cost: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Next Service Date</label>
              <input type="date" value={maintForm.nextDueDate} onChange={e => setMaintForm({...maintForm, nextDueDate: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Description / Workshop</label>
              <input value={maintForm.description} onChange={e => setMaintForm({...maintForm, description: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <button onClick={() => wrap(async () => isEditing ? await onUpdateMaintenanceLog(maintForm) : await onAddMaintenanceLog(maintForm))}
              disabled={saving || !maintForm.vehicleId}
              className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2">
              {saving && <Loader2 className="animate-spin" size={14} />}
              <span>{isEditing ? 'Update' : 'Save'}</span>
            </button>
            <button onClick={resetForm} className="px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-600 dark:text-slate-300">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                {['Date', 'Vehicle', 'Service Type', 'Cost (Rs)', 'Next Service', 'Workshop', ...(isAdmin ? ['Actions'] : [])].map(h =>
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {maintenanceLogs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.date}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{getVehicleLabel(l.vehicleId)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.type}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-right font-bold">Rs. {fmt(l.cost)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.nextDueDate}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.description}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button onClick={() => { setMaintForm(l); setIsEditing(true); setShowForm(true); }}
                          className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded-lg"><Pencil size={14} /></button>
                        <button onClick={() => { if (confirm('Delete this record?')) onDeleteMaintenanceLog(l.id); }}
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {maintenanceLogs.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No maintenance records</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {maintenanceLogs.length > 0 && (
          <div className="bg-slate-800 dark:bg-slate-900 text-white px-4 py-3 flex justify-between text-sm font-bold">
            <span>Total Maintenance Cost</span>
            <span>Rs. {fmt(maintenanceLogs.reduce((s, l) => s + l.cost, 0))}</span>
          </div>
        )}
      </div>
    </div>
  );

  // ===========================
  // FUEL RECORD
  // ===========================
  const renderFuelRecord = () => (
    <div>
      {isAdmin && !showForm && (
        <button onClick={() => { setFuelForm(emptyFuelLog(vehicles)); setShowForm(true); setIsEditing(false); }}
          className="mb-4 flex items-center space-x-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-green-700">
          <Plus size={16} /><span>Add Fuel Record</span>
        </button>
      )}

      {showForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 dark:text-white">{isEditing ? 'Edit Fuel Record' : 'Add Fuel Record'}</h3>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Date</label>
              <input type="date" value={fuelForm.date} onChange={e => setFuelForm({...fuelForm, date: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Vehicle</label>
              <select value={fuelForm.vehicleId} onChange={e => {
                const v = vehicles.find(v => v.id === e.target.value);
                setFuelForm({...fuelForm, vehicleId: e.target.value, legalPlateNo: v?.legalPlateNo || ''});
              }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm">
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.id} - {v.legalPlateNo}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Liters</label>
              <input type="number" value={fuelForm.quantity || ''} onChange={e => setFuelForm({...fuelForm, quantity: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Cost (Rs)</label>
              <input type="number" value={fuelForm.cost || ''} onChange={e => setFuelForm({...fuelForm, cost: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Meter Reading</label>
              <input type="number" value={fuelForm.mileage || ''} onChange={e => setFuelForm({...fuelForm, mileage: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Supplier</label>
              <input value={fuelForm.supplier} onChange={e => setFuelForm({...fuelForm, supplier: e.target.value})}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white text-sm" />
            </div>
          </div>
          <div className="flex space-x-3 mt-4">
            <button onClick={() => wrap(async () => isEditing ? await onUpdateFuelLog(fuelForm) : await onAddFuelLog(fuelForm))}
              disabled={saving || !fuelForm.vehicleId}
              className="bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2">
              {saving && <Loader2 className="animate-spin" size={14} />}
              <span>{isEditing ? 'Update' : 'Save'}</span>
            </button>
            <button onClick={resetForm} className="px-6 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-600 dark:text-slate-300">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
                {['Date', 'Vehicle', 'Liters', 'Cost (Rs)', 'Meter Reading', 'Supplier', ...(isAdmin ? ['Actions'] : [])].map(h =>
                  <th key={h} className="px-4 py-3 text-left text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{h}</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {fuelLogs.map(l => (
                <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.date}</td>
                  <td className="px-4 py-3 font-bold text-slate-800 dark:text-white">{getVehicleLabel(l.vehicleId)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-right">{l.quantity}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-right font-bold">Rs. {fmt(l.cost)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300 text-right">{fmt(l.mileage)}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{l.supplier}</td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        <button onClick={() => { setFuelForm(l); setIsEditing(true); setShowForm(true); }}
                          className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5 rounded-lg"><Pencil size={14} /></button>
                        <button onClick={() => { if (confirm('Delete this record?')) onDeleteFuelLog(l.id); }}
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 p-1.5 rounded-lg"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {fuelLogs.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No fuel records</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {fuelLogs.length > 0 && (
          <div className="bg-slate-800 dark:bg-slate-900 text-white px-4 py-3 flex justify-between text-sm font-bold">
            <span>Total Fuel: {fmt(fuelLogs.reduce((s, l) => s + l.quantity, 0))} L</span>
            <span>Total Cost: Rs. {fmt(fuelLogs.reduce((s, l) => s + l.cost, 0))}</span>
          </div>
        )}
      </div>
    </div>
  );

  // ===========================
  // MAIN RENDER
  // ===========================
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <Truck className="text-green-600" size={22} />
        <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">Vehicle Maintenance Sheet</h2>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {SUB_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveSubTab(tab); resetForm(); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeSubTab === tab
                ? 'bg-white dark:bg-slate-700 text-green-700 dark:text-green-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeSubTab === 'Vehicle Register' && renderVehicleRegister()}
      {activeSubTab === 'Daily Vehicle Log' && renderDailyLog()}
      {activeSubTab === 'Vehicle Maintenance' && renderMaintenance()}
      {activeSubTab === 'Fuel Record' && renderFuelRecord()}
    </div>
  );
};

export default VehicleMaintenanceView;
