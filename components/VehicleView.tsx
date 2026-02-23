import React, { useState, useEffect } from 'react';
import {
  Plus, Search, Pencil, Trash2, CheckCircle2,
  XCircle, ChevronDown, Wrench, Ban, AlertCircle, FileText, Loader2
} from 'lucide-react';
import { FleetState, Vehicle, VehicleType, VehicleStatus, Role, ProvinceCode } from '../types';
import { SRI_LANKA_PROVINCES } from '../constants';

interface Props {
  data: FleetState;
  onAdd: (v: Vehicle) => Promise<void>;
  onUpdate: (v: Vehicle) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  role: Role;
}

const VehicleView: React.FC<Props> = ({ data, onAdd, onUpdate, onDelete, role }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [idError, setIdError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [formVehicle, setFormVehicle] = useState<Partial<Vehicle>>({
    id: '',
    legalPlateNo: '',
    provinceCode: 'WP',
    type: VehicleType.LORRY,
    makeModel: '',
    year: new Date().getFullYear().toString(),
    engineNo: '',
    chassisNo: '',
    status: VehicleStatus.ACTIVE,
    joinedDate: new Date().toISOString().split('T')[0]
  });

  const isAdmin = role === 'ADMIN';

  const validateId = (id: string) => {
    if (!id) return "Internal ID is required";
    const regex = /^(TR|LR|BK|GN|OT)-\d+$/;
    if (!regex.test(id)) {
      return "Format: PREFIX-NUMBER (e.g., TR-1001). Allowed: TR, LR, BK, GN, OT";
    }
    return null;
  };

  useEffect(() => {
    if (formVehicle.id) setIdError(validateId(formVehicle.id));
    else setIdError(null);
  }, [formVehicle.id]);

  const handleOpenAdd = () => {
    if (!isAdmin) return;
    setIsEditing(false);
    setFormVehicle({
      id: '',
      legalPlateNo: '',
      provinceCode: 'WP',
      type: VehicleType.LORRY,
      makeModel: '',
      year: new Date().getFullYear().toString(),
      engineNo: '',
      chassisNo: '',
      status: VehicleStatus.ACTIVE,
      joinedDate: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    if (!isAdmin) return;
    setIsEditing(true);
    setFormVehicle(v);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) return;
    if (confirm(`CRITICAL: Remove asset ${id}? All log associations will be orphaned.`)) {
      try {
        await onDelete(id);
      } catch (err: any) {
        alert('Failed to delete: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (idError) return;

    setSaving(true);
    try {
      if (isEditing) {
        await onUpdate(formVehicle as Vehicle);
      } else {
        if (data.vehicles.some(v => v.id === formVehicle.id)) {
          alert("Duplicate Internal ID detected.");
          setSaving(false);
          return;
        }
        await onAdd(formVehicle as Vehicle);
      }
      setShowModal(false);
    } catch (err: any) {
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const filtered = data.vehicles.filter(v =>
    v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.legalPlateNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.makeModel.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: VehicleStatus) => {
    const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm ";
    switch (status) {
      case VehicleStatus.ACTIVE: return base + "bg-green-100 text-green-700 border-green-200";
      case VehicleStatus.UNDER_REPAIR: return base + "bg-orange-100 text-orange-700 border-orange-200";
      case VehicleStatus.OUT_OF_SERVICE: return base + "bg-rose-100 text-rose-700 border-rose-200";
      default: return base + "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        {isAdmin && (
          <button onClick={handleOpenAdd} className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-5 py-2 md:py-2.5 rounded-xl flex items-center space-x-2 text-sm font-bold shadow-lg shadow-blue-200">
            <Plus size={16} />
            <span>New Asset</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
              <th className="px-3 md:px-6 py-3 md:py-4">Internal ID</th>
              <th className="px-3 md:px-6 py-3 md:py-4">SL Plate No</th>
              <th className="px-3 md:px-6 py-3 md:py-4">Asset Details</th>
              <th className="px-3 md:px-6 py-3 md:py-4">Status</th>
              {isAdmin && <th className="px-3 md:px-6 py-3 md:py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(v => (
              <tr key={v.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-3 md:px-6 py-3 md:py-4 font-bold text-blue-600">
                  <span className="bg-blue-50 px-2 py-1 rounded-md border border-blue-100">{v.id}</span>
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4">
                  <div className="flex items-center space-x-2">
                    <span className="bg-slate-100 text-slate-400 text-[10px] font-bold px-1.5 py-0.5 rounded border border-slate-200">{v.provinceCode}</span>
                    <span className="font-mono font-bold text-slate-700">{v.legalPlateNo}</span>
                  </div>
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4">
                  <div>
                    <p className="font-bold text-slate-800">{v.makeModel} <span className="text-slate-400 font-normal">({v.year})</span></p>
                    <p className="text-[10px] text-slate-400 font-medium uppercase mt-0.5">Engine: {v.engineNo}</p>
                  </div>
                </td>
                <td className="px-3 md:px-6 py-3 md:py-4">
                  <span className={getStatusBadge(v.status)}>{v.status}</span>
                </td>
                {isAdmin && (
                  <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                    <div className="flex justify-end space-x-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEdit(v)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil size={16}/></button>
                      <button onClick={() => handleDelete(v.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16}/></button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
              <Ban className="text-slate-300" size={32} />
            </div>
            <p className="text-slate-500 font-bold tracking-tight">System is currently empty.</p>
            <p className="text-xs text-slate-400 mt-1">{isAdmin ? "Click 'New Asset' to register your first vehicle." : "Admin has not registered any assets yet."}</p>
          </div>
        )}
      </div>

      {showModal && isAdmin && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-[95vw] md:max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-4 md:px-8 py-4 md:py-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">{isEditing ? `Edit Asset: ${formVehicle.id}` : 'Register New Asset'}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Sri Lankan Compliance Registry</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-white rounded-full transition-all">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-4 md:space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Internal ID</label>
                  <input
                    required disabled={isEditing}
                    placeholder="e.g. TR-1001"
                    className={`w-full px-4 py-3 border rounded-2xl focus:ring-2 focus:bg-white outline-none transition-all ${idError ? 'border-red-500 bg-red-50' : 'bg-slate-50 border-slate-200 focus:ring-blue-500'}`}
                    value={formVehicle.id}
                    onChange={e => setFormVehicle({...formVehicle, id: e.target.value.toUpperCase()})}
                  />
                  {idError && <p className="text-[10px] font-bold text-red-500 italic mt-1">{idError}</p>}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Asset Category</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formVehicle.type}
                    onChange={e => setFormVehicle({...formVehicle, type: e.target.value as VehicleType})}
                  >
                    {Object.values(VehicleType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Province</label>
                  <select
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formVehicle.provinceCode}
                    onChange={e => setFormVehicle({...formVehicle, provinceCode: e.target.value as ProvinceCode})}
                  >
                    {SRI_LANKA_PROVINCES.map(p => <option key={p.code} value={p.code}>{p.code} - {p.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2 space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Legal Plate Number</label>
                  <input
                    required placeholder="WP CAE-1234"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formVehicle.legalPlateNo}
                    onChange={e => setFormVehicle({...formVehicle, legalPlateNo: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Make & Model</label>
                  <input required placeholder="Toyota Hilux" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formVehicle.makeModel} onChange={e => setFormVehicle({...formVehicle, makeModel: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Year</label>
                  <input required placeholder="2024" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formVehicle.year} onChange={e => setFormVehicle({...formVehicle, year: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 border-t border-slate-100 pt-6">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Engine Number</label>
                  <input required placeholder="2GD-XXXX" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formVehicle.engineNo} onChange={e => setFormVehicle({...formVehicle, engineNo: e.target.value.toUpperCase()})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Chassis Number</label>
                  <input required placeholder="MRO-XXXX" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl" value={formVehicle.chassisNo} onChange={e => setFormVehicle({...formVehicle, chassisNo: e.target.value.toUpperCase()})} />
                </div>
              </div>

              <div className="flex space-x-4 pt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 text-sm font-bold text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                <button type="submit" disabled={!!idError || saving} className={`flex-1 py-4 text-sm font-extrabold text-white rounded-2xl shadow-xl transition-all flex items-center justify-center space-x-2 ${idError || saving ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300'}`}>
                  {saving && <Loader2 className="animate-spin" size={16} />}
                  <span>{isEditing ? 'Save Changes' : 'Complete Registration'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleView;
