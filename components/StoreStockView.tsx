
import React, { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, Ban, X, Loader2, Package } from 'lucide-react';
import { StockItem, StockIn, StockOut } from '../types';

interface Props {
  stockItems: StockItem[];
  stockInRecords: StockIn[];
  stockOutRecords: StockOut[];
  onAddItem: (item: StockItem) => Promise<void>;
  onUpdateItem: (item: StockItem) => Promise<void>;
  onDeleteItem: (itemCode: string) => Promise<void>;
  onAddStockIn: (record: StockIn) => Promise<void>;
  onUpdateStockIn: (record: StockIn) => Promise<void>;
  onDeleteStockIn: (id: string) => Promise<void>;
  onAddStockOut: (record: StockOut) => Promise<void>;
  onUpdateStockOut: (record: StockOut) => Promise<void>;
  onDeleteStockOut: (id: string) => Promise<void>;
  isAdmin: boolean;
}

const CATEGORY_SUGGESTIONS = ['Stationery', 'Lubricants', 'Filters', 'Tyres', 'Spares', 'Cleaning', 'Safety', 'Other'];
const UNITS = ['Nos', 'Ream', 'Roll', 'Box', 'Bottle', 'Litres', 'Kg', 'Set', 'm'];
const SUB_TABS = ['Item Master', 'Stock In', 'Stock Out', 'Stock Balance'] as const;
type SubTab = typeof SUB_TABS[number];

const fmt = (n: number) => n.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const emptyItem = (): StockItem => ({
  itemCode: '',
  itemName: '',
  category: 'Other',
  unit: 'Nos',
  reorderLevel: 0,
  unitPrice: 0,
  openingStock: 0,
});

const emptyStockIn = (items: StockItem[]): StockIn => ({
  id: Math.random().toString(36).substr(2, 9),
  date: new Date().toISOString().split('T')[0],
  itemCode: items[0]?.itemCode || '',
  qty: 0,
  supplier: '',
  grnNo: '',
});

const emptyStockOut = (items: StockItem[]): StockOut => ({
  id: Math.random().toString(36).substr(2, 9),
  date: new Date().toISOString().split('T')[0],
  itemCode: items[0]?.itemCode || '',
  qty: 0,
  issuedTo: '',
  purpose: '',
});

const StoreStockView: React.FC<Props> = ({
  stockItems, stockInRecords, stockOutRecords,
  onAddItem, onUpdateItem, onDeleteItem,
  onAddStockIn, onUpdateStockIn, onDeleteStockIn,
  onAddStockOut, onUpdateStockOut, onDeleteStockOut,
  isAdmin
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('Item Master');
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [itemForm, setItemForm] = useState<StockItem>(emptyItem());
  const [stockInForm, setStockInForm] = useState<StockIn>(emptyStockIn(stockItems));
  const [stockOutForm, setStockOutForm] = useState<StockOut>(emptyStockOut(stockItems));

  // =============================================
  // STOCK BALANCE FORMULAS (matching spreadsheet)
  // =============================================
  // Balance Stock  = Opening Stock + Total In - Total Out
  // Value          = Unit Price × Balance Stock
  // Status         = "Place Order" if Balance Stock < Min Stock To be Kept
  const stockBalance = useMemo(() => {
    const rows = stockItems.map(item => {
      const totalIn = stockInRecords
        .filter(r => r.itemCode === item.itemCode)
        .reduce((sum, r) => sum + r.qty, 0);
      const totalOut = stockOutRecords
        .filter(r => r.itemCode === item.itemCode)
        .reduce((sum, r) => sum + r.qty, 0);
      const balance = item.openingStock + totalIn - totalOut;
      const value = item.unitPrice * balance;
      return {
        ...item,
        totalIn,
        totalOut,
        balance,
        value,
        status: balance < item.reorderLevel ? 'Place Order' : 'OK',
      };
    });
    const totalValue = rows.reduce((sum, r) => sum + r.value, 0);
    return { rows, totalValue };
  }, [stockItems, stockInRecords, stockOutRecords]);

  const handleOpenAdd = () => {
    setIsEditing(false);
    if (activeSubTab === 'Item Master') setItemForm(emptyItem());
    else if (activeSubTab === 'Stock In') setStockInForm(emptyStockIn(stockItems));
    else if (activeSubTab === 'Stock Out') setStockOutForm(emptyStockOut(stockItems));
    setShowForm(true);
  };

  const handleOpenEditItem = (item: StockItem) => {
    setIsEditing(true);
    setItemForm({ ...item });
    setShowForm(true);
  };

  const handleOpenEditStockIn = (record: StockIn) => {
    setIsEditing(true);
    setStockInForm({ ...record });
    setShowForm(true);
  };

  const handleOpenEditStockOut = (record: StockOut) => {
    setIsEditing(true);
    setStockOutForm({ ...record });
    setShowForm(true);
  };

  const handleDelete = async (id: string, type: 'item' | 'in' | 'out') => {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      try {
        if (type === 'item') await onDeleteItem(id);
        else if (type === 'in') await onDeleteStockIn(id);
        else await onDeleteStockOut(id);
      } catch (err: any) {
        alert('Failed to delete: ' + (err.message || 'Unknown error'));
      }
    }
  };

  const handleSubmitItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!itemForm.itemCode.trim() || !itemForm.itemName.trim()) {
      alert('Item Code and Item Name are required.');
      return;
    }
    setSaving(true);
    try {
      if (isEditing) {
        await onUpdateItem(itemForm);
      } else {
        if (stockItems.some(i => i.itemCode === itemForm.itemCode)) {
          alert('Item Code already exists.');
          setSaving(false);
          return;
        }
        await onAddItem(itemForm);
      }
      setShowForm(false);
      setItemForm(emptyItem());
    } catch (err: any) {
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitStockIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!stockInForm.itemCode || stockInForm.qty <= 0) {
      alert('Please select an item and enter a valid quantity.');
      return;
    }
    setSaving(true);
    try {
      if (isEditing) {
        await onUpdateStockIn(stockInForm);
      } else {
        await onAddStockIn(stockInForm);
      }
      setShowForm(false);
      setStockInForm(emptyStockIn(stockItems));
    } catch (err: any) {
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitStockOut = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!stockOutForm.itemCode || stockOutForm.qty <= 0) {
      alert('Please select an item and enter a valid quantity.');
      return;
    }
    setSaving(true);
    try {
      if (isEditing) {
        await onUpdateStockOut(stockOutForm);
      } else {
        await onAddStockOut(stockOutForm);
      }
      setShowForm(false);
      setStockOutForm(emptyStockOut(stockItems));
    } catch (err: any) {
      alert('Failed to save: ' + (err.message || 'Unknown error'));
    } finally {
      setSaving(false);
    }
  };

  // =============================================
  // ITEM MASTER TAB
  // =============================================
  const renderItemMaster = () => (
    <>
      {showForm && isAdmin && (
        <div className="bg-white p-4 md:p-8 rounded-3xl border-2 border-blue-50 shadow-xl space-y-6 md:space-y-8 animate-fade-in">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              {isEditing ? 'Edit Item' : 'New Item'}
            </p>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmitItem} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">SB Page No / Item Code</label>
              <input
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
                placeholder="e.g. STR/02/1"
                value={itemForm.itemCode}
                onChange={e => setItemForm({ ...itemForm, itemCode: e.target.value })}
                disabled={isEditing}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Product Name</label>
              <input
                required
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
                placeholder="e.g. A4 80 GSM"
                value={itemForm.itemName}
                onChange={e => setItemForm({ ...itemForm, itemName: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Category</label>
              <input
                list="category-suggestions"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Type or select category"
                value={itemForm.category}
                onChange={e => setItemForm({ ...itemForm, category: e.target.value })}
              />
              <datalist id="category-suggestions">
                {CATEGORY_SUGGESTIONS.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Unit</label>
              <select
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={itemForm.unit}
                onChange={e => setItemForm({ ...itemForm, unit: e.target.value })}
              >
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Opening Stock</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
                value={itemForm.openingStock || ''}
                onChange={e => setItemForm({ ...itemForm, openingStock: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Unit Price (LKR)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
                value={itemForm.unitPrice || ''}
                onChange={e => setItemForm({ ...itemForm, unitPrice: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Min Stock To Be Kept</label>
              <input
                type="number"
                min="0"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl"
                value={itemForm.reorderLevel || ''}
                onChange={e => setItemForm({ ...itemForm, reorderLevel: Number(e.target.value) })}
              />
            </div>
            <div className="col-span-full flex justify-end space-x-4 pt-4 border-t border-slate-50">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">Discard</button>
              <button type="submit" disabled={saving} className={`px-10 py-3 text-white rounded-2xl font-extrabold shadow-xl shadow-blue-200 flex items-center space-x-2 ${saving ? 'bg-slate-300' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {saving && <Loader2 className="animate-spin" size={16} />}
                <span>{isEditing ? 'Save Changes' : 'Add Item'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-3 md:px-6 py-3 md:py-4">SB Page No</th>
              <th className="px-3 md:px-6 py-3 md:py-4">Product Name</th>
              <th className="px-3 md:px-6 py-3 md:py-4">Category</th>
              <th className="px-3 md:px-6 py-3 md:py-4">Unit</th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-right">Opening Stock</th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-right">Unit Price</th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-right">Min Stock</th>
              {isAdmin && <th className="px-3 md:px-6 py-3 md:py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {stockItems.length === 0 ? (
              <tr><td colSpan={isAdmin ? 8 : 7} className="px-3 md:px-6 py-16 text-center">
                <div className="flex flex-col items-center">
                  <Ban size={32} className="text-slate-200 mb-3" />
                  <p className="text-slate-400 font-bold tracking-tight italic">No items registered.</p>
                </div>
              </td></tr>
            ) : (
              stockItems.map(item => (
                <tr key={item.itemCode} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-3 md:px-6 py-3 md:py-4">
                    <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{item.itemCode}</span>
                  </td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-slate-700">{item.itemName}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-slate-500">{item.category}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-slate-500">{item.unit}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-right font-bold text-slate-800">{item.openingStock}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-right text-slate-600">Rs. {fmt(item.unitPrice)}</td>
                  <td className="px-3 md:px-6 py-3 md:py-4 text-right text-slate-500">{item.reorderLevel}</td>
                  {isAdmin && (
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                      <div className="flex justify-end space-x-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEditItem(item)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => handleDelete(item.itemCode, 'item')} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Delete">
                          <Trash2 size={15} />
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
    </>
  );

  // =============================================
  // STOCK IN TAB
  // =============================================
  const renderStockIn = () => (
    <>
      {showForm && isAdmin && (
        <div className="bg-white p-4 md:p-8 rounded-3xl border-2 border-blue-50 shadow-xl space-y-6 md:space-y-8 animate-fade-in">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              {isEditing ? 'Edit Stock In' : 'New Stock In'}
            </p>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmitStockIn} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Date</label>
              <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" value={stockInForm.date} onChange={e => setStockInForm({ ...stockInForm, date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Product</label>
              <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" value={stockInForm.itemCode} onChange={e => setStockInForm({ ...stockInForm, itemCode: e.target.value })}>
                {stockItems.map(i => <option key={i.itemCode} value={i.itemCode}>{i.itemCode} - {i.itemName}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Quantity</label>
              <input type="number" step="0.01" min="0" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" value={stockInForm.qty || ''} onChange={e => setStockInForm({ ...stockInForm, qty: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Supplier</label>
              <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" placeholder="Supplier name" value={stockInForm.supplier} onChange={e => setStockInForm({ ...stockInForm, supplier: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">GRN No</label>
              <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" placeholder="Goods Receipt Note No." value={stockInForm.grnNo} onChange={e => setStockInForm({ ...stockInForm, grnNo: e.target.value })} />
            </div>
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
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-3 md:px-6 py-3 md:py-4">Date</th>
              <th className="px-3 md:px-6 py-3 md:py-4">SB Page No</th>
              <th className="px-3 md:px-6 py-3 md:py-4">Product Name</th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-right">Qty</th>
              <th className="px-3 md:px-6 py-3 md:py-4">Supplier</th>
              <th className="px-3 md:px-6 py-3 md:py-4">GRN No</th>
              {isAdmin && <th className="px-3 md:px-6 py-3 md:py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {stockInRecords.length === 0 ? (
              <tr><td colSpan={isAdmin ? 7 : 6} className="px-3 md:px-6 py-16 text-center">
                <div className="flex flex-col items-center">
                  <Ban size={32} className="text-slate-200 mb-3" />
                  <p className="text-slate-400 font-bold tracking-tight italic">No stock-in records.</p>
                </div>
              </td></tr>
            ) : (
              [...stockInRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => {
                const item = stockItems.find(i => i.itemCode === record.itemCode);
                return (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-3 md:px-6 py-3 md:py-4 text-slate-500">{new Date(record.date).toLocaleDateString('en-GB')}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{record.itemCode}</span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-slate-700">{item?.itemName || '-'}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right font-extrabold text-slate-800">{record.qty}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-slate-500">{record.supplier}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-slate-500">{record.grnNo}</td>
                    {isAdmin && (
                      <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                        <div className="flex justify-end space-x-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEditStockIn(record)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(record.id, 'in')} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Delete">
                            <Trash2 size={15} />
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
      </div>
    </>
  );

  // =============================================
  // STOCK OUT TAB
  // =============================================
  const renderStockOut = () => (
    <>
      {showForm && isAdmin && (
        <div className="bg-white p-4 md:p-8 rounded-3xl border-2 border-blue-50 shadow-xl space-y-6 md:space-y-8 animate-fade-in">
          <div className="border-b border-slate-100 pb-4 flex justify-between items-center">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
              {isEditing ? 'Edit Stock Out' : 'New Stock Out'}
            </p>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
              <X size={18} />
            </button>
          </div>
          <form onSubmit={handleSubmitStockOut} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Date</label>
              <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" value={stockOutForm.date} onChange={e => setStockOutForm({ ...stockOutForm, date: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Product</label>
              <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none" value={stockOutForm.itemCode} onChange={e => setStockOutForm({ ...stockOutForm, itemCode: e.target.value })}>
                {stockItems.map(i => <option key={i.itemCode} value={i.itemCode}>{i.itemCode} - {i.itemName}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Quantity</label>
              <input type="number" step="0.01" min="0" required className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" value={stockOutForm.qty || ''} onChange={e => setStockOutForm({ ...stockOutForm, qty: Number(e.target.value) })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Issued To</label>
              <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" placeholder="Person / Department" value={stockOutForm.issuedTo} onChange={e => setStockOutForm({ ...stockOutForm, issuedTo: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Purpose</label>
              <input className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl" placeholder="Reason for issuing" value={stockOutForm.purpose} onChange={e => setStockOutForm({ ...stockOutForm, purpose: e.target.value })} />
            </div>
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
        <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-3 md:px-6 py-3 md:py-4">Date</th>
              <th className="px-3 md:px-6 py-3 md:py-4">SB Page No</th>
              <th className="px-3 md:px-6 py-3 md:py-4">Product Name</th>
              <th className="px-3 md:px-6 py-3 md:py-4 text-right">Qty</th>
              <th className="px-3 md:px-6 py-3 md:py-4">Issued To</th>
              <th className="px-3 md:px-6 py-3 md:py-4">Purpose</th>
              {isAdmin && <th className="px-3 md:px-6 py-3 md:py-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {stockOutRecords.length === 0 ? (
              <tr><td colSpan={isAdmin ? 7 : 6} className="px-3 md:px-6 py-16 text-center">
                <div className="flex flex-col items-center">
                  <Ban size={32} className="text-slate-200 mb-3" />
                  <p className="text-slate-400 font-bold tracking-tight italic">No stock-out records.</p>
                </div>
              </td></tr>
            ) : (
              [...stockOutRecords].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(record => {
                const item = stockItems.find(i => i.itemCode === record.itemCode);
                return (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-3 md:px-6 py-3 md:py-4 text-slate-500">{new Date(record.date).toLocaleDateString('en-GB')}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{record.itemCode}</span>
                    </td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-slate-700">{item?.itemName || '-'}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-right font-extrabold text-slate-800">{record.qty}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-slate-500">{record.issuedTo}</td>
                    <td className="px-3 md:px-6 py-3 md:py-4 text-slate-500">{record.purpose}</td>
                    {isAdmin && (
                      <td className="px-3 md:px-6 py-3 md:py-4 text-right">
                        <div className="flex justify-end space-x-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenEditStockOut(record)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(record.id, 'out')} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg" title="Delete">
                            <Trash2 size={15} />
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
      </div>
    </>
  );

  // =============================================
  // STOCK BALANCE TAB (computed, read-only)
  // Formulas:
  //   Balance Stock = Opening Stock + Total In - Total Out
  //   Value         = Unit Price × Balance Stock
  //   Suggestion    = "Place Order" if Balance < Min Stock
  // =============================================
  const renderStockBalance = () => (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-2 md:px-4 py-3 md:py-4">SB Page No</th>
              <th className="px-2 md:px-4 py-3 md:py-4">Product Name</th>
              <th className="px-2 md:px-4 py-3 md:py-4 text-right">Opening</th>
              <th className="px-2 md:px-4 py-3 md:py-4 text-right">Total In</th>
              <th className="px-2 md:px-4 py-3 md:py-4 text-right">Total Out</th>
              <th className="px-2 md:px-4 py-3 md:py-4 text-right">Balance</th>
              <th className="px-2 md:px-4 py-3 md:py-4 text-right">Min Stock</th>
              <th className="px-2 md:px-4 py-3 md:py-4">Unit</th>
              <th className="px-2 md:px-4 py-3 md:py-4 text-right">Unit Price</th>
              <th className="px-2 md:px-4 py-3 md:py-4 text-right">Value (LKR)</th>
              <th className="px-2 md:px-4 py-3 md:py-4 text-center">Procurement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {stockBalance.rows.length === 0 ? (
              <tr><td colSpan={11} className="px-6 py-16 text-center">
                <div className="flex flex-col items-center">
                  <Ban size={32} className="text-slate-200 mb-3" />
                  <p className="text-slate-400 font-bold tracking-tight italic">No items to show balance.</p>
                </div>
              </td></tr>
            ) : (
              <>
                {stockBalance.rows.map(row => (
                  <tr key={row.itemCode} className={`transition-colors ${row.status === 'Place Order' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-slate-50'}`}>
                    <td className="px-4 py-3">
                      <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 text-xs">{row.itemCode}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{row.itemName}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{row.openingStock}</td>
                    <td className="px-4 py-3 text-right font-bold text-green-600">{row.totalIn}</td>
                    <td className="px-4 py-3 text-right font-bold text-orange-600">{row.totalOut}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-slate-800">{row.balance}</td>
                    <td className="px-4 py-3 text-right text-slate-500">{row.reorderLevel}</td>
                    <td className="px-4 py-3 text-slate-500">{row.unit}</td>
                    <td className="px-4 py-3 text-right text-slate-600">{fmt(row.unitPrice)}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-800">{fmt(row.value)}</td>
                    <td className="px-4 py-3 text-center">
                      {row.status === 'Place Order' ? (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-red-100 text-red-700 border border-red-200">
                          Place Order
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-green-100 text-green-700 border border-green-200">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-slate-900 text-white font-extrabold">
                  <td className="px-4 py-4" colSpan={9}>
                    <span className="text-[10px] uppercase tracking-widest">Total Stock Value</span>
                  </td>
                  <td className="px-4 py-4 text-right text-lg">Rs. {fmt(stockBalance.totalValue)}</td>
                  <td className="px-4 py-4"></td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const showAddButton = activeSubTab !== 'Stock Balance' && isAdmin && (activeSubTab === 'Item Master' || stockItems.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <h2 className="text-xl font-bold flex items-center text-slate-700">
          <span className="p-2 bg-blue-50 rounded-lg mr-3 text-blue-600"><Package size={20} /></span>
          Store & Stock Management
        </h2>
        {showAddButton && (
          <button
            onClick={handleOpenAdd}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl flex items-center space-x-2 text-sm font-bold shadow-lg shadow-blue-200"
          >
            <Plus size={18} />
            <span>Add Entry</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-xl">
        {SUB_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveSubTab(tab); setShowForm(false); }}
            className={`flex-1 px-2 md:px-4 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-bold transition-all ${
              activeSubTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeSubTab === 'Item Master' && renderItemMaster()}
      {activeSubTab === 'Stock In' && renderStockIn()}
      {activeSubTab === 'Stock Out' && renderStockOut()}
      {activeSubTab === 'Stock Balance' && renderStockBalance()}
    </div>
  );
};

export default StoreStockView;
