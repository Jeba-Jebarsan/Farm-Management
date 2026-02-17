
import React, { useState, useMemo, useRef } from 'react';
import { Plus, Pencil, Trash2, Ban, X, Loader2, Users, Camera, CalendarClock, AlertTriangle, MapPin } from 'lucide-react';
import { Employee, LeaveRecord, OvertimeRecord } from '../types';

interface Props {
  employees: Employee[];
  leaveRecords: LeaveRecord[];
  overtimeRecords: OvertimeRecord[];
  onAddEmployee: (emp: Employee) => Promise<void>;
  onUpdateEmployee: (emp: Employee) => Promise<void>;
  onDeleteEmployee: (empId: string) => Promise<void>;
  onAddLeave: (record: LeaveRecord) => Promise<void>;
  onUpdateLeave: (record: LeaveRecord) => Promise<void>;
  onDeleteLeave: (id: string) => Promise<void>;
  onAddOvertime: (record: OvertimeRecord) => Promise<void>;
  onUpdateOvertime: (record: OvertimeRecord) => Promise<void>;
  onDeleteOvertime: (id: string) => Promise<void>;
  isAdmin: boolean;
}

const EMP_TYPES = ['Permanent', 'Contract', 'Daily', 'Casual'];
const LEAVE_TYPES = ['Annual', 'Casual', 'Sick', 'No Pay', 'Other'];
const APPROVAL_STATUS = ['Pending', 'Approved', 'Rejected'];
const SUB_TABS = ['Employee Register', 'Leave Register', 'Overtime'] as const;
type SubTab = typeof SUB_TABS[number];

const fmt = (n: number) => n.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const emptyEmployee = (): Employee => ({
  empId: '',
  name: '',
  designation: '',
  address: '',
  joinDate: new Date().toISOString().split('T')[0],
  wagePerDay: 0,
  empType: 'Permanent',
  incrementDate: '',
  profilePic: '',
});

const emptyLeave = (emps: Employee[]): LeaveRecord => ({
  id: Math.random().toString(36).substr(2, 9),
  empId: emps[0]?.empId || '',
  leaveType: 'Annual',
  fromDate: new Date().toISOString().split('T')[0],
  toDate: new Date().toISOString().split('T')[0],
  days: 1,
  approved: 'Pending',
});

const emptyOvertime = (emps: Employee[]): OvertimeRecord => ({
  id: Math.random().toString(36).substr(2, 9),
  date: new Date().toISOString().split('T')[0],
  empId: emps[0]?.empId || '',
  otHours: 0,
  rate: 0,
  amount: 0,
});

const HRManagementView: React.FC<Props> = ({
  employees, leaveRecords, overtimeRecords,
  onAddEmployee, onUpdateEmployee, onDeleteEmployee,
  onAddLeave, onUpdateLeave, onDeleteLeave,
  onAddOvertime, onUpdateOvertime, onDeleteOvertime,
  isAdmin
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('Employee Register');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showIncrementAlert, setShowIncrementAlert] = useState(true);

  const [empForm, setEmpForm] = useState<Employee>(emptyEmployee());
  const [leaveForm, setLeaveForm] = useState<LeaveRecord>(emptyLeave(employees));
  const [otForm, setOtForm] = useState<OvertimeRecord>(emptyOvertime(employees));

  const fileInputRef = useRef<HTMLInputElement>(null);

  // INCREMENT DATE ALERTS - within 30 days
  const incrementAlerts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const thirtyDaysLater = new Date(today);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

    return employees
      .filter(emp => {
        if (!emp.incrementDate) return false;
        const incDate = new Date(emp.incrementDate);
        incDate.setHours(0, 0, 0, 0);
        return incDate >= today && incDate <= thirtyDaysLater;
      })
      .map(emp => {
        const incDate = new Date(emp.incrementDate);
        const diffDays = Math.ceil((incDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return { ...emp, daysLeft: diffDays };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [employees]);

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) {
      alert('Image must be under 500KB. Please use a smaller image.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setEmpForm({ ...empForm, profilePic: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const updateLeaveDays = (from: string, to: string) => {
    if (from && to) {
      const diff = Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return Math.max(diff, 0);
    }
    return 0;
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    if (activeSubTab === 'Employee Register') setEmpForm(emptyEmployee());
    else if (activeSubTab === 'Leave Register') setLeaveForm(emptyLeave(employees));
    else if (activeSubTab === 'Overtime') setOtForm(emptyOvertime(employees));
    setShowForm(true);
  };

  const handleDelete = async (id: string, type: 'emp' | 'leave' | 'ot') => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        if (type === 'emp') await onDeleteEmployee(id);
        else if (type === 'leave') await onDeleteLeave(id);
        else await onDeleteOvertime(id);
      } catch (err: any) {
        alert('Failed to delete: ' + (err.message || 'Unknown error'));
      }
    }
  };

  // =============================================
  // EMPLOYEE REGISTER
  // =============================================
  const handleSubmitEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!empForm.empId.trim() || !empForm.name.trim()) {
      alert('Employee ID and Name are required.');
      return;
    }
    setSaving(true);
    try {
      if (isEditing) {
        await onUpdateEmployee(empForm);
      } else {
        if (employees.some(e => e.empId === empForm.empId)) {
          alert('Employee ID already exists.');
          setSaving(false);
          return;
        }
        await onAddEmployee(empForm);
      }
      setShowForm(false);
      setEmpForm(emptyEmployee());
    } catch (err: any) {
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const renderEmployeeRegister = () => (
    <>
      {/* INCREMENT ALERT POPUP */}
      {showIncrementAlert && incrementAlerts.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-5 mb-6 animate-slide-down">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-100 dark:bg-amber-800/50 rounded-xl">
                <AlertTriangle className="text-amber-600 dark:text-amber-400" size={20} />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-amber-800 dark:text-amber-300 text-sm">Upcoming Salary Increments</h3>
                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-body">Employees with increment due within 30 days</p>
              </div>
            </div>
            <button onClick={() => setShowIncrementAlert(false)} className="text-amber-400 hover:text-amber-600 p-1 rounded-full hover:bg-amber-100 dark:hover:bg-amber-800/50">
              <X size={16} />
            </button>
          </div>
          <div className="space-y-2">
            {incrementAlerts.map(emp => (
              <div key={emp.empId} className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-lg px-4 py-3 border border-amber-200 dark:border-amber-800">
                <div className="flex items-center space-x-3">
                  {emp.profilePic ? (
                    <img src={emp.profilePic} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-amber-200" />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400 text-xs font-heading font-bold">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-heading font-bold text-sm text-slate-800 dark:text-white">{emp.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-body">{emp.empId} - {emp.designation}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-heading font-bold text-amber-700 dark:text-amber-300">{new Date(emp.incrementDate).toLocaleDateString('en-GB')}</p>
                  <p className={`text-[10px] font-heading font-extrabold ${
                    emp.daysLeft <= 7 ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {emp.daysLeft === 0 ? 'TODAY!' : `${emp.daysLeft} day${emp.daysLeft > 1 ? 's' : ''} left`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* EMPLOYEE FORM */}
      {showForm && isAdmin && (
        <div className="card-gov p-0 mb-6 animate-slide-down">
          {/* Green accent bar */}
          <div className="gov-header-accent h-1.5 rounded-t-xl"></div>
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-heading font-extrabold text-brand-700 dark:text-brand-400 text-sm uppercase tracking-wider">
                {isEditing ? 'Edit Employee' : 'New Employee Registration'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
                <X size={18} />
              </button>
            </div>

            {/* Profile Picture Upload */}
            <div className="flex items-center space-x-6 pb-4 border-b border-slate-100 dark:border-slate-700">
              <div className="relative group">
                {empForm.profilePic ? (
                  <img src={empForm.profilePic} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-brand-200 dark:border-brand-800 shadow-lg" />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-brand-50 dark:bg-brand-900/30 border-4 border-brand-200 dark:border-brand-800 flex items-center justify-center shadow-lg">
                    <Users size={32} className="text-brand-300 dark:text-brand-700" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-brand-500 hover:bg-brand-600 text-white rounded-full flex items-center justify-center shadow-lg border-3 border-white dark:border-slate-800 transition-transform group-hover:scale-110"
                >
                  <Camera size={13} />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePicUpload} className="hidden" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm text-slate-700 dark:text-slate-200">Profile Photo</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-body">Click camera to upload (max 500KB)</p>
                {empForm.profilePic && (
                  <button type="button" onClick={() => setEmpForm({ ...empForm, profilePic: '' })}
                    className="text-[10px] text-red-500 hover:text-red-700 font-heading font-bold mt-1.5 uppercase tracking-wider">
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            <form onSubmit={handleSubmitEmployee} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label-gov">Employee ID</label>
                <input required className="input-gov" placeholder="e.g. EMP-001" value={empForm.empId} onChange={e => setEmpForm({ ...empForm, empId: e.target.value })} disabled={isEditing} />
              </div>
              <div>
                <label className="label-gov">Full Name</label>
                <input required className="input-gov" placeholder="Full name" value={empForm.name} onChange={e => setEmpForm({ ...empForm, name: e.target.value })} />
              </div>
              <div>
                <label className="label-gov">Designation</label>
                <input required className="input-gov" placeholder="e.g. Driver, Supervisor" value={empForm.designation} onChange={e => setEmpForm({ ...empForm, designation: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <label className="label-gov flex items-center space-x-1">
                  <MapPin size={10} />
                  <span>Address</span>
                </label>
                <input className="input-gov" placeholder="Full address" value={empForm.address} onChange={e => setEmpForm({ ...empForm, address: e.target.value })} />
              </div>
              <div>
                <label className="label-gov">Employee Type</label>
                <select className="input-gov" value={empForm.empType} onChange={e => setEmpForm({ ...empForm, empType: e.target.value })}>
                  {EMP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label-gov">Join Date</label>
                <input type="date" className="input-gov" value={empForm.joinDate} onChange={e => setEmpForm({ ...empForm, joinDate: e.target.value })} />
              </div>
              <div>
                <label className="label-gov">Wage / Day (LKR)</label>
                <input type="number" step="0.01" min="0" className="input-gov" value={empForm.wagePerDay || ''} onChange={e => setEmpForm({ ...empForm, wagePerDay: Number(e.target.value) })} />
              </div>
              <div>
                <label className="label-gov flex items-center space-x-1">
                  <CalendarClock size={10} />
                  <span>Increment Date</span>
                </label>
                <input type="date" className="input-gov" value={empForm.incrementDate} onChange={e => setEmpForm({ ...empForm, incrementDate: e.target.value })} />
                <p className="text-[9px] text-slate-400 mt-1 font-body">Alert shows 30 days before</p>
              </div>
              <div className="col-span-full flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setShowForm(false)} className="btn-gov-outline">Discard</button>
                <button type="submit" disabled={saving} className="btn-gov">
                  {saving && <Loader2 className="animate-spin" size={14} />}
                  <span>{isEditing ? 'Save Changes' : 'Register Employee'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EMPLOYEE TABLE */}
      <div className="card-gov">
        <table className="table-gov">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Designation</th>
              <th>Address</th>
              <th>Join Date</th>
              <th className="text-right">Wage/Day</th>
              <th>Type</th>
              <th>Increment</th>
              {isAdmin && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {employees.length === 0 ? (
              <tr><td colSpan={isAdmin ? 8 : 7} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center">
                  <Ban size={32} className="text-slate-200 dark:text-slate-600 mb-3" />
                  <p className="text-slate-400 font-heading font-bold text-sm">No employees registered</p>
                  <p className="text-slate-300 dark:text-slate-600 text-xs mt-1 font-body">Click "Add Entry" to register your first employee</p>
                </div>
              </td></tr>
            ) : (
              employees.map(emp => {
                const isIncrementSoon = (() => {
                  if (!emp.incrementDate) return false;
                  const today = new Date(); today.setHours(0,0,0,0);
                  const inc = new Date(emp.incrementDate); inc.setHours(0,0,0,0);
                  const diff = Math.ceil((inc.getTime() - today.getTime()) / (1000*60*60*24));
                  return diff >= 0 && diff <= 30;
                })();
                return (
                  <tr key={emp.empId} className={`group ${isIncrementSoon ? '!bg-amber-50/70 dark:!bg-amber-900/10' : ''}`}>
                    <td>
                      <div className="flex items-center space-x-3">
                        {emp.profilePic ? (
                          <img src={emp.profilePic} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-brand-200 dark:border-brand-800 flex-shrink-0 shadow-sm" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-500 dark:text-brand-400 font-heading font-bold text-sm border-2 border-brand-200 dark:border-brand-800 flex-shrink-0">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-heading font-bold text-slate-800 dark:text-white text-[13px] truncate">{emp.name}</p>
                          <p className="text-[10px] text-brand-600 dark:text-brand-400 font-heading font-semibold">{emp.empId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-600 dark:text-slate-400 font-body">{emp.designation}</td>
                    <td className="text-slate-500 dark:text-slate-400 font-body text-xs max-w-[180px] truncate" title={emp.address}>{emp.address || '-'}</td>
                    <td className="text-slate-500 dark:text-slate-400 font-body">{new Date(emp.joinDate).toLocaleDateString('en-GB')}</td>
                    <td className="text-right font-heading font-extrabold text-slate-800 dark:text-white">Rs. {fmt(emp.wagePerDay)}</td>
                    <td>
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-heading font-extrabold uppercase tracking-wider ${
                        emp.empType === 'Permanent' ? 'bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-900/30 dark:text-brand-400 dark:border-brand-800' :
                        emp.empType === 'Contract' ? 'bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                        'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800'
                      }`}>{emp.empType}</span>
                    </td>
                    <td>
                      {emp.incrementDate ? (
                        <div>
                          <span className={`text-xs font-body ${isIncrementSoon ? 'font-bold text-amber-700 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'}`}>
                            {new Date(emp.incrementDate).toLocaleDateString('en-GB')}
                          </span>
                          {isIncrementSoon && (
                            <span className="ml-1.5 px-1.5 py-0.5 bg-amber-100 dark:bg-amber-800/50 text-amber-700 dark:text-amber-300 rounded text-[8px] font-heading font-extrabold uppercase animate-pulse-dot">
                              Due
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-600 text-xs">-</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="text-right">
                        <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setIsEditing(true); setEmpForm({ ...emp }); setShowForm(true); }}
                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-lg" title="Edit">
                            <Pencil size={14} />
                          </button>
                          <button onClick={() => handleDelete(emp.empId, 'emp')}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg" title="Delete">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  // =============================================
  // LEAVE REGISTER
  // =============================================
  const handleSubmitLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!leaveForm.empId) { alert('Please select an employee.'); return; }
    setSaving(true);
    try {
      if (isEditing) await onUpdateLeave(leaveForm);
      else await onAddLeave(leaveForm);
      setShowForm(false);
      setLeaveForm(emptyLeave(employees));
    } catch (err: any) { alert('Failed to save: ' + (err.message || 'Unknown error')); }
    finally { setSaving(false); }
  };

  const renderLeaveRegister = () => (
    <>
      {showForm && isAdmin && (
        <div className="card-gov p-0 mb-6 animate-slide-down">
          <div className="gov-header-accent h-1.5 rounded-t-xl"></div>
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-heading font-extrabold text-brand-700 dark:text-brand-400 text-sm uppercase tracking-wider">
                {isEditing ? 'Edit Leave Record' : 'New Leave Record'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitLeave} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label-gov">Employee</label>
                <select className="input-gov" value={leaveForm.empId} onChange={e => setLeaveForm({ ...leaveForm, empId: e.target.value })}>
                  {employees.map(emp => <option key={emp.empId} value={emp.empId}>{emp.empId} - {emp.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label-gov">Leave Type</label>
                <select className="input-gov" value={leaveForm.leaveType} onChange={e => setLeaveForm({ ...leaveForm, leaveType: e.target.value })}>
                  {LEAVE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="label-gov">From Date</label>
                <input type="date" className="input-gov" value={leaveForm.fromDate} onChange={e => {
                  const from = e.target.value;
                  setLeaveForm({ ...leaveForm, fromDate: from, days: updateLeaveDays(from, leaveForm.toDate) });
                }} />
              </div>
              <div>
                <label className="label-gov">To Date</label>
                <input type="date" className="input-gov" value={leaveForm.toDate} onChange={e => {
                  const to = e.target.value;
                  setLeaveForm({ ...leaveForm, toDate: to, days: updateLeaveDays(leaveForm.fromDate, to) });
                }} />
              </div>
              <div>
                <label className="label-gov">Days (Auto)</label>
                <input type="number" className="input-gov bg-slate-50 dark:bg-slate-700 font-bold" value={leaveForm.days} readOnly />
              </div>
              <div>
                <label className="label-gov">Status</label>
                <select className="input-gov" value={leaveForm.approved} onChange={e => setLeaveForm({ ...leaveForm, approved: e.target.value })}>
                  {APPROVAL_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-span-full flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setShowForm(false)} className="btn-gov-outline">Discard</button>
                <button type="submit" disabled={saving} className="btn-gov">
                  {saving && <Loader2 className="animate-spin" size={14} />}
                  <span>{isEditing ? 'Save Changes' : 'Submit Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card-gov">
        <table className="table-gov">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>From</th>
              <th>To</th>
              <th className="text-right">Days</th>
              <th className="text-center">Status</th>
              {isAdmin && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {leaveRecords.length === 0 ? (
              <tr><td colSpan={isAdmin ? 7 : 6} className="px-6 py-16 text-center">
                <Ban size={32} className="text-slate-200 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-heading font-bold text-sm">No leave records</p>
              </td></tr>
            ) : (
              [...leaveRecords].sort((a, b) => new Date(b.fromDate).getTime() - new Date(a.fromDate).getTime()).map(record => {
                const emp = employees.find(e => e.empId === record.empId);
                return (
                  <tr key={record.id} className="group">
                    <td>
                      <div className="flex items-center space-x-3">
                        {emp?.profilePic ? (
                          <img src={emp.profilePic} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-600 flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-500 text-[10px] font-heading font-bold border border-brand-200 dark:border-brand-800 flex-shrink-0">
                            {(emp?.name || '?').charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-heading font-bold text-slate-700 dark:text-white text-xs">{emp?.name || '-'}</p>
                          <p className="text-[10px] text-brand-600 dark:text-brand-400 font-heading font-semibold">{record.empId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-slate-600 dark:text-slate-400 font-body">{record.leaveType}</td>
                    <td className="text-slate-500 dark:text-slate-400 font-body">{new Date(record.fromDate).toLocaleDateString('en-GB')}</td>
                    <td className="text-slate-500 dark:text-slate-400 font-body">{new Date(record.toDate).toLocaleDateString('en-GB')}</td>
                    <td className="text-right font-heading font-extrabold text-slate-800 dark:text-white">{record.days}</td>
                    <td className="text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-heading font-extrabold uppercase tracking-wider ${
                        record.approved === 'Approved' ? 'bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-900/30 dark:text-brand-400 dark:border-brand-800' :
                        record.approved === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' :
                        'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                      }`}>{record.approved}</span>
                    </td>
                    {isAdmin && (
                      <td className="text-right">
                        <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setIsEditing(true); setLeaveForm({ ...record }); setShowForm(true); }}
                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-lg"><Pencil size={14} /></button>
                          <button onClick={() => handleDelete(record.id, 'leave')}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  // =============================================
  // OVERTIME - Amount = OT Hours x Rate
  // =============================================
  const handleSubmitOvertime = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!otForm.empId || otForm.otHours <= 0) { alert('Please select an employee and enter valid OT hours.'); return; }
    setSaving(true);
    try {
      const record = { ...otForm, amount: otForm.otHours * otForm.rate };
      if (isEditing) await onUpdateOvertime(record);
      else await onAddOvertime(record);
      setShowForm(false);
      setOtForm(emptyOvertime(employees));
    } catch (err: any) { alert('Failed to save: ' + (err.message || 'Unknown error')); }
    finally { setSaving(false); }
  };

  const renderOvertime = () => (
    <>
      {showForm && isAdmin && (
        <div className="card-gov p-0 mb-6 animate-slide-down">
          <div className="gov-header-accent h-1.5 rounded-t-xl"></div>
          <div className="p-8 space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100 dark:border-slate-700">
              <h3 className="font-heading font-extrabold text-brand-700 dark:text-brand-400 text-sm uppercase tracking-wider">
                {isEditing ? 'Edit Overtime' : 'New Overtime Record'}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmitOvertime} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="label-gov">Date</label>
                <input type="date" className="input-gov" value={otForm.date} onChange={e => setOtForm({ ...otForm, date: e.target.value })} />
              </div>
              <div>
                <label className="label-gov">Employee</label>
                <select className="input-gov" value={otForm.empId} onChange={e => setOtForm({ ...otForm, empId: e.target.value })}>
                  {employees.map(emp => <option key={emp.empId} value={emp.empId}>{emp.empId} - {emp.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label-gov">OT Hours</label>
                <input type="number" step="0.5" min="0" required className="input-gov" value={otForm.otHours || ''} onChange={e => {
                  const hours = Number(e.target.value);
                  setOtForm({ ...otForm, otHours: hours, amount: hours * otForm.rate });
                }} />
              </div>
              <div>
                <label className="label-gov">Rate (LKR/Hr)</label>
                <input type="number" step="0.01" min="0" required className="input-gov" value={otForm.rate || ''} onChange={e => {
                  const rate = Number(e.target.value);
                  setOtForm({ ...otForm, rate, amount: otForm.otHours * rate });
                }} />
              </div>
              <div>
                <label className="label-gov">Amount (Auto: Hours x Rate)</label>
                <input type="number" className="input-gov bg-slate-50 dark:bg-slate-700 font-bold" value={fmt(otForm.otHours * otForm.rate)} readOnly />
              </div>
              <div className="col-span-full flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button type="button" onClick={() => setShowForm(false)} className="btn-gov-outline">Discard</button>
                <button type="submit" disabled={saving} className="btn-gov">
                  {saving && <Loader2 className="animate-spin" size={14} />}
                  <span>{isEditing ? 'Save Changes' : 'Submit Record'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card-gov">
        <table className="table-gov">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th className="text-right">OT Hours</th>
              <th className="text-right">Rate</th>
              <th className="text-right">Amount</th>
              {isAdmin && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {overtimeRecords.length === 0 ? (
              <tr><td colSpan={isAdmin ? 6 : 5} className="px-6 py-16 text-center">
                <Ban size={32} className="text-slate-200 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-heading font-bold text-sm">No overtime records</p>
              </td></tr>
            ) : (
              <>
                {[...overtimeRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => {
                  const emp = employees.find(e => e.empId === record.empId);
                  return (
                    <tr key={record.id} className="group">
                      <td className="text-slate-500 dark:text-slate-400 font-body">{new Date(record.date).toLocaleDateString('en-GB')}</td>
                      <td>
                        <div className="flex items-center space-x-3">
                          {emp?.profilePic ? (
                            <img src={emp.profilePic} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-600 flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-brand-500 text-[10px] font-heading font-bold border border-brand-200 dark:border-brand-800 flex-shrink-0">
                              {(emp?.name || '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-heading font-bold text-slate-700 dark:text-white text-xs">{emp?.name || '-'}</p>
                            <p className="text-[10px] text-brand-600 dark:text-brand-400 font-heading font-semibold">{record.empId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-right text-slate-600 dark:text-slate-300 font-body">{record.otHours}</td>
                      <td className="text-right text-slate-600 dark:text-slate-300 font-body">Rs. {fmt(record.rate)}</td>
                      <td className="text-right font-heading font-extrabold text-slate-800 dark:text-white">Rs. {fmt(record.amount)}</td>
                      {isAdmin && (
                        <td className="text-right">
                          <div className="flex justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => { setIsEditing(true); setOtForm({ ...record }); setShowForm(true); }}
                              className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/30 rounded-lg"><Pencil size={14} /></button>
                            <button onClick={() => handleDelete(record.id, 'ot')}
                              className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {/* Total row */}
                <tr className="!bg-[#003d10] dark:!bg-[#002a0b]">
                  <td className="!py-4" colSpan={4}>
                    <span className="text-[10px] font-heading font-bold text-green-200 uppercase tracking-widest">Total OT Amount</span>
                  </td>
                  <td className="!py-4 text-right text-lg font-heading font-extrabold text-white">Rs. {fmt(overtimeRecords.reduce((sum, r) => sum + r.amount, 0))}</td>
                  {isAdmin && <td className="!py-4"></td>}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </>
  );

  const showAddButton = isAdmin && (activeSubTab === 'Employee Register' || employees.length > 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500 flex items-center justify-center shadow-md shadow-brand-200 dark:shadow-brand-900/30">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-heading font-extrabold text-slate-800 dark:text-white tracking-tight">Human Resource Management</h2>
            <p className="text-[10px] text-slate-400 font-heading font-medium uppercase tracking-wider">Employee Records & Payroll</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {incrementAlerts.length > 0 && activeSubTab !== 'Employee Register' && (
            <button
              onClick={() => { setActiveSubTab('Employee Register'); setShowIncrementAlert(true); }}
              className="flex items-center space-x-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 rounded-full text-amber-700 dark:text-amber-400 text-[10px] font-heading font-bold uppercase tracking-wider animate-pulse-dot"
            >
              <AlertTriangle size={12} />
              <span>{incrementAlerts.length} Increment{incrementAlerts.length > 1 ? 's' : ''} Due</span>
            </button>
          )}
          {showAddButton && (
            <button onClick={handleOpenAdd} className="btn-gov">
              <Plus size={16} />
              <span>Add Entry</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-tab navigation */}
      <div className="flex space-x-1 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        {SUB_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveSubTab(tab); setShowForm(false); }}
            className={`flex-1 px-4 py-2.5 rounded-lg text-[13px] font-heading font-bold transition-all ${
              activeSubTab === tab
                ? 'bg-brand-500 text-white shadow-md shadow-brand-200 dark:shadow-brand-900/30'
                : 'text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeSubTab === 'Employee Register' && renderEmployeeRegister()}
      {activeSubTab === 'Leave Register' && renderLeaveRegister()}
      {activeSubTab === 'Overtime' && renderOvertime()}
    </div>
  );
};

export default HRManagementView;
