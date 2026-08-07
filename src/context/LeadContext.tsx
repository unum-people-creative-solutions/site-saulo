'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  captureTrackingParams,
  resolveOrigem,
  type TrackingParams,
} from '@/lib/tracking';

const STORAGE_KEY = 'saulo:tracking';

type LeadContextValue = {
  params: TrackingParams;
  origem: string;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  restoreTriggerFocus: () => void;
};

const LeadContext = createContext<LeadContextValue | undefined>(undefined);

function hasTrackingParams(params: TrackingParams): boolean {
  return Object.values(params).some((value) => value !== undefined);
}

function readStoredParams(): TrackingParams | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TrackingParams;
  } catch {
    return null;
  }
}

export function LeadProvider({ children }: { children: ReactNode }) {
  const [params, setParams] = useState<TrackingParams>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const fromUrl = captureTrackingParams();

    if (hasTrackingParams(fromUrl)) {
      setParams(fromUrl);
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(fromUrl));
      return;
    }

    const stored = readStoredParams();
    if (stored) {
      setParams(stored);
    }
  }, []);

  const value: LeadContextValue = {
    params,
    origem: resolveOrigem(params),
    isModalOpen,
    openModal: () => {
      const active = document.activeElement;
      triggerRef.current =
        active instanceof HTMLElement ? active : null;
      setIsModalOpen(true);
    },
    closeModal: () => setIsModalOpen(false),
    restoreTriggerFocus: () => {
      triggerRef.current?.focus();
    },
  };

  return <LeadContext.Provider value={value}>{children}</LeadContext.Provider>;
}

export function useLead(): LeadContextValue {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLead must be used within a LeadProvider');
  }
  return context;
}
