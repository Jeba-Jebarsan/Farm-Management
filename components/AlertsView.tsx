
import React, { useMemo } from 'react';
import {
  AlertTriangle, Clock, ShieldAlert, Wrench,
  CalendarClock, CheckCircle2, Bell
} from 'lucide-react';
import { FleetState } from '../types';

export interface Alert {
  id: string;
  type: 'overdue_service' | 'upcoming_service' | 'expired_insurance' | 'expiring_insurance';
  severity: 'critical' | 'warning' | 'info';
  vehicleId: string;
  title: string;
  description: string;
  date: string;
}

interface Props {
  data: FleetState;
  setActiveTab: (tab: string) => void;
}

export function getAlerts(data: FleetState): Alert[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const alerts: Alert[] = [];

  // Check maintenance logs for overdue/upcoming service
  const vehicleLatestMaint: Record<string, { nextDueDate: string; description: string }> = {};
  data.maintenanceLogs.forEach(log => {
    if (log.nextDueDate) {
      const existing = vehicleLatestMaint[log.vehicleId];
      if (!existing || new Date(log.date) > new Date(existing.nextDueDate)) {
        vehicleLatestMaint[log.vehicleId] = { nextDueDate: log.nextDueDate, description: log.description };
      }
    }
  });

  Object.entries(vehicleLatestMaint).forEach(([vehicleId, info]) => {
    const dueDate = new Date(info.nextDueDate);
    dueDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const vehicle = data.vehicles.find(v => v.id === vehicleId);
    const vLabel = vehicle ? `${vehicleId} (${vehicle.makeModel})` : vehicleId;

    if (daysUntil < 0) {
      alerts.push({
        id: `maint-overdue-${vehicleId}`,
        type: 'overdue_service',
        severity: 'critical',
        vehicleId,
        title: `Service Overdue - ${vLabel}`,
        description: `Service was due on ${new Date(info.nextDueDate).toLocaleDateString('en-GB')} (${Math.abs(daysUntil)} days ago). Last service: ${info.description}`,
        date: info.nextDueDate
      });
    } else if (daysUntil <= 14) {
      alerts.push({
        id: `maint-upcoming-${vehicleId}`,
        type: 'upcoming_service',
        severity: 'warning',
        vehicleId,
        title: `Service Due Soon - ${vLabel}`,
        description: `Next service due on ${new Date(info.nextDueDate).toLocaleDateString('en-GB')} (${daysUntil} days remaining). Last service: ${info.description}`,
        date: info.nextDueDate
      });
    }
  });

  // Check insurance logs for expired/expiring
  const vehicleLatestInsurance: Record<string, { endDate: string; company: string; policyNo: string }> = {};
  data.insuranceLogs.forEach(log => {
    const existing = vehicleLatestInsurance[log.vehicleId];
    if (!existing || new Date(log.endDate) > new Date(existing.endDate)) {
      vehicleLatestInsurance[log.vehicleId] = { endDate: log.endDate, company: log.company, policyNo: log.policyNo };
    }
  });

  Object.entries(vehicleLatestInsurance).forEach(([vehicleId, info]) => {
    const endDate = new Date(info.endDate);
    endDate.setHours(0, 0, 0, 0);
    const daysUntil = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const vehicle = data.vehicles.find(v => v.id === vehicleId);
    const vLabel = vehicle ? `${vehicleId} (${vehicle.makeModel})` : vehicleId;

    if (daysUntil < 0) {
      alerts.push({
        id: `ins-expired-${vehicleId}`,
        type: 'expired_insurance',
        severity: 'critical',
        vehicleId,
        title: `Insurance Expired - ${vLabel}`,
        description: `Policy ${info.policyNo} (${info.company}) expired on ${new Date(info.endDate).toLocaleDateString('en-GB')} (${Math.abs(daysUntil)} days ago)`,
        date: info.endDate
      });
    } else if (daysUntil <= 30) {
      alerts.push({
        id: `ins-expiring-${vehicleId}`,
        type: 'expiring_insurance',
        severity: 'warning',
        vehicleId,
        title: `Insurance Expiring Soon - ${vLabel}`,
        description: `Policy ${info.policyNo} (${info.company}) expires on ${new Date(info.endDate).toLocaleDateString('en-GB')} (${daysUntil} days remaining)`,
        date: info.endDate
      });
    }
  });

  // Sort: critical first, then by date
  alerts.sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (b.severity === 'critical' && a.severity !== 'critical') return 1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return alerts;
}

const AlertsView: React.FC<Props> = ({ data, setActiveTab }) => {
  const alerts = useMemo(() => getAlerts(data), [data]);

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'overdue_service': return <Wrench size={18} />;
      case 'upcoming_service': return <CalendarClock size={18} />;
      case 'expired_insurance': return <ShieldAlert size={18} />;
      case 'expiring_insurance': return <Clock size={18} />;
    }
  };

  const getAlertStyle = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical': return {
        bg: 'bg-red-50',
        border: 'border-red-200',
        icon: 'bg-red-100 text-red-600',
        title: 'text-red-800',
        desc: 'text-red-600',
        badge: 'bg-red-100 text-red-700 border-red-200'
      };
      case 'warning': return {
        bg: 'bg-amber-50',
        border: 'border-amber-200',
        icon: 'bg-amber-100 text-amber-600',
        title: 'text-amber-800',
        desc: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700 border-amber-200'
      };
      default: return {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        icon: 'bg-blue-100 text-blue-600',
        title: 'text-blue-800',
        desc: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700 border-blue-200'
      };
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-slate-500 text-sm font-medium mb-1">Total Alerts</p>
            <h3 className="text-3xl font-bold text-slate-800">{alerts.length}</h3>
            <p className="text-xs text-slate-400 mt-2 font-medium">Active notifications</p>
          </div>
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <Bell size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-red-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-red-500 text-sm font-medium mb-1">Critical</p>
            <h3 className="text-3xl font-bold text-red-700">{criticalCount}</h3>
            <p className="text-xs text-red-400 mt-2 font-medium">Overdue / Expired</p>
          </div>
          <div className="bg-red-50 p-3 rounded-xl text-red-600">
            <AlertTriangle size={24} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-amber-100 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-amber-500 text-sm font-medium mb-1">Warnings</p>
            <h3 className="text-3xl font-bold text-amber-700">{warningCount}</h3>
            <p className="text-xs text-amber-400 mt-2 font-medium">Due soon / Expiring</p>
          </div>
          <div className="bg-amber-50 p-3 rounded-xl text-amber-600">
            <Clock size={24} />
          </div>
        </div>
      </div>

      {/* Alert List */}
      {alerts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
          <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="text-green-500" size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">All Clear</h3>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            No pending alerts. All vehicles have up-to-date services and valid insurance policies.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-widest">
            Active Alerts ({alerts.length})
          </h3>
          {alerts.map(alert => {
            const style = getAlertStyle(alert.severity);
            return (
              <div
                key={alert.id}
                className={`${style.bg} border ${style.border} rounded-2xl p-5 flex items-start space-x-4 transition-all hover:shadow-md`}
              >
                <div className={`${style.icon} p-2.5 rounded-xl flex-shrink-0`}>
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className={`font-bold text-sm ${style.title}`}>{alert.title}</h4>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${style.badge}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className={`text-xs ${style.desc} leading-relaxed`}>{alert.description}</p>
                </div>
                <button
                  onClick={() => setActiveTab(alert.type.includes('insurance') ? 'Insurance' : 'Maintenance')}
                  className={`text-xs font-bold ${style.title} hover:underline flex-shrink-0 mt-1`}
                >
                  View &rarr;
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white flex items-start space-x-4">
        <div className="bg-blue-500 p-2 rounded-lg flex-shrink-0">
          <Bell size={18} />
        </div>
        <div>
          <h4 className="font-bold text-sm mb-1">How Alerts Work</h4>
          <ul className="text-xs text-slate-400 space-y-1 leading-relaxed">
            <li>Service alerts trigger when a maintenance <b className="text-slate-300">Next Due Date</b> is within 14 days or overdue.</li>
            <li>Insurance alerts trigger when a policy <b className="text-slate-300">End Date</b> is within 30 days or expired.</li>
            <li>Alerts update automatically based on your log entries - no manual setup needed.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AlertsView;
