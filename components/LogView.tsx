
import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Ban, X, Loader2 } from 'lucide-react';
import { Vehicle } from '../types';

interface Props {
  title: string;
  icon: React.ReactNode;
  data: any[];
  vehicles: Vehicle[];
  onAdd: (log: any) => Promise<void>;
  onUpdate: (log: any) => Promise<void>;
  onDelete: (logId: string) => Promise<void>;
  isMaintenance?: boolean;
  isRepair?: boolean;
  isInsurance?: boolean;
  isAdmin: boolean;
}

const emptyLog = (vehicles: Vehicle[]) => ({
  id: Math.random().toString(36).substr(2, 9),
  vehicleId: vehicles[0]?.id || '',
  date: new Date().toISOString().split('T')[0],
  cost: 0,
  quantity: 0,
  supplier: '',
  type: 'Regular',
  description: '',
  odometer: 0,
  nextDueDate: '',
  issue: '',
  actionTaken: '',
  partsUsed: '',
  downtimeDays: 0,
  policyNo: '',
  startDate: new Date().toISOString().split('T')[0],
  endDate: '',
  company: '',
  premium: 0,
  mileage: 0
});

const LogView: React.FC<Props> = ({ title, icon, data, vehicles, onAdd, onUpdate, onDelete, isMaintenance, isRepair, isInsurance, isAdmin }) => {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(emptyLog(vehicles));
  const [saving, setSaving] = useState(false);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setFormData(emptyLog(vehicles));
    setShowForm(true);
  };

  const handleOpenEdit = (log: any) => {
    setIsEditing(true);
    setFormData({ ...log });
    setShowForm(true);
  };

  const handleDelete = async (logId: string) => {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        await onDelete(logId);
      } catch (err: any) {
        alert('Failed to delete: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId);
    const logData = {
      ...formData,
      legalPlateNo: selectedVehicle?.legalPlateNo || 'N/A'
    };

    setSaving(true);
    try {
      if (isEditing) {
        await onUpdate(logData);
      } else {
        await onAdd(logData);
      }
      setShowForm(false);
      setFormData(emptyLog(vehicles));
    } catch (err: any) {
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center text-slate-700">
          <span className="p-2 bg-blue-50 rounded-lg mr-3 text-blue-600">{icon}</span>
          {title}
        </h2>
        {isAdmin && vehicles.length > 0 && (
          <button
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 text-sm font-bold shadow-lg shadow-blue-200"
          >
            <Plus size={18} />
            <span>Add Entry</span>
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="bg-white p-8 rounded-3xl border-2 border-blue-50 shadow-xl space-y-8 animate-fade-in">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              {isEditing ? 'Edit Record' : 'New Entry Record'}
            </p>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Target Vehicle</label>
              <select
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.vehicleId}
                onChange={(e) => setFormData({...formData, vehicleId: e.target.value})}
                disabled={isEditing}
              >
                {vehicles.map(v => <option key={v.id} value={v.id}>{v.id} ({v.legalPlateNo})</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Transaction Date</label>
              <input
                type="date"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Cost (LKR)</label>
              <input
                type="number"
                min="0"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
                value={formData.cost}
                onChange={(e) => setFormData({...formData, cost: Number(e.target.value)})}
              />
            </div>

            {isMaintenance ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Odometer (km)</label>
                  <input type="number" min="0" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.odometer || ''} onChange={e => setFormData({...formData, odometer: Number(e.target.value)})}/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Next Due Date</label>
                  <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.nextDueDate || ''} onChange={e => setFormData({...formData, nextDueDate: e.target.value})}/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Maintenance Detail</label>
                  <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" placeholder="Describe work done..." value={formData.description || ''} onChange={e => setFormData({...formData, description: e.target.value})}/>
                </div>
              </>
            ) : isRepair ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Reported Issue</label>
                  <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.issue || ''} onChange={e => setFormData({...formData, issue: e.target.value})}/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Technical Action</label>
                  <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.actionTaken || ''} onChange={e => setFormData({...formData, actionTaken: e.target.value})}/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Downtime (Days)</label>
                  <input type="number" min="0" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.downtimeDays || ''} onChange={e => setFormData({...formData, downtimeDays: Number(e.target.value)})}/>
                </div>
              </>
            ) : isInsurance ? (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Policy Number</label>
                  <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.policyNo || ''} onChange={e => setFormData({...formData, policyNo: e.target.value})}/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Start Date</label>
                  <input required type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.startDate || ''} onChange={e => setFormData({...formData, startDate: e.target.value})}/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Expiry Date</label>
                  <input required type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.endDate || ''} onChange={e => setFormData({...formData, endDate: e.target.value})}/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Underwriter Company</label>
                  <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})}/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Premium (LKR)</label>
                  <input type="number" min="0" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.premium || ''} onChange={e => setFormData({...formData, premium: Number(e.target.value)})}/>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Quantity (Liters)</label>
                  <input type="number" step="0.01" min="0" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.quantity || ''} onChange={e => setFormData({...formData, quantity: Number(e.target.value)})}/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Mileage (km)</label>
                  <input type="number" min="0" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formData.mileage || ''} onChange={e => setFormData({...formData, mileage: Number(e.target.value)})}/>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Fuel Station / Supplier</label>
                  <input required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" placeholder="e.g. CEYPETCO / LIOC" value={formData.supplier || ''} onChange={e => setFormData({...formData, supplier: e.target.value})}/>
                </div>
              </>
            )}

            <div className="col-span-full flex justify-end space-x-4 pt-4 border-t border-slate-50">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
              <button type="submit" disabled={saving} className={`px-10 py-3 text-white rounded-2xl font-extrabold shadow-xl shadow-blue-200 flex items-center space-x-2 ${saving ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {saving && <Loader2 className="animate-spin" size={16} />}
                <span>{isEditing ? 'Save Changes' : 'Commit Record'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">Internal ID</th>
              <th className="px-6 py-4">Plate No</th>
              <th className="px-6 py-4">Transaction Date</th>
              <th className="px-6 py-4">Technical Details</th>
              <th className="px-6 py-4">Cost (LKR)</th>
              {isAdmin && <th className="px-6 py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {data.length === 0 ? (
              <tr><td colSpan={isAdmin ? 6 : 5} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center">
                  <Ban size={32} className="text-slate-200 mb-3" />
                  <p className="text-slate-400 font-bold tracking-tight italic">No activity logs recorded.</p>
                </div>
              </td></tr>
            ) : (
              [...data].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{log.vehicleId}</span>
                  </td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-500">
                    {log.legalPlateNo}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {new Date(log.date).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-6 py-4 text-slate-700">
                    {isMaintenance ? log.description : isRepair ? log.issue : isInsurance ? `${log.policyNo} (${log.company})` : `${log.quantity}L @ ${log.supplier}`}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-slate-800">
                    Rs. {log.cost.toLocaleString()}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(log)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                          <Pencil size={15}/>
                        </button>
                        <button onClick={() => handleDelete(log.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Delete">
                          <Trash2 size={15}/>
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LogView;
