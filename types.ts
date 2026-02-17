
export enum VehicleType {
  TRACTOR = 'Tractor',
  LORRY = 'Lorry',
  BIKE = 'Bike',
  GENERATOR = 'Generator',
  OTHER = 'Other'
}

export enum VehicleStatus {
  ACTIVE = 'Active',
  UNDER_REPAIR = 'Under Repair',
  OUT_OF_SERVICE = 'Out of Service'
}

export type ProvinceCode = 'WP' | 'CP' | 'SP' | 'NW' | 'NC' | 'UVA' | 'SAB' | 'NP' | 'EP';

export interface Vehicle {
  id: string; // Internal ID: e.g. TR-0001
  legalPlateNo: string; // Official Plate
  provinceCode: ProvinceCode;
  type: VehicleType;
  makeModel: string;
  year: string;
  engineNo: string;
  chassisNo: string;
  status: VehicleStatus;
  joinedDate: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  legalPlateNo: string;
  date: string;
  quantity: number;
  cost: number;
  mileage: number;
  supplier: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  date: string;
  type: string;
  odometer: number;
  description: string;
  cost: number;
  nextDueDate: string;
}

export interface RepairLog {
  id: string;
  vehicleId: string;
  date: string;
  issue: string;
  actionTaken: string;
  partsUsed: string;
  cost: number;
  downtimeDays: number;
}

export interface InsuranceLog {
  id: string;
  vehicleId: string;
  legalPlateNo: string;
  policyNo: string;
  startDate: string;
  endDate: string;
  company: string;
  premium: number;
}

export interface StockItem {
  itemCode: string;
  itemName: string;
  category: string;
  unit: string;
  reorderLevel: number;
  unitPrice: number;
  openingStock: number;
}

export interface StockIn {
  id: string;
  date: string;
  itemCode: string;
  qty: number;
  supplier: string;
  grnNo: string;
}

export interface StockOut {
  id: string;
  date: string;
  itemCode: string;
  qty: number;
  issuedTo: string;
  purpose: string;
}

export interface Employee {
  empId: string;
  name: string;
  designation: string;
  address: string;
  joinDate: string;
  wagePerDay: number;
  empType: string;
  incrementDate: string;
  profilePic: string;
}

export interface LeaveRecord {
  id: string;
  empId: string;
  leaveType: string;
  fromDate: string;
  toDate: string;
  days: number;
  approved: string;
}

export interface OvertimeRecord {
  id: string;
  date: string;
  empId: string;
  otHours: number;
  rate: number;
  amount: number;
}

export interface DailyVehicleLog {
  id: string;
  date: string;
  vehicleId: string;
  driver: string;
  purpose: string;
  kmStart: number;
  kmEnd: number;
  distance: number;
  fuelUsed: number;
  remarks: string;
}

export type Role = 'ADMIN' | 'STAFF';

export interface FleetState {
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  maintenanceLogs: MaintenanceLog[];
  repairLogs: RepairLog[];
  insuranceLogs: InsuranceLog[];
  stockItems: StockItem[];
  stockInRecords: StockIn[];
  stockOutRecords: StockOut[];
  employees: Employee[];
  leaveRecords: LeaveRecord[];
  overtimeRecords: OvertimeRecord[];
  dailyVehicleLogs: DailyVehicleLog[];
}
