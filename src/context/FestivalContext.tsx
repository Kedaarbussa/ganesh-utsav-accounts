import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Festival } from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface FestivalContextType {
  festivals: Festival[];
  activeFestival: Festival | null;
  loading: boolean;
  setActiveFestivalId: (id: string) => void;
  reloadFestivals: () => Promise<void>;
  createFestivalYear: (year: number, apartmentName?: string, festivalName?: string) => Promise<void>;
}

const FestivalContext = createContext<FestivalContextType | undefined>(undefined);

export const FestivalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [festivals, setFestivals] = useState<Festival[]>([]);
  const [activeFestival, setActiveFestival] = useState<Festival | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchFestivals = useCallback(async () => {
    if (!user) {
      setFestivals([]);
      setActiveFestival(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api.get<Festival[]>('/festivals');
      setFestivals(data);

      if (data.length > 0) {
        // Try to keep saved active festival or choose active flag or first
        const savedId = localStorage.getItem('active_festival_id');
        const foundSaved = data.find((f) => f._id === savedId);
        const activeOne = data.find((f) => f.isActive);
        setActiveFestival(foundSaved || activeOne || data[0]);
      }
    } catch (err) {
      console.error('Failed to load festival years:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchFestivals();
  }, [fetchFestivals]);

  const setActiveFestivalId = (id: string) => {
    const fest = festivals.find((f) => f._id === id);
    if (fest) {
      setActiveFestival(fest);
      localStorage.setItem('active_festival_id', id);
    }
  };

  const createFestivalYear = async (year: number, apartmentName?: string, festivalName?: string) => {
    const newFest = await api.post<Festival>('/festivals', { year, apartmentName, festivalName });
    await fetchFestivals();
    if (newFest) {
      setActiveFestivalId(newFest._id);
    }
  };

  return (
    <FestivalContext.Provider
      value={{
        festivals,
        activeFestival,
        loading,
        setActiveFestivalId,
        reloadFestivals: fetchFestivals,
        createFestivalYear,
      }}
    >
      {children}
    </FestivalContext.Provider>
  );
};

export const useFestival = () => {
  const context = useContext(FestivalContext);
  if (!context) {
    throw new Error('useFestival must be used within a FestivalProvider');
  }
  return context;
};
