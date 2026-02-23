import React, { useState } from 'react';
import { Archive, Plus, Edit2, Trash2, Save, X, Package } from 'lucide-react';
import type { InventoryItem } from '../types';

interface Props {
  data: InventoryItem[];
  onAdd: (item: InventoryItem) => void;
  onUpdate: (item: InventoryItem) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

const CATEGORIES = ['Machinery', 'Equipment', 'Furniture', 'Vehicle', 'Electronics', 'Other'];
const STATUSES = ['Active', 'Under Repair', 'Disposed', 'Missing', 'Reserved'];

const emptyItem = (): InventoryItem => ({
  id: '',
  itemName: '',
  inventoryNumber: '',
  assetNumber: '',
  dateOfPurchase: new Date().toISOString().split('T')[0],
  value: 0,
  revaluationRate: 0,
  location: '',
  status: 'Active',
  custody: '',
  disposal: '',
  category: 'Equipment',
});

const fmt = (n: number) => n.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function InventoryView({ data, onAdd, onUpdate, onDelete, isAdmin }: Props) {
  const [editForm, setEditForm] = useState<InventoryItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filteredData = data.filter(item => {
    if (filterCategory !== 'All' && item.category !== filterCategory) return false;
    if (filterStatus !== 'All' && item.status !== filterStatus) return false;
    return true;
  });

  const handleSubmit = () => {
    if (!editForm) return;
    if (!editForm.itemName.trim() || !editForm.inventoryNumber.trim()) {
      alert('Please fill in Item Name and Inventory Number');
      return;
    }
    if (editForm.id) {
      onUpdate(editForm);
    } else {
      onAdd({ ...editForm, id: crypto.randomUUID() });
    }
    setEditForm(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item: InventoryItem) => {
    setEditForm(item);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this inventory item?')) {
      onDelete(id);
    }
  };

  const handleNewItem = () => {
    setEditForm(emptyItem());
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setEditForm(null);
    setIsFormOpen(false);
  };

  const totalValue = filteredData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gov-header-accent h-3 rounded-t-xl"></div>
      <div className="flex flex-wrap gap-3 items-center justify-between px-3 md:px-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-50 rounded-xl">
            <Archive className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
            <p className="text-sm text-gray-500">Track and manage all assets</p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={handleNewItem} className="btn-gov flex items-center gap-2 px-6 py-3">
            <Plus className="w-5 h-5" />
            <span>Add Item</span>
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="px-3 md:px-6 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        <div className="card-gov p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold text-gray-900">{filteredData.length}</p>
            </div>
          </div>
        </div>
        <div className="card-gov p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <Archive className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredData.filter(i => i.status === 'Active').length}
              </p>
            </div>
          </div>
        </div>
        <div className="card-gov p-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-50 rounded-xl">
              <span className="text-2xl">₨</span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">₨ {fmt(totalValue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-3 md:px-6 flex flex-wrap gap-4">
        <div>
          <label className="label-gov">Filter by Category</label>
          <select
            className="input-gov px-4 py-2"
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-gov">Filter by Status</label>
          <select
            className="input-gov px-4 py-2"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="All">All Statuses</option>
            {STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && editForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[95vw] md:max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="gov-header-accent h-2 rounded-t-2xl"></div>
            <div className="p-3 md:p-6 space-y-4 md:space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editForm.id ? 'Edit Inventory Item' : 'Add Inventory Item'}
                </h3>
                <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                <div>
                  <label className="label-gov">Item Name *</label>
                  <input
                    className="input-gov w-full px-4 py-3"
                    value={editForm.itemName}
                    onChange={e => setEditForm({ ...editForm, itemName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label-gov">Inventory Number *</label>
                  <input
                    className="input-gov w-full px-4 py-3"
                    value={editForm.inventoryNumber}
                    onChange={e => setEditForm({ ...editForm, inventoryNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label-gov">Asset Number</label>
                  <input
                    className="input-gov w-full px-4 py-3"
                    placeholder="e.g. AST-001"
                    value={editForm.assetNumber}
                    onChange={e => setEditForm({ ...editForm, assetNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label-gov">Category *</label>
                  <select
                    className="input-gov w-full px-4 py-3"
                    value={editForm.category}
                    onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-gov">Date of Purchase *</label>
                  <input
                    type="date"
                    className="input-gov w-full px-4 py-3"
                    value={editForm.dateOfPurchase}
                    onChange={e => setEditForm({ ...editForm, dateOfPurchase: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label-gov">Value (₨) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-gov w-full px-4 py-3"
                    value={editForm.value}
                    onChange={e => setEditForm({ ...editForm, value: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="label-gov">Revaluation Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="input-gov w-full px-4 py-3"
                    value={editForm.revaluationRate}
                    onChange={e => setEditForm({ ...editForm, revaluationRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="label-gov">Location *</label>
                  <input
                    className="input-gov w-full px-4 py-3"
                    value={editForm.location}
                    onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label-gov">Status *</label>
                  <select
                    className="input-gov w-full px-4 py-3"
                    value={editForm.status}
                    onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                  >
                    {STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-gov">Custody</label>
                  <input
                    className="input-gov w-full px-4 py-3"
                    value={editForm.custody}
                    onChange={e => setEditForm({ ...editForm, custody: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label-gov">Disposal</label>
                  <input
                    className="input-gov w-full px-4 py-3"
                    value={editForm.disposal}
                    onChange={e => setEditForm({ ...editForm, disposal: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button onClick={handleCancel} className="btn-gov-outline px-6 py-3">
                  Cancel
                </button>
                <button onClick={handleSubmit} className="btn-gov flex items-center gap-2 px-6 py-3">
                  <Save className="w-5 h-5" />
                  <span>{editForm.id ? 'Update' : 'Add'} Item</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items Table */}
      <div className="px-3 md:px-6">
        <div className="card-gov overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-gov w-full">
              <thead>
                <tr>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left">Inventory No.</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left">Asset No.</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left">Item Name</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left">Category</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left">Purchase Date</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-right">Value (₨)</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left">Location</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left">Status</th>
                  <th className="px-3 md:px-6 py-3 md:py-4 text-left">Custody</th>
                  {isAdmin && <th className="px-3 md:px-6 py-3 md:py-4 text-center w-28">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 10 : 9} className="px-3 md:px-6 py-12 text-center text-gray-500">
                      No inventory items found.
                    </td>
                  </tr>
                ) : (
                  filteredData
                    .sort((a, b) => a.inventoryNumber.localeCompare(b.inventoryNumber))
                    .map(item => (
                      <tr key={item.id} className="hover:bg-brand-50/50 transition-colors">
                        <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-brand-700">{item.inventoryNumber}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-gray-600">{item.assetNumber || '—'}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 font-medium text-gray-900">{item.itemName}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-gray-600">{item.dateOfPurchase}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-right font-semibold text-gray-900">₨ {fmt(item.value)}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-gray-600">{item.location}</td>
                        <td className="px-3 md:px-6 py-3 md:py-4">
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            item.status === 'Active' ? 'bg-green-100 text-green-700' :
                            item.status === 'Under Repair' ? 'bg-amber-100 text-amber-700' :
                            item.status === 'Disposed' ? 'bg-red-100 text-red-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-3 md:py-4 text-gray-600">{item.custody || '—'}</td>
                        {isAdmin && (
                          <td className="px-3 md:px-6 py-3 md:py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
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
      </div>
    </div>
  );
}
