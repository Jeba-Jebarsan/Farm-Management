
import { FleetState } from './types';

export const INITIAL_STATE: FleetState = {
  vehicles: [],
  fuelLogs: [],
  maintenanceLogs: [],
  repairLogs: [],
  insuranceLogs: [],
  stockItems: [],
  stockInRecords: [],
  stockOutRecords: [],
  employees: [],
  leaveRecords: [],
  overtimeRecords: [],
  dailyVehicleLogs: [],
  inventoryItems: [],
  croppingActivities: []
};

export const NAVIGATION_ITEMS = [
  { label: 'Dashboard', icon: 'LayoutDashboard' },
  { label: 'HR Management', icon: 'Users' },
  { label: 'Store & Stock', icon: 'Package' },
  { label: 'Vehicle Maint.', icon: 'Truck' },
  { label: 'Cropping Calendar', icon: 'Calendar' },
  { label: 'Inventory', icon: 'Archive' },
  { label: 'Alerts', icon: 'Bell' },
  { label: 'Reports', icon: 'BarChart3' },
  { label: 'SOP & Backups', icon: 'ClipboardCheck' }
];

export const SRI_LANKA_PROVINCES = [
  { code: 'WP', name: 'Western Province' },
  { code: 'CP', name: 'Central Province' },
  { code: 'SP', name: 'Southern Province' },
  { code: 'NW', name: 'North Western' },
  { code: 'NC', name: 'North Central' },
  { code: 'UVA', name: 'Uva' },
  { code: 'SAB', name: 'Sabaragamuwa' },
  { code: 'NP', name: 'Northern Province' },
  { code: 'EP', name: 'Eastern Province' },
];
