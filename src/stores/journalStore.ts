// FORGE — Trade Journal store.
// Persisted to localStorage. Attachments are base64-encoded data URLs,
// hard-capped at 5 MB per file. Future: backend sync.

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  JournalEntry,
  JournalAttachment,
  EntryStance,
} from '@/lib/types/journal';

const MAX_ATTACHMENT_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export interface NewEntryInput {
  tradingDate?: string;
  title: string;
  body: string;
  zones?: string[];
  tags?: string[];
  stance?: EntryStance;
  pnl?: number | null;
}

export interface EntryFilters {
  zones?: string[];
  tags?: string[];
  fromDate?: string;
  toDate?: string;
  stance?: EntryStance;
}

interface JournalState {
  entries: JournalEntry[];

  addEntry: (input: NewEntryInput) => JournalEntry;
  updateEntry: (id: string, patch: Partial<JournalEntry>) => void;
  deleteEntry: (id: string) => void;
  attachToEntry: (entryId: string, file: File) => Promise<JournalAttachment>;
  removeAttachment: (entryId: string, attachmentId: string) => void;
  markReviewed: (entryId: string) => void;
  clearAll: () => void;

  getEntry: (id: string) => JournalEntry | null;
  listEntries: () => JournalEntry[];
  filterEntries: (filters: EntryFilters) => JournalEntry[];
}

function makeId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export const useJournalStore = create<JournalState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (input) => {
        const now = new Date().toISOString();
        const entry: JournalEntry = {
          id: makeId('je'),
          createdAt: now,
          updatedAt: now,
          tradingDate: input.tradingDate ?? now.slice(0, 10),
          title: input.title,
          body: input.body,
          zones: input.zones ?? [],
          tags: input.tags ?? [],
          stance: input.stance ?? 'observation',
          pnl: input.pnl ?? null,
          attachments: [],
          reviewed: false,
          reviewedAt: null,
        };
        set((s) => ({ entries: [entry, ...s.entries] }));
        return entry;
      },

      updateEntry: (id, patch) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === id
              ? { ...e, ...patch, updatedAt: new Date().toISOString() }
              : e,
          ),
        })),

      deleteEntry: (id) =>
        set((s) => ({ entries: s.entries.filter((e) => e.id !== id) })),

      attachToEntry: async (entryId, file) => {
        if (file.size > MAX_ATTACHMENT_SIZE_BYTES) {
          throw new Error(
            `File too large. Maximum 5 MB; received ${(
              file.size /
              1024 /
              1024
            ).toFixed(2)} MB.`,
          );
        }
        const dataUrl: string = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(file);
        });

        const attachment: JournalAttachment = {
          id: makeId('att'),
          name: file.name,
          mimeType: file.type,
          dataUrl,
          attachedAt: new Date().toISOString(),
        };

        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  attachments: [...e.attachments, attachment],
                  updatedAt: new Date().toISOString(),
                }
              : e,
          ),
        }));
        return attachment;
      },

      removeAttachment: (entryId, attachmentId) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  attachments: e.attachments.filter(
                    (a) => a.id !== attachmentId,
                  ),
                  updatedAt: new Date().toISOString(),
                }
              : e,
          ),
        })),

      markReviewed: (entryId) =>
        set((s) => ({
          entries: s.entries.map((e) =>
            e.id === entryId
              ? {
                  ...e,
                  reviewed: true,
                  reviewedAt: new Date().toISOString(),
                }
              : e,
          ),
        })),

      clearAll: () => set({ entries: [] }),

      getEntry: (id) => get().entries.find((e) => e.id === id) ?? null,
      listEntries: () => get().entries,

      filterEntries: (filters) => {
        const all = get().entries;
        return all.filter((e) => {
          if (filters.zones && filters.zones.length > 0) {
            if (!filters.zones.some((z) => e.zones.includes(z))) return false;
          }
          if (filters.tags && filters.tags.length > 0) {
            if (!filters.tags.some((t) => e.tags.includes(t))) return false;
          }
          if (filters.stance && e.stance !== filters.stance) return false;
          if (filters.fromDate && e.tradingDate < filters.fromDate) return false;
          if (filters.toDate && e.tradingDate > filters.toDate) return false;
          return true;
        });
      },
    }),
    {
      name: 'gridalpha-journal',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
