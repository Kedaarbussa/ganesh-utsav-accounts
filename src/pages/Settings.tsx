import React, { useState, useEffect, useCallback } from 'react';
import { CommitteeMember } from '../types';
import { useFestival } from '../context/FestivalContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Settings as SettingsIcon, Building, Calendar, Plus, Trash2, Save, Users } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { activeFestival, festivals, reloadFestivals, createFestivalYear } = useFestival();
  const { isAdmin } = useAuth();

  // Apartment & Festival Header state
  const [apartmentName, setApartmentName] = useState('');
  const [festivalName, setFestivalName] = useState('');

  // New Year state
  const [newYear, setNewYear] = useState('');

  // Committee Members state (for report footer)
  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPosition, setNewMemberPosition] = useState('');

  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    if (activeFestival) {
      setApartmentName(activeFestival.apartmentName);
      setFestivalName(activeFestival.festivalName);
    }
  }, [activeFestival]);

  const loadCommitteeMembers = useCallback(async () => {
    if (!activeFestival) return;
    try {
      const res = await api.get<CommitteeMember[]>(`/committee-members?festivalId=${activeFestival._id}`);
      setCommitteeMembers(res);
    } catch (err) {
      console.error('Failed to load committee members:', err);
    }
  }, [activeFestival]);

  useEffect(() => {
    loadCommitteeMembers();
  }, [loadCommitteeMembers]);

  if (!isAdmin) {
    return <div className="p-12 text-center text-slate-500 font-bold">Access Restricted to Admins</div>;
  }

  const handleSaveApartmentInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeFestival) return;

    setSavingSettings(true);
    try {
      await api.put(`/festivals/${activeFestival._id}`, {
        apartmentName: apartmentName.trim(),
        festivalName: festivalName.trim(),
      });
      await reloadFestivals();
      alert('Settings saved successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleCreateYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear || isNaN(Number(newYear))) {
      alert('Please enter a valid numeric year (e.g. 2027)');
      return;
    }

    try {
      await createFestivalYear(Number(newYear), apartmentName, festivalName);
      setNewYear('');
      alert(`Festival Year ${newYear} created successfully!`);
    } catch (err: any) {
      alert(err.message || 'Failed to create festival year');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim() || !activeFestival) return;

    try {
      await api.post('/committee-members', {
        festivalId: activeFestival._id,
        name: newMemberName.trim(),
        position: newMemberPosition.trim(),
      });
      setNewMemberName('');
      setNewMemberPosition('');
      loadCommitteeMembers();
    } catch (err: any) {
      alert(err.message || 'Failed to add committee member');
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await api.delete(`/committee-members?id=${id}`);
      loadCommitteeMembers();
    } catch (err: any) {
      alert(err.message || 'Failed to delete member');
    }
  };

  return (
    <div className="space-y-8 pb-12 text-left max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center space-x-3">
        <div className="p-3 rounded-2xl bg-ganesh-100 text-ganesh-700">
          <SettingsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900">Application Settings</h1>
          <p className="text-xs text-slate-500">Configure apartment branding, multi-year festivals & committee roster</p>
        </div>
      </div>

      {/* SECTION 1: APARTMENT & FESTIVAL BRANDING */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center">
          <Building className="w-4 h-4 text-ganesh-600 mr-2" /> Apartment & Festival Header Info
        </h3>

        <form onSubmit={handleSaveApartmentInfo} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Apartment Name *</label>
              <input
                type="text"
                value={apartmentName}
                onChange={(e) => setApartmentName(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-xl text-sm font-extrabold text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Festival Name *</label>
              <input
                type="text"
                value={festivalName}
                onChange={(e) => setFestivalName(e.target.value)}
                required
                className="w-full px-3 py-2 border rounded-xl text-sm font-extrabold text-amber-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="px-5 py-2.5 rounded-xl bg-ganesh-600 hover:bg-ganesh-700 text-white font-bold text-xs shadow-md flex items-center"
          >
            <Save className="w-4 h-4 mr-1.5" /> {savingSettings ? 'Saving...' : 'Save Header Info'}
          </button>
        </form>
      </div>

      {/* SECTION 2: MULTI-YEAR FESTIVAL MANAGEMENT */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center">
          <Calendar className="w-4 h-4 text-amber-600 mr-2" /> Multi-Year Festival Years Management
        </h3>

        <form onSubmit={handleCreateYear} className="flex items-center space-x-3">
          <input
            type="number"
            placeholder="Create New Year e.g. 2027"
            value={newYear}
            onChange={(e) => setNewYear(e.target.value)}
            className="px-3 py-2 border rounded-xl text-xs font-bold w-48"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md flex items-center"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Festival Year
          </button>
        </form>

        <div className="pt-2">
          <h4 className="text-xs font-bold text-slate-500 mb-2">Existing Festival Years:</h4>
          <div className="flex flex-wrap gap-2">
            {festivals.map((f) => (
              <div
                key={f._id}
                className={`px-3 py-2 rounded-xl text-xs font-bold border flex items-center space-x-2 ${
                  f._id === activeFestival?._id
                    ? 'bg-ganesh-600 text-white border-ganesh-600 shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <span>{f.festivalName} {f.year}</span>
                {f._id === activeFestival?._id && <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded">Active</span>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: COMMITTEE MEMBERS ROSTER FOR FINAL REPORT FOOTER */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center">
          <Users className="w-4 h-4 text-indigo-600 mr-2" /> Committee Members Roster (For Report Footer)
        </h3>

        <form onSubmit={handleAddMember} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Member Name (e.g. B. RAVINDER)"
            value={newMemberName}
            onChange={(e) => setNewMemberName(e.target.value)}
            required
            className="px-3 py-2 border rounded-xl text-xs font-semibold"
          />
          <input
            type="text"
            placeholder="Position (e.g. President, Treasurer)"
            value={newMemberPosition}
            onChange={(e) => setNewMemberPosition(e.target.value)}
            className="px-3 py-2 border rounded-xl text-xs font-semibold"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md flex items-center justify-center"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Member to Footer
          </button>
        </form>

        <div className="pt-2 divide-y divide-slate-100">
          {committeeMembers.map((m) => (
            <div key={m._id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-900 text-xs">{m.name}</span>
                {m.position && <span className="text-xs text-slate-500 ml-2">({m.position})</span>}
              </div>
              <button
                onClick={() => handleDeleteMember(m._id)}
                className="p-1 text-slate-400 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
