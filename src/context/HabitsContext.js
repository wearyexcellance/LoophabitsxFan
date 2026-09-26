import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { loadHabits, persistHabits, makeId, todayKey } from '../utils/storage';

const HabitsContext = createContext(null);

export function HabitsProvider({ children }) {
  const [habits, setHabits] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const stored = await loadHabits();
      setHabits(stored);
      setReady(true);
    })();
  }, []);

  // Persist any time habits change, once the initial load is done.
  useEffect(() => {
    if (ready) persistHabits(habits);
  }, [habits, ready]);

  const addHabit = useCallback((habit) => {
    const newHabit = {
      id: makeId(),
      createdAt: todayKey(),
      entries: {},
      coefficient: 1,
      ...habit,
    };
    setHabits((prev) => [...prev, newHabit]);
    return newHabit;
  }, []);

  const updateHabit = useCallback((id, patch) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...patch } : h)));
  }, []);

  const deleteHabit = useCallback((id) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const setEntry = useCallback((habitId, dateKey, value) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id !== habitId) return h;
        const entries = { ...h.entries };
        if (value === undefined || value === null) {
          delete entries[dateKey];
        } else {
          entries[dateKey] = value;
        }
        return { ...h, entries };
      })
    );
  }, []);

  // Wholesale replace all habits, e.g. after restoring an Excel backup.
  const restoreHabits = useCallback((newHabits) => {
    setHabits(newHabits || []);
  }, []);

  const value = { habits, ready, addHabit, updateHabit, deleteHabit, setEntry, restoreHabits };
  return <HabitsContext.Provider value={value}>{children}</HabitsContext.Provider>;
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error('useHabits must be used inside a HabitsProvider');
  return ctx;
}
