import React, { useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import type { CroppingActivity } from '../types';

interface Props {
  data: CroppingActivity[];
  onAdd: (activity: CroppingActivity) => void;
  onUpdate: (activity: CroppingActivity) => void;
  onDelete: (id: string) => void;
  isAdmin: boolean;
}

type Season = 'Maha' | 'Yala';

const SEASONS: Season[] = ['Maha', 'Yala'];
const MAHA_MONTHS = ['October', 'November', 'December', 'January', 'February', 'March'];
const YALA_MONTHS = ['April', 'May', 'June', 'July', 'August', 'September'];

const emptyActivity = (season: Season): CroppingActivity => ({
  id: '',
  season,
  month: season === 'Maha' ? 'October' : 'April',
  crop: '',
  activity: '',
  notes: '',
});

export default function CroppingCalendarView({ data, onAdd, onUpdate, onDelete, isAdmin }: Props) {
  const [selectedSeason, setSelectedSeason] = useState<Season>('Maha');
  const [editForm, setEditForm] = useState<CroppingActivity | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const months = selectedSeason === 'Maha' ? MAHA_MONTHS : YALA_MONTHS;
  const filteredData = data.filter(a => a.season === selectedSeason);

  const handleSubmit = () => {
    if (!editForm) return;
    if (!editForm.crop.trim() || !editForm.activity.trim()) {
      alert('Please fill in Crop and Activity');
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

  const handleEdit = (activity: CroppingActivity) => {
    setEditForm(activity);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this activity?')) {
      onDelete(id);
    }
  };

  const handleNewActivity = () => {
    setEditForm(emptyActivity(selectedSeason));
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setEditForm(null);
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="gov-header-accent h-3 rounded-t-xl"></div>
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-50 rounded-xl">
            <Calendar className="w-6 h-6 text-brand-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Cropping Calendar</h2>
            <p className="text-sm text-gray-500">Maha & Yala Season Planning</p>
          </div>
        </div>
        {isAdmin && (
          <button onClick={handleNewActivity} className="btn-gov flex items-center gap-2 px-6 py-3">
            <Plus className="w-5 h-5" />
            <span>Add Activity</span>
          </button>
        )}
      </div>

      {/* Season Tabs */}
      <div className="px-6">
        <div className="flex gap-2 border-b border-gray-200">
          {SEASONS.map(season => (
            <button
              key={season}
              onClick={() => setSelectedSeason(season)}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                selectedSeason === season
                  ? 'border-brand-500 text-brand-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {season} Season
            </button>
          ))}
        </div>
      </div>

      {/* Form Modal */}
      {isFormOpen && editForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="gov-header-accent h-2 rounded-t-2xl"></div>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  {editForm.id ? 'Edit Activity' : 'Add Activity'}
                </h3>
                <button onClick={handleCancel} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label-gov">Season *</label>
                  <select
                    className="input-gov w-full px-4 py-3"
                    value={editForm.season}
                    onChange={e => {
                      const newSeason = e.target.value as Season;
                      setEditForm({
                        ...editForm,
                        season: newSeason,
                        month: newSeason === 'Maha' ? 'October' : 'April'
                      });
                    }}
                  >
                    {SEASONS.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-gov">Month *</label>
                  <select
                    className="input-gov w-full px-4 py-3"
                    value={editForm.month}
                    onChange={e => setEditForm({ ...editForm, month: e.target.value })}
                  >
                    {(editForm.season === 'Maha' ? MAHA_MONTHS : YALA_MONTHS).map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-gov">Crop *</label>
                  <input
                    className="input-gov w-full px-4 py-3"
                    value={editForm.crop}
                    onChange={e => setEditForm({ ...editForm, crop: e.target.value })}
                  />
                </div>

                <div>
                  <label className="label-gov">Activity *</label>
                  <input
                    className="input-gov w-full px-4 py-3"
                    value={editForm.activity}
                    onChange={e => setEditForm({ ...editForm, activity: e.target.value })}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="label-gov">Notes</label>
                  <textarea
                    className="input-gov w-full px-4 py-3 min-h-[100px]"
                    value={editForm.notes}
                    onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <button onClick={handleCancel} className="btn-gov-outline px-6 py-3">
                  Cancel
                </button>
                <button onClick={handleSubmit} className="btn-gov flex items-center gap-2 px-6 py-3">
                  <Save className="w-5 h-5" />
                  <span>{editForm.id ? 'Update' : 'Add'} Activity</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activities Table */}
      <div className="px-6">
        <div className="card-gov overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-gov w-full">
              <thead>
                <tr>
                  <th className="px-6 py-4 text-left">Month</th>
                  <th className="px-6 py-4 text-left">Crop</th>
                  <th className="px-6 py-4 text-left">Activity</th>
                  <th className="px-6 py-4 text-left">Notes</th>
                  {isAdmin && <th className="px-6 py-4 text-center w-28">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 5 : 4} className="px-6 py-12 text-center text-gray-500">
                      No activities for {selectedSeason} season.
                    </td>
                  </tr>
                ) : (
                  filteredData
                    .sort((a, b) => {
                      const monthsOrder = selectedSeason === 'Maha' ? MAHA_MONTHS : YALA_MONTHS;
                      return monthsOrder.indexOf(a.month) - monthsOrder.indexOf(b.month);
                    })
                    .map(activity => (
                      <tr key={activity.id} className="hover:bg-brand-50/50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">{activity.month}</td>
                        <td className="px-6 py-4 text-gray-700">{activity.crop}</td>
                        <td className="px-6 py-4 text-gray-700">{activity.activity}</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{activity.notes || '—'}</td>
                        {isAdmin && (
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleEdit(activity)}
                                className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(activity.id)}
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
