import React, { useState, useEffect } from 'react';
import { Experience } from '../../types';
import { EXPERIENCES } from '../../data/safaris';

interface BulkSchedule {
  id: string;
  name: string;
  appliedAt: string;
  tours: string[];
  dateFrom: string;
  dateTo: string;
  timeSlots: string[];
  status: 'available' | 'blocked' | 'limited';
  capacity: number;
  surchargeAED?: number;
}

interface DateOverride {
  tourId: string;
  date: string;
  timeSlot: string;
  status: 'available' | 'blocked' | 'limited';
  capacity: number;
  updatedAt: string;
}

interface ToursAvailabilityTabProps {
  experiences?: Experience[];
}

const COMMON_SLOTS = [
  { id: '05:00 AM (Sunrise Desert Run)', label: '05:00 AM (Sunrise Desert Run)', period: 'morning' },
  { id: '07:30 AM (Sunrise / Morning Run)', label: '07:30 AM (Morning Safari)', period: 'morning' },
  { id: '09:00 AM (Cool Morning Safari)', label: '09:00 AM (Cool Morning)', period: 'morning' },
  { id: '10:00 AM (Morning Panorama)', label: '10:00 AM (Morning Panorama)', period: 'morning' },
  { id: '10:30 AM (Mid-Morning Track)', label: '10:30 AM (Mid-Morning Track)', period: 'morning' },
  { id: '02:00 PM (Afternoon Clear View)', label: '02:00 PM (Afternoon View)', period: 'afternoon' },
  { id: '02:30 PM (Early Pickup)', label: '02:30 PM (Early Pickup)', period: 'afternoon' },
  { id: '03:00 PM (Golden Sunset Standard)', label: '03:00 PM (Golden Sunset Standard)', period: 'afternoon' },
  { id: '03:30 PM (Afternoon Dunes)', label: '03:30 PM (Afternoon Dunes)', period: 'afternoon' },
  { id: '04:30 PM (Golden Sunset Slot)', label: '04:30 PM (Golden Sunset)', period: 'afternoon' },
  { id: '05:30 PM (Twilight & Stargazing)', label: '05:30 PM (Twilight & Stargazing)', period: 'evening' },
  { id: '06:30 PM (Evening Skyline)', label: '06:30 PM (Evening Skyline)', period: 'evening' },
  { id: '08:00 PM (Night Panorama / Dinner Cruise)', label: '08:00 PM (Night Panorama / Cruise)', period: 'evening' },
  { id: '08:30 PM (Late Night Panorama)', label: '08:30 PM (Late Night)', period: 'evening' },
];

export const ToursAvailabilityTab: React.FC<ToursAvailabilityTabProps> = ({ experiences }) => {
  const allTours = experiences && experiences.length > 0 ? experiences : EXPERIENCES;

  // Availability state from server
  const [bulkSchedules, setBulkSchedules] = useState<BulkSchedule[]>([]);
  const [dateOverrides, setDateOverrides] = useState<Record<string, DateOverride>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Bulk Form State
  const [scopeType, setScopeType] = useState<'all' | 'category' | 'custom'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('safaris');
  const [selectedTourIds, setSelectedTourIds] = useState<string[]>(['all']);

  // Date Range State
  const todayStr = new Date().toISOString().split('T')[0];
  const next30Str = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const [dateFrom, setDateFrom] = useState<string>(todayStr);
  const [dateTo, setDateTo] = useState<string>(next30Str);

  // Slots State
  const [allSlotsSelected, setAllSlotsSelected] = useState<boolean>(true);
  const [selectedSlots, setSelectedSlots] = useState<string[]>(COMMON_SLOTS.map((s) => s.id));
  const [customSlotInput, setCustomSlotInput] = useState<string>('');

  // Status & Capacity
  const [status, setStatus] = useState<'available' | 'blocked' | 'limited'>('available');
  const [capacity, setCapacity] = useState<number>(60);
  const [surchargeAED, setSurchargeAED] = useState<number>(0);
  const [scheduleName, setScheduleName] = useState<string>('');

  // Calendar / Grid Inspector
  const [inspectDate, setInspectDate] = useState<string>(todayStr);
  const [inspectTourId, setInspectTourId] = useState<string>('all');
  const [filterView, setFilterView] = useState<'calendar' | 'schedules' | 'matrix'>('calendar');

  useEffect(() => {
    fetchAvailability();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const fetchAvailability = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/availability');
      const data = await res.json();
      if (data.ok && data.data) {
        setBulkSchedules(data.data.bulkSchedules || []);
        setDateOverrides(data.data.dateOverrides || {});
      }
    } catch (err: any) {
      console.error('Failed to load availability:', err);
      showToast('Could not fetch availability data', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Date Preset Handlers
  const handleSetDatePreset = (days: number) => {
    const from = new Date().toISOString().split('T')[0];
    const to = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
    setDateFrom(from);
    setDateTo(to);
  };

  // Toggle single slot checkbox
  const handleToggleSlot = (slotId: string) => {
    if (allSlotsSelected) {
      setAllSlotsSelected(false);
      setSelectedSlots([slotId]);
      return;
    }
    if (selectedSlots.includes(slotId)) {
      const updated = selectedSlots.filter((s) => s !== slotId);
      setSelectedSlots(updated);
      if (updated.length === 0) setAllSlotsSelected(false);
    } else {
      const updated = [...selectedSlots, slotId];
      setSelectedSlots(updated);
      if (updated.length === COMMON_SLOTS.length) setAllSlotsSelected(true);
    }
  };

  const handleSelectAllSlots = (enable: boolean) => {
    setAllSlotsSelected(enable);
    if (enable) {
      setSelectedSlots(COMMON_SLOTS.map((s) => s.id));
    } else {
      setSelectedSlots([]);
    }
  };

  const handleAddCustomSlot = () => {
    const trimmed = customSlotInput.trim();
    if (!trimmed) return;
    if (!selectedSlots.includes(trimmed)) {
      setSelectedSlots([...selectedSlots, trimmed]);
      setAllSlotsSelected(false);
      setCustomSlotInput('');
      showToast(`Added custom time slot: "${trimmed}"`);
    }
  };

  // Calculate scope tours
  const computeTargetTours = (): string[] => {
    if (scopeType === 'all') return ['all'];
    if (scopeType === 'category') {
      const matched = allTours.filter((t) => t.category === selectedCategory).map((t) => t.id);
      return matched.length > 0 ? matched : ['all'];
    }
    return selectedTourIds.length > 0 ? selectedTourIds : ['all'];
  };

  // Execute Bulk Availability Apply
  const handleApplyBulkAvailability = async () => {
    if (!dateFrom || !dateTo) {
      showToast('Please specify both Date From and Date To', 'error');
      return;
    }
    if (new Date(dateTo) < new Date(dateFrom)) {
      showToast('Date To cannot be earlier than Date From', 'error');
      return;
    }
    if (!allSlotsSelected && selectedSlots.length === 0) {
      showToast('Please select at least one time slot', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetTours = computeTargetTours();
      const payload = {
        name:
          scheduleName.trim() ||
          `Bulk ${status === 'available' ? 'Open' : 'Block'} (${dateFrom} to ${dateTo})`,
        tours: targetTours,
        dateFrom,
        dateTo,
        timeSlots: allSlotsSelected ? ['all_slots'] : selectedSlots,
        status,
        capacity: Number(capacity) || 60,
        surchargeAED: Number(surchargeAED) || 0,
      };

      const res = await fetch('/api/availability/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();
      if (res.ok && resJson.ok) {
        showToast(resJson.message || 'Bulk availability updated successfully!');
        if (resJson.data) {
          setBulkSchedules(resJson.data.bulkSchedules || []);
          setDateOverrides(resJson.data.dateOverrides || {});
        } else {
          fetchAvailability();
        }
        setScheduleName('');
      } else {
        showToast(resJson.error || 'Failed to update bulk availability', 'error');
      }
    } catch (e: any) {
      showToast(e.message || 'Network error while updating availability', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick single slot toggle
  const handleToggleSingleSlot = async (
    date: string,
    tourId: string,
    timeSlot: string,
    targetStatus: 'available' | 'blocked' | 'limited'
  ) => {
    try {
      const res = await fetch('/api/availability/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          tourId,
          timeSlot,
          status: targetStatus,
          capacity,
        }),
      });
      const data = await res.json();
      if (data.ok && data.data) {
        setDateOverrides(data.data.dateOverrides || {});
        showToast(`Slot "${timeSlot}" on ${date} set to ${targetStatus}!`);
      }
    } catch (e: any) {
      showToast('Failed to toggle slot', 'error');
    }
  };

  // Reset availability to default full season
  const handleResetToDefault = async () => {
    if (!window.confirm('Reset all availability to default full open season (next 180 days)?')) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/availability/reset', { method: 'POST' });
      const data = await res.json();
      if (data.ok && data.data) {
        setBulkSchedules(data.data.bulkSchedules || []);
        setDateOverrides(data.data.dateOverrides || {});
        showToast('All tours availability reset to full open season!');
      }
    } catch (e: any) {
      showToast('Failed to reset availability', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate days count
  const calculateDaysDiff = () => {
    if (!dateFrom || !dateTo) return 0;
    const diff = Math.round((new Date(dateTo).getTime() - new Date(dateFrom).getTime()) / 86400000) + 1;
    return Math.max(0, diff);
  };
  const daysCount = calculateDaysDiff();
  const targetToursCount =
    scopeType === 'all'
      ? allTours.length
      : scopeType === 'category'
      ? allTours.filter((t) => t.category === selectedCategory).length
      : selectedTourIds.length;
  const activeSlotsCount = allSlotsSelected ? COMMON_SLOTS.length : selectedSlots.length;
  const totalSlotsCount = daysCount * targetToursCount * activeSlotsCount;

  // Resolve status for any slot on a given date
  const resolveSlotStatus = (date: string, tourId: string, slot: string) => {
    const specificKey = `${date}_${tourId}_${slot}`;
    if (dateOverrides[specificKey]) return dateOverrides[specificKey].status;

    const tourDayKey = `${date}_${tourId}_all`;
    if (dateOverrides[tourDayKey]) return dateOverrides[tourDayKey].status;

    const allDayKey = `${date}_all_all`;
    if (dateOverrides[allDayKey]) return dateOverrides[allDayKey].status;

    // Check bulk schedules in order
    for (const sched of bulkSchedules) {
      if (date >= sched.dateFrom && date <= sched.dateTo) {
        const matchesTour = sched.tours.includes('all') || sched.tours.includes(tourId);
        const matchesSlot = sched.timeSlots.includes('all_slots') || sched.timeSlots.includes(slot);
        if (matchesTour && matchesSlot) {
          return sched.status;
        }
      }
    }

    return 'available';
  };

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold transition-all border ${
            toast.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-500'
              : 'bg-red-900 text-white border-red-500'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Banner with Quick Stats */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-white border border-amber-500/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-[24px]">calendar_month</span>
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              Live Fleet Dispatch Engine
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Bulk Sync Active
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif">Tours Availability &amp; Bulk Slot Manager</h2>
          <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed">
            Open, block, or schedule capacity quotas across <strong>all tours everywhere in bulk</strong>. Select a date range
            (Date From &amp; Date To), pick time slots, and apply instantly across our entire fleet and booking engine.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={fetchAvailability}
            disabled={isLoading}
            className="px-3.5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-xs font-bold text-stone-200 border border-stone-700 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">{isLoading ? 'sync' : 'refresh'}</span>
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleResetToDefault}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/50 text-xs font-bold text-amber-200 border border-amber-500/40 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">restart_alt</span>
            <span>Reset to Open Season</span>
          </button>
        </div>
      </div>

      {/* Main Bulk Availability Creator Panel */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#EA580C] text-[22px]">tune</span>
            <h3 className="font-serif font-bold text-lg text-stone-900">
              Bulk Availability Engine: Date Range &amp; Time Slots
            </h3>
          </div>
          <span className="text-xs text-stone-500 font-medium">Step 1: Configure Range &rarr; Step 2: Apply</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1: Scope & Date Range */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1.5">
                1. Target Tours Everywhere
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setScopeType('all')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    scopeType === 'all'
                      ? 'bg-amber-50 border-[#EA580C] text-[#EA580C] shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  All Everywhere
                </button>
                <button
                  type="button"
                  onClick={() => setScopeType('category')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    scopeType === 'category'
                      ? 'bg-amber-50 border-[#EA580C] text-[#EA580C] shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  By Category
                </button>
                <button
                  type="button"
                  onClick={() => setScopeType('custom')}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer ${
                    scopeType === 'custom'
                      ? 'bg-amber-50 border-[#EA580C] text-[#EA580C] shadow-xs'
                      : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  Custom Pick
                </button>
              </div>

              {scopeType === 'category' && (
                <div className="mt-2.5">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs font-semibold p-2.5 rounded-lg border border-stone-300 bg-stone-50 text-stone-900 outline-none"
                  >
                    <option value="safaris">Desert Safaris (Evening, Morning, Private, Overnight)</option>
                    <option value="buggy">Adrenaline Can-Am &amp; Polaris Buggies</option>
                    <option value="quad">ATV Quad Bikes (250cc, 350cc Raptor)</option>
                    <option value="city-tours">Sightseeing, City Tours &amp; Burj Khalifa</option>
                  </select>
                </div>
              )}

              {scopeType === 'custom' && (
                <div className="mt-2.5 max-h-36 overflow-y-auto p-2 border border-stone-200 rounded-xl space-y-1 bg-stone-50 text-xs">
                  {allTours.map((tour) => (
                    <label key={tour.id} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded">
                      <input
                        type="checkbox"
                        checked={selectedTourIds.includes(tour.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedTourIds([...selectedTourIds.filter((id) => id !== 'all'), tour.id]);
                          } else {
                            setSelectedTourIds(selectedTourIds.filter((id) => id !== tour.id));
                          }
                        }}
                        className="rounded text-[#EA580C]"
                      />
                      <span className="truncate">{tour.title}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range: Date From & Date To */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <label className="text-xs font-bold text-stone-800 block">
                2. Date Range: From &amp; To
              </label>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold uppercase text-stone-500 block mb-0.5">Date From:</span>
                  <input
                    type="date"
                    value={dateFrom}
                    min={todayStr}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full text-xs font-bold text-stone-900 bg-transparent outline-none cursor-pointer"
                  />
                </div>
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200">
                  <span className="text-[10px] font-bold uppercase text-stone-500 block mb-0.5">Date To:</span>
                  <input
                    type="date"
                    value={dateTo}
                    min={dateFrom || todayStr}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full text-xs font-bold text-stone-900 bg-transparent outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[10px] text-stone-500 py-1">Quick Presets:</span>
                {[
                  { label: 'Next 7 Days', days: 7 },
                  { label: 'Next 14 Days', days: 14 },
                  { label: 'Next 30 Days', days: 30 },
                  { label: 'Next 60 Days', days: 60 },
                  { label: 'Next 90 Days (Peak)', days: 90 },
                ].map((preset) => (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => handleSetDatePreset(preset.days)}
                    className="px-2 py-0.5 rounded text-[10px] font-semibold bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 transition-colors cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Time Slots in Bulk */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-800">
                3. Time Slots in Bulk
              </label>
              <div className="flex items-center gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => handleSelectAllSlots(true)}
                  className={`font-bold hover:underline cursor-pointer ${allSlotsSelected ? 'text-[#EA580C]' : 'text-stone-500'}`}
                >
                  All Slots
                </button>
                <span className="text-stone-300">|</span>
                <button
                  type="button"
                  onClick={() => handleSelectAllSlots(false)}
                  className="font-bold text-stone-500 hover:underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-56 overflow-y-auto p-2 border border-stone-200 rounded-xl space-y-1.5 bg-stone-50 text-xs">
              <div className="pb-1 text-[10px] uppercase font-bold text-amber-800 flex items-center justify-between">
                <span>Standard Expeditions &amp; Safaris</span>
                <span className="font-normal text-stone-500">
                  {allSlotsSelected ? 'All Active' : `${selectedSlots.length} Selected`}
                </span>
              </div>

              {COMMON_SLOTS.map((slot) => {
                const isChecked = allSlotsSelected || selectedSlots.includes(slot.id);
                return (
                  <label
                    key={slot.id}
                    className={`flex items-center justify-between p-1.5 rounded-lg border transition-all cursor-pointer ${
                      isChecked
                        ? 'bg-white border-amber-300 text-stone-900 font-semibold'
                        : 'bg-transparent border-transparent text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleSlot(slot.id)}
                        className="rounded text-[#EA580C]"
                      />
                      <span className="truncate">{slot.label}</span>
                    </div>
                    <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 shrink-0">
                      {slot.period}
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Custom Slot Adder */}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={customSlotInput}
                onChange={(e) => setCustomSlotInput(e.target.value)}
                placeholder="e.g. 11:30 AM (VIP Private Convoy)"
                className="flex-1 text-xs px-2.5 py-2 rounded-lg border border-stone-300 bg-white outline-none focus:border-[#EA580C]"
              />
              <button
                type="button"
                onClick={handleAddCustomSlot}
                className="px-3 py-2 bg-stone-800 hover:bg-[#EA580C] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shrink-0"
              >
                + Add Slot
              </button>
            </div>
          </div>

          {/* Column 3: Status, Capacity, Surcharge & Confirm */}
          <div className="space-y-4 bg-stone-50 p-4 rounded-xl border border-stone-200 flex flex-col justify-between">
            <div className="space-y-3.5">
              <label className="text-xs font-bold text-stone-800 block">
                4. Action &amp; Allotment Rules
              </label>

              {/* Status Radio Pills */}
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'available', label: 'Open Available', color: 'emerald' },
                  { id: 'limited', label: 'Limited', color: 'amber' },
                  { id: 'blocked', label: 'Blackout / Block', color: 'red' },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStatus(st.id as any)}
                    className={`py-2 px-1 text-[11px] font-bold rounded-xl border text-center transition-all cursor-pointer ${
                      status === st.id
                        ? st.id === 'available'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : st.id === 'limited'
                          ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                          : 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>

              {/* Capacity Quota */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">
                    Max Capacity / Slot:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full text-xs font-bold p-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">
                    Peak Surcharge (AED):
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={surchargeAED}
                    onChange={(e) => setSurchargeAED(Number(e.target.value))}
                    className="w-full text-xs font-bold p-2 rounded-lg border border-stone-300 bg-white"
                  />
                </div>
              </div>

              {/* Schedule Label */}
              <div>
                <label className="text-[10px] font-bold text-stone-600 uppercase block mb-1">
                  Optional Schedule Name / Note:
                </label>
                <input
                  type="text"
                  value={scheduleName}
                  onChange={(e) => setScheduleName(e.target.value)}
                  placeholder="e.g. Q4 High Season Open Everywhere"
                  className="w-full text-xs p-2 rounded-lg border border-stone-300 bg-white"
                />
              </div>

              {/* Real-time Impact Calculation Card */}
              <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-stone-800 space-y-1 shadow-xs">
                <span className="font-bold flex items-center gap-1 text-amber-900">
                  <span className="material-symbols-outlined text-[16px] text-[#EA580C]">insights</span>
                  Bulk Scope Summary:
                </span>
                <p className="text-[11px] text-stone-600">
                  <strong>{daysCount} Days</strong> ({dateFrom} to {dateTo}) &bull;{' '}
                  <strong>{targetToursCount} Tours</strong> &bull;{' '}
                  <strong>{activeSlotsCount} Slots/day</strong>
                </p>
                <p className="text-[11px] font-bold text-[#EA580C]">
                  &rarr; Total Bookable Units Updated: {totalSlotsCount.toLocaleString()} slots
                </p>
              </div>
            </div>

            {/* Execute Button */}
            <button
              type="button"
              onClick={handleApplyBulkAvailability}
              disabled={isSubmitting}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 ${
                status === 'available'
                  ? 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:brightness-105 shadow-emerald-500/25'
                  : status === 'limited'
                  ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 hover:brightness-105 shadow-amber-500/25'
                  : 'bg-gradient-to-r from-red-600 via-red-500 to-rose-700 hover:brightness-105 shadow-red-500/25'
              } disabled:opacity-50`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isSubmitting ? 'sync' : status === 'available' ? 'done_all' : 'block'}
              </span>
              <span>
                {isSubmitting
                  ? 'Applying Everywhere in Bulk...'
                  : status === 'available'
                  ? 'Make Available Everywhere in Bulk'
                  : status === 'limited'
                  ? 'Set Limited Capacity in Bulk'
                  : 'Block / Blackout Slots in Bulk'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs between Calendar Inspector and Active Schedules */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterView('calendar')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 ${
              filterView === 'calendar' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
            <span>Date &amp; Slot Matrix Inspector</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterView('schedules')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 ${
              filterView === 'schedules' ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">view_timeline</span>
            <span>Active Bulk Schedules ({bulkSchedules.length})</span>
          </button>
        </div>

        <span className="text-xs text-stone-500 font-medium">
          Overrides Tracked: {Object.keys(dateOverrides).length}
        </span>
      </div>

      {/* VIEW 1: MATRIX & CALENDAR INSPECTOR */}
      {filterView === 'calendar' && (
        <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
            <div>
              <h4 className="font-serif font-bold text-base text-stone-900">
                Inspect &amp; One-Click Override Daily Slots
              </h4>
              <p className="text-xs text-stone-500">
                View slot status for any specific date and click to open or block instantly.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-stone-50 px-2.5 py-1.5 rounded-xl border border-stone-200">
                <span className="text-xs text-stone-500 font-semibold">Date:</span>
                <input
                  type="date"
                  value={inspectDate}
                  min={todayStr}
                  onChange={(e) => setInspectDate(e.target.value)}
                  className="text-xs font-bold text-stone-900 bg-transparent outline-none cursor-pointer"
                />
              </div>

              <select
                value={inspectTourId}
                onChange={(e) => setInspectTourId(e.target.value)}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 outline-none max-w-[200px]"
              >
                <option value="all">All Tours Everywhere</option>
                {allTours.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Slots Grid for Inspected Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {COMMON_SLOTS.map((slot) => {
              const currentStatus = resolveSlotStatus(inspectDate, inspectTourId, slot.id);
              const isBlocked = currentStatus === 'blocked';
              const isLimited = currentStatus === 'limited';

              return (
                <div
                  key={slot.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                    isBlocked
                      ? 'bg-red-50/70 border-red-200 text-red-950'
                      : isLimited
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="font-bold text-xs block">{slot.label}</span>
                    <span className="text-[10px] text-stone-500 font-medium">
                      Date: {inspectDate} &bull; Capacity: {capacity}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isBlocked
                          ? 'bg-red-200 text-red-800'
                          : isLimited
                          ? 'bg-amber-200 text-amber-800'
                          : 'bg-emerald-200 text-emerald-800'
                      }`}
                    >
                      {isBlocked ? 'Blocked' : isLimited ? 'Limited' : 'Open'}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleToggleSingleSlot(
                          inspectDate,
                          inspectTourId,
                          slot.id,
                          isBlocked ? 'available' : 'blocked'
                        )
                      }
                      title={isBlocked ? 'Click to Open' : 'Click to Block'}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center cursor-pointer transition-all ${
                        isBlocked
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        {isBlocked ? 'check' : 'close'}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: ACTIVE BULK SCHEDULES TABLE */}
      {filterView === 'schedules' && (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h4 className="font-serif font-bold text-sm text-stone-900">
              Bulk Schedules Currently Enforced
            </h4>
            <span className="text-xs text-stone-500">{bulkSchedules.length} active schedule rule(s)</span>
          </div>

          {bulkSchedules.length === 0 ? (
            <div className="p-12 text-center text-xs text-stone-500">
              No custom bulk schedules created yet. All tours default to open season.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Schedule Name</th>
                    <th className="p-3">Tours Scope</th>
                    <th className="p-3">Date Range</th>
                    <th className="p-3">Time Slots</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Capacity</th>
                    <th className="p-3">Applied At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {bulkSchedules.map((sched) => (
                    <tr key={sched.id} className="hover:bg-stone-50 transition-colors">
                      <td className="p-3 font-bold text-stone-900">{sched.name}</td>
                      <td className="p-3 font-semibold text-stone-700">
                        {sched.tours.includes('all') ? 'All Tours Everywhere' : `${sched.tours.length} Tours`}
                      </td>
                      <td className="p-3 font-mono font-medium">
                        {sched.dateFrom} &rarr; {sched.dateTo}
                      </td>
                      <td className="p-3 text-stone-600">
                        {sched.timeSlots.includes('all_slots')
                          ? 'All Time Slots'
                          : `${sched.timeSlots.length} Selected Slots`}
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                            sched.status === 'available'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sched.status === 'limited'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {sched.status}
                        </span>
                      </td>
                      <td className="p-3 font-bold">{sched.capacity} / slot</td>
                      <td className="p-3 text-[10px] text-stone-400">
                        {new Date(sched.appliedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
