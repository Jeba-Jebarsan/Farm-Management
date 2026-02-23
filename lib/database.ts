import { supabase } from './supabase';
import {
  FleetState,
  Vehicle,
  FuelLog,
  MaintenanceLog,
  RepairLog,
  InsuranceLog,
  StockItem,
  StockIn,
  StockOut,
  Employee,
  LeaveRecord,
  OvertimeRecord,
  DailyVehicleLog,
  InventoryItem,
  CroppingActivity,
} from '../types';

// ============================================
// Helper: convert camelCase ↔ snake_case
// ============================================

const toSnake = (obj: Record<string, any>): Record<string, any> => {
  const map: Record<string, string> = {
    legalPlateNo: 'legal_plate_no',
    provinceCode: 'province_code',
    makeModel: 'make_model',
    engineNo: 'engine_no',
    chassisNo: 'chassis_no',
    joinedDate: 'joined_date',
    vehicleId: 'vehicle_id',
    nextDueDate: 'next_due_date',
    actionTaken: 'action_taken',
    partsUsed: 'parts_used',
    downtimeDays: 'downtime_days',
    policyNo: 'policy_no',
    startDate: 'start_date',
    endDate: 'end_date',
    itemCode: 'item_code',
    itemName: 'item_name',
    reorderLevel: 'reorder_level',
    unitPrice: 'unit_price',
    openingStock: 'opening_stock',
    grnNo: 'grn_no',
    issuedTo: 'issued_to',
    empId: 'emp_id',
    joinDate: 'join_date',
    wagePerDay: 'wage_per_day',
    empType: 'emp_type',
    incrementDate: 'increment_date',
    profilePic: 'profile_pic',
    leaveType: 'leave_type',
    fromDate: 'from_date',
    toDate: 'to_date',
    otHours: 'ot_hours',
    kmStart: 'km_start',
    kmEnd: 'km_end',
    fuelUsed: 'fuel_used',
    renewalDate: 'renewal_date',
    inventoryNumber: 'inventory_number',
    dateOfPurchase: 'date_of_purchase',
    revaluationRate: 'revaluation_rate',
    assetNumber: 'asset_number',
    itemName: 'item_name',
  };
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[map[key] || key] = value;
  }
  return result;
};

const toCamel = (obj: Record<string, any>): Record<string, any> => {
  const map: Record<string, string> = {
    legal_plate_no: 'legalPlateNo',
    province_code: 'provinceCode',
    make_model: 'makeModel',
    engine_no: 'engineNo',
    chassis_no: 'chassisNo',
    joined_date: 'joinedDate',
    vehicle_id: 'vehicleId',
    next_due_date: 'nextDueDate',
    action_taken: 'actionTaken',
    parts_used: 'partsUsed',
    downtime_days: 'downtimeDays',
    policy_no: 'policyNo',
    start_date: 'startDate',
    end_date: 'endDate',
    item_code: 'itemCode',
    item_name: 'itemName',
    reorder_level: 'reorderLevel',
    unit_price: 'unitPrice',
    opening_stock: 'openingStock',
    grn_no: 'grnNo',
    issued_to: 'issuedTo',
    emp_id: 'empId',
    join_date: 'joinDate',
    wage_per_day: 'wagePerDay',
    emp_type: 'empType',
    increment_date: 'incrementDate',
    profile_pic: 'profilePic',
    leave_type: 'leaveType',
    from_date: 'fromDate',
    to_date: 'toDate',
    ot_hours: 'otHours',
    km_start: 'kmStart',
    km_end: 'kmEnd',
    fuel_used: 'fuelUsed',
    renewal_date: 'renewalDate',
    inventory_number: 'inventoryNumber',
    date_of_purchase: 'dateOfPurchase',
    revaluation_rate: 'revaluationRate',
    asset_number: 'assetNumber',
    item_name: 'itemName',
  };
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[map[key] || key] = value;
  }
  return result;
};

const toCamelArray = <T>(rows: Record<string, any>[]): T[] =>
  rows.map((r) => toCamel(r) as T);

// ============================================
// Fetch all data
// ============================================

export async function fetchAllData(): Promise<FleetState> {
  const [vehicles, fuel, maintenance, repair, insurance] = await Promise.all([
    supabase.from('vehicles').select('*'),
    supabase.from('fuel_logs').select('*'),
    supabase.from('maintenance_logs').select('*'),
    supabase.from('repair_logs').select('*'),
    supabase.from('insurance_logs').select('*'),
  ]);

  if (vehicles.error) throw vehicles.error;
  if (fuel.error) throw fuel.error;
  if (maintenance.error) throw maintenance.error;
  if (repair.error) throw repair.error;
  if (insurance.error) throw insurance.error;

  // Stock & HR tables may not exist yet — query separately and fallback to empty
  const [items, stockIn, stockOut, emps, leaves, overtime, dailyLogs, inventory, cropping] = await Promise.all([
    supabase.from('item_master').select('*'),
    supabase.from('stock_in').select('*'),
    supabase.from('stock_out').select('*'),
    supabase.from('employees').select('*'),
    supabase.from('leave_records').select('*'),
    supabase.from('overtime_records').select('*'),
    supabase.from('daily_vehicle_logs').select('*'),
    supabase.from('inventory_items').select('*'),
    supabase.from('cropping_activities').select('*'),
  ]);

  return {
    vehicles: toCamelArray<Vehicle>(vehicles.data),
    fuelLogs: toCamelArray<FuelLog>(fuel.data),
    maintenanceLogs: toCamelArray<MaintenanceLog>(maintenance.data),
    repairLogs: toCamelArray<RepairLog>(repair.data),
    insuranceLogs: toCamelArray<InsuranceLog>(insurance.data),
    stockItems: items.error ? [] : toCamelArray<StockItem>(items.data),
    stockInRecords: stockIn.error ? [] : toCamelArray<StockIn>(stockIn.data),
    stockOutRecords: stockOut.error ? [] : toCamelArray<StockOut>(stockOut.data),
    employees: emps.error ? [] : toCamelArray<Employee>(emps.data),
    leaveRecords: leaves.error ? [] : toCamelArray<LeaveRecord>(leaves.data),
    overtimeRecords: overtime.error ? [] : toCamelArray<OvertimeRecord>(overtime.data),
    dailyVehicleLogs: dailyLogs.error ? [] : toCamelArray<DailyVehicleLog>(dailyLogs.data),
    inventoryItems: inventory.error ? [] : toCamelArray<InventoryItem>(inventory.data),
    croppingActivities: cropping.error ? [] : toCamelArray<CroppingActivity>(cropping.data),
  };
}

// ============================================
// Vehicles
// ============================================

export async function addVehicle(v: Vehicle) {
  const { error } = await supabase.from('vehicles').insert(toSnake(v));
  if (error) throw error;
}

export async function updateVehicle(v: Vehicle) {
  const { error } = await supabase.from('vehicles').update(toSnake(v)).eq('id', v.id);
  if (error) throw error;
}

export async function deleteVehicle(id: string) {
  const { error } = await supabase.from('vehicles').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Fuel Logs
// ============================================

export async function addFuelLog(l: FuelLog) {
  const { error } = await supabase.from('fuel_logs').insert(toSnake(l));
  if (error) throw error;
}

export async function updateFuelLog(l: FuelLog) {
  const { error } = await supabase.from('fuel_logs').update(toSnake(l)).eq('id', l.id);
  if (error) throw error;
}

export async function deleteFuelLog(id: string) {
  const { error } = await supabase.from('fuel_logs').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Maintenance Logs
// ============================================

export async function addMaintenanceLog(l: MaintenanceLog) {
  const { error } = await supabase.from('maintenance_logs').insert(toSnake(l));
  if (error) throw error;
}

export async function updateMaintenanceLog(l: MaintenanceLog) {
  const { error } = await supabase.from('maintenance_logs').update(toSnake(l)).eq('id', l.id);
  if (error) throw error;
}

export async function deleteMaintenanceLog(id: string) {
  const { error } = await supabase.from('maintenance_logs').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Repair Logs
// ============================================

export async function addRepairLog(l: RepairLog) {
  const { error } = await supabase.from('repair_logs').insert(toSnake(l));
  if (error) throw error;
}

export async function updateRepairLog(l: RepairLog) {
  const { error } = await supabase.from('repair_logs').update(toSnake(l)).eq('id', l.id);
  if (error) throw error;
}

export async function deleteRepairLog(id: string) {
  const { error } = await supabase.from('repair_logs').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Insurance Logs
// ============================================

export async function addInsuranceLog(l: InsuranceLog) {
  const { error } = await supabase.from('insurance_logs').insert(toSnake(l));
  if (error) throw error;
}

export async function updateInsuranceLog(l: InsuranceLog) {
  const { error } = await supabase.from('insurance_logs').update(toSnake(l)).eq('id', l.id);
  if (error) throw error;
}

export async function deleteInsuranceLog(id: string) {
  const { error } = await supabase.from('insurance_logs').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Stock Items (Item Master)
// ============================================

export async function addStockItem(item: StockItem) {
  const { error } = await supabase.from('item_master').insert(toSnake(item));
  if (error) throw error;
}

export async function updateStockItem(item: StockItem) {
  const { error } = await supabase.from('item_master').update(toSnake(item)).eq('item_code', item.itemCode);
  if (error) throw error;
}

export async function deleteStockItem(itemCode: string) {
  const { error } = await supabase.from('item_master').delete().eq('item_code', itemCode);
  if (error) throw error;
}

// ============================================
// Stock In
// ============================================

export async function addStockIn(record: StockIn) {
  const { error } = await supabase.from('stock_in').insert(toSnake(record));
  if (error) throw error;
}

export async function updateStockIn(record: StockIn) {
  const { error } = await supabase.from('stock_in').update(toSnake(record)).eq('id', record.id);
  if (error) throw error;
}

export async function deleteStockIn(id: string) {
  const { error } = await supabase.from('stock_in').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Stock Out
// ============================================

export async function addStockOut(record: StockOut) {
  const { error } = await supabase.from('stock_out').insert(toSnake(record));
  if (error) throw error;
}

export async function updateStockOut(record: StockOut) {
  const { error } = await supabase.from('stock_out').update(toSnake(record)).eq('id', record.id);
  if (error) throw error;
}

export async function deleteStockOut(id: string) {
  const { error } = await supabase.from('stock_out').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Employees
// ============================================

export async function addEmployee(emp: Employee) {
  const { error } = await supabase.from('employees').insert(toSnake(emp));
  if (error) throw error;
}

export async function updateEmployee(emp: Employee) {
  const { error } = await supabase.from('employees').update(toSnake(emp)).eq('emp_id', emp.empId);
  if (error) throw error;
}

export async function deleteEmployee(empId: string) {
  const { error } = await supabase.from('employees').delete().eq('emp_id', empId);
  if (error) throw error;
}

// ============================================
// Leave Records
// ============================================

export async function addLeaveRecord(record: LeaveRecord) {
  const { error } = await supabase.from('leave_records').insert(toSnake(record));
  if (error) throw error;
}

export async function updateLeaveRecord(record: LeaveRecord) {
  const { error } = await supabase.from('leave_records').update(toSnake(record)).eq('id', record.id);
  if (error) throw error;
}

export async function deleteLeaveRecord(id: string) {
  const { error } = await supabase.from('leave_records').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Overtime Records
// ============================================

export async function addOvertimeRecord(record: OvertimeRecord) {
  const { error } = await supabase.from('overtime_records').insert(toSnake(record));
  if (error) throw error;
}

export async function updateOvertimeRecord(record: OvertimeRecord) {
  const { error } = await supabase.from('overtime_records').update(toSnake(record)).eq('id', record.id);
  if (error) throw error;
}

export async function deleteOvertimeRecord(id: string) {
  const { error } = await supabase.from('overtime_records').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Daily Vehicle Logs
// ============================================

export async function addDailyVehicleLog(l: DailyVehicleLog) {
  const { error } = await supabase.from('daily_vehicle_logs').insert(toSnake(l));
  if (error) throw error;
}

export async function updateDailyVehicleLog(l: DailyVehicleLog) {
  const { error } = await supabase.from('daily_vehicle_logs').update(toSnake(l)).eq('id', l.id);
  if (error) throw error;
}

export async function deleteDailyVehicleLog(id: string) {
  const { error } = await supabase.from('daily_vehicle_logs').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Inventory Items
// ============================================

export async function addInventoryItem(item: InventoryItem) {
  const { error } = await supabase.from('inventory_items').insert(toSnake(item));
  if (error) throw error;
}

export async function updateInventoryItem(item: InventoryItem) {
  const { error } = await supabase.from('inventory_items').update(toSnake(item)).eq('id', item.id);
  if (error) throw error;
}

export async function deleteInventoryItem(id: string) {
  const { error } = await supabase.from('inventory_items').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Cropping Activities
// ============================================

export async function addCroppingActivity(activity: CroppingActivity) {
  const { error } = await supabase.from('cropping_activities').insert(toSnake(activity));
  if (error) throw error;
}

export async function updateCroppingActivity(activity: CroppingActivity) {
  const { error } = await supabase.from('cropping_activities').update(toSnake(activity)).eq('id', activity.id);
  if (error) throw error;
}

export async function deleteCroppingActivity(id: string) {
  const { error } = await supabase.from('cropping_activities').delete().eq('id', id);
  if (error) throw error;
}

// ============================================
// Bulk upsert (for restore from backup)
// ============================================

export async function restoreAllData(data: FleetState): Promise<void> {
  // Delete all existing data first (order matters due to foreign keys)
  await supabase.from('cropping_activities').delete().neq('id', '');
  await supabase.from('inventory_items').delete().neq('id', '');
  await supabase.from('daily_vehicle_logs').delete().neq('id', '');
  await supabase.from('overtime_records').delete().neq('id', '');
  await supabase.from('leave_records').delete().neq('id', '');
  await supabase.from('employees').delete().neq('emp_id', '');
  await supabase.from('stock_in').delete().neq('id', '');
  await supabase.from('stock_out').delete().neq('id', '');
  await supabase.from('item_master').delete().neq('item_code', '');
  await supabase.from('fuel_logs').delete().neq('id', '');
  await supabase.from('maintenance_logs').delete().neq('id', '');
  await supabase.from('repair_logs').delete().neq('id', '');
  await supabase.from('insurance_logs').delete().neq('id', '');
  await supabase.from('vehicles').delete().neq('id', '');

  // Insert all data (order matters: vehicles and item_master first)
  if (data.vehicles.length > 0) {
    const { error } = await supabase.from('vehicles').insert(data.vehicles.map(toSnake));
    if (error) throw error;
  }
  if (data.fuelLogs.length > 0) {
    const { error } = await supabase.from('fuel_logs').insert(data.fuelLogs.map(toSnake));
    if (error) throw error;
  }
  if (data.maintenanceLogs.length > 0) {
    const { error } = await supabase.from('maintenance_logs').insert(data.maintenanceLogs.map(toSnake));
    if (error) throw error;
  }
  if (data.repairLogs.length > 0) {
    const { error } = await supabase.from('repair_logs').insert(data.repairLogs.map(toSnake));
    if (error) throw error;
  }
  if (data.insuranceLogs.length > 0) {
    const { error } = await supabase.from('insurance_logs').insert(data.insuranceLogs.map(toSnake));
    if (error) throw error;
  }
  if (data.stockItems && data.stockItems.length > 0) {
    const { error } = await supabase.from('item_master').insert(data.stockItems.map(toSnake));
    if (error) throw error;
  }
  if (data.stockInRecords && data.stockInRecords.length > 0) {
    const { error } = await supabase.from('stock_in').insert(data.stockInRecords.map(toSnake));
    if (error) throw error;
  }
  if (data.stockOutRecords && data.stockOutRecords.length > 0) {
    const { error } = await supabase.from('stock_out').insert(data.stockOutRecords.map(toSnake));
    if (error) throw error;
  }
  if (data.employees && data.employees.length > 0) {
    const { error } = await supabase.from('employees').insert(data.employees.map(toSnake));
    if (error) throw error;
  }
  if (data.leaveRecords && data.leaveRecords.length > 0) {
    const { error } = await supabase.from('leave_records').insert(data.leaveRecords.map(toSnake));
    if (error) throw error;
  }
  if (data.overtimeRecords && data.overtimeRecords.length > 0) {
    const { error } = await supabase.from('overtime_records').insert(data.overtimeRecords.map(toSnake));
    if (error) throw error;
  }
  if (data.dailyVehicleLogs && data.dailyVehicleLogs.length > 0) {
    const { error } = await supabase.from('daily_vehicle_logs').insert(data.dailyVehicleLogs.map(toSnake));
    if (error) throw error;
  }
  if (data.inventoryItems && data.inventoryItems.length > 0) {
    const { error } = await supabase.from('inventory_items').insert(data.inventoryItems.map(toSnake));
    if (error) throw error;
  }
  if (data.croppingActivities && data.croppingActivities.length > 0) {
    const { error } = await supabase.from('cropping_activities').insert(data.croppingActivities.map(toSnake));
    if (error) throw error;
  }
}
