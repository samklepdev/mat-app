import { create } from 'zustand';
import type { CheckIn, Medication, StabilityStats, UserProfile } from '../types';

// ─── Check-in Store ───────────────────────────────────────────────────────────

interface CheckInState {
  todayCheckIn: CheckIn | null;
  recentCheckIns: CheckIn[];
  setTodayCheckIn: (checkIn: CheckIn) => void;
  setRecentCheckIns: (checkIns: CheckIn[]) => void;
  clearTodayCheckIn: () => void;
}

export const useCheckInStore = create<CheckInState>((set) => ({
  todayCheckIn: null,
  recentCheckIns: [],
  setTodayCheckIn: (checkIn) => set({ todayCheckIn: checkIn }),
  setRecentCheckIns: (checkIns) => set({ recentCheckIns: checkIns }),
  clearTodayCheckIn: () => set({ todayCheckIn: null }),
}));

// ─── Medication Store ─────────────────────────────────────────────────────────

interface MedicationState {
  medications: Medication[];
  setMedications: (meds: Medication[]) => void;
  addMedication: (med: Medication) => void;
  updateMedication: (id: string, updates: Partial<Medication>) => void;
  removeMedication: (id: string) => void;
}

export const useMedicationStore = create<MedicationState>((set) => ({
  medications: [],
  setMedications: (medications) => set({ medications }),
  addMedication: (med) =>
    set((state) => ({ medications: [...state.medications, med] })),
  updateMedication: (id, updates) =>
    set((state) => ({
      medications: state.medications.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      ),
    })),
  removeMedication: (id) =>
    set((state) => ({
      medications: state.medications.filter((m) => m.id !== id),
    })),
}));

// ─── User Store ───────────────────────────────────────────────────────────────

interface UserState {
  profile: UserProfile | null;
  stability: StabilityStats | null;
  setProfile: (profile: UserProfile) => void;
  setStability: (stats: StabilityStats) => void;
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  stability: null,
  setProfile: (profile) => set({ profile }),
  setStability: (stability) => set({ stability }),
}));
