
import React, { useState } from 'react';
import {
  FileText, Shield, HardDrive,
  ArrowRight, Upload, Download, AlertTriangle, ShieldCheck, Loader2, Cloud
} from 'lucide-react';
import { FleetState } from '../types';

interface Props {
  data: FleetState;
  onRestore: (data: FleetState) => Promise<void>;
  isAdmin: boolean;
}

const SOPView: React.FC<Props> = ({ data, onRestore, isAdmin }) => {
  const [restoring, setRestoring] = useState(false);

  const handleBackup = () => {
    if (!isAdmin) return;
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `titan_fleet_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) return;
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const content = JSON.parse(event.target?.result as string);
          if (confirm('CRITICAL: Replace entire cloud database with this backup file? This cannot be undone.')) {
            setRestoring(true);
            try {
              await onRestore(content);
              alert('System Restored Successfully.');
            } catch (err: any) {
              alert('Restore failed: ' + (err.message || 'Unknown error'));
            } finally {
              setRestoring(false);
            }
          }
        } catch (err) {
          alert('Invalid Backup File Format.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center">
            <FileText className="mr-2 text-blue-600" size={20} /> System Operating Rules
          </h3>
          <ul className="space-y-4">
            {[
              "INTERNAL ID: Use format TR-xxxx, LR-xxxx, BK-xxxx, GN-xxxx",
              "LEGAL PLATES: Enter exactly as per RMV certificate",
              "COST FIELDS: Never leave blank (Enter 0 for warranty/service contract)",
              "BACKUP POLICY: Weekly full JSON export required every Friday",
              "AUDIT TRAIL: Admin is sole authorized data entry persona"
            ].map((rule, i) => (
              <li key={i} className="flex items-start space-x-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="bg-slate-900 text-white w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">{i+1}</span>
                <span className="text-sm font-bold text-slate-700 leading-tight">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl shadow-slate-200 relative overflow-hidden">
          <ShieldCheck className="absolute -right-8 -bottom-8 text-white/5" size={160} />
          <h3 className="text-xl font-extrabold mb-3 flex items-center relative z-10">
            <Cloud className="mr-2 text-blue-400" size={24} /> Cloud Data Storage
          </h3>
          <p className="text-slate-400 text-sm mb-6 leading-relaxed relative z-10 font-medium">
            Your fleet data is securely stored in the cloud via Supabase. Data persists across browsers, devices, and cache clears. Backups are still recommended for added safety.
          </p>
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 relative z-10">
            <span>Storage: Supabase Cloud</span>
            <span className="text-blue-500">Status: Secure.</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-extrabold text-slate-800 mb-6 flex items-center">
            <HardDrive className="mr-2 text-indigo-600" size={20} /> System Maintenance
          </h3>
          <p className="text-slate-400 text-sm mb-10 font-medium">
            Download a backup copy of your cloud database. Use restore to upload a previous backup into the cloud.
          </p>

          {restoring && (
            <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center space-x-3">
              <Loader2 className="animate-spin text-blue-600" size={20} />
              <p className="text-sm font-bold text-blue-800">Restoring data to cloud database...</p>
            </div>
          )}

          <div className="space-y-4">
            <button
              disabled={!isAdmin}
              onClick={handleBackup}
              className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all group ${isAdmin ? 'bg-indigo-50 border border-indigo-100 hover:bg-indigo-100' : 'bg-slate-50 opacity-50 cursor-not-allowed'}`}
            >
              <div className="flex items-center space-x-4">
                <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100">
                  <Download size={20} />
                </div>
                <div className="text-left">
                  <p className="font-extrabold text-indigo-900 text-sm italic">Generate Backup</p>
                  <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest mt-0.5">Export Full Data (JSON)</p>
                </div>
              </div>
              <ArrowRight className="text-indigo-400 group-hover:translate-x-1 transition-transform" size={20} />
            </button>

            {isAdmin && (
              <div className="relative group">
                <input
                  type="file"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  onChange={handleRestore}
                  accept=".json"
                  disabled={restoring}
                />
                <div className={`flex items-center justify-between p-5 bg-slate-50 border border-slate-100 rounded-2xl group-hover:bg-slate-100 transition-colors ${restoring ? 'opacity-50' : ''}`}>
                  <div className="flex items-center space-x-4">
                    <div className="bg-slate-800 p-2.5 rounded-xl text-white">
                      <Upload size={20} />
                    </div>
                    <div className="text-left">
                      <p className="font-extrabold text-slate-900 text-sm italic">Restore Database</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Upload .json Archive</p>
                    </div>
                  </div>
                  <ArrowRight className="text-slate-300 group-hover:translate-x-1 transition-transform" size={20} />
                </div>
              </div>
            )}
          </div>

          <div className="mt-auto pt-10">
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100 flex space-x-4">
              <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-amber-800 tracking-wider">Security Notice</p>
                <p className="text-xs text-amber-800 leading-relaxed font-bold italic">
                  Backup files contain unencrypted financial and asset records. Secure them in password-protected physical drives.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOPView;
