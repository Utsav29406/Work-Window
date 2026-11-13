import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Device, Portfolio } from './types'
import { samplePortfolio } from './sample'

const HISTORY_LIMIT = 100
const COALESCE_MS = 800

interface BuilderState {
  doc: Portfolio
  past: Portfolio[]
  future: Portfolio[]
  lastKey: string | null
  lastAt: number
  device: Device
  savedAt: number | null
  /** Database id of the portfolio being edited, or null for a browser-only draft. */
  cloudId: string | null
  cloudState: CloudState
  cloudError: string | null
  /**
   * Apply a change. Changes that share a `key` within a short window
   * (for example, typing in one field) collapse into one undo step.
   */
  update: (fn: (draft: Portfolio) => void, key?: string) => void
  replace: (doc: Portfolio) => void
  undo: () => void
  redo: () => void
  setDevice: (d: Device) => void
  /** Open a portfolio fresh (no undo history), e.g. one loaded from the cloud. */
  load: (doc: Portfolio, cloudId: string | null) => void
  /** Back to the sample draft with no cloud link (used on sign-out). */
  reset: () => void
  setCloud: (p: Partial<Pick<BuilderState, 'cloudId' | 'cloudState' | 'cloudError'>>) => void
}

export type CloudState = 'idle' | 'saving' | 'saved' | 'error'

export const useBuilder = create<BuilderState>()(
  persist(
    (set, get) => ({
      doc: samplePortfolio(),
      past: [],
      future: [],
      lastKey: null,
      lastAt: 0,
      device: 'desktop',
      savedAt: null,
      cloudId: null,
      cloudState: 'idle',
      cloudError: null,

      update: (fn, key) => {
        const { doc, past, lastKey, lastAt } = get()
        const next = structuredClone(doc)
        fn(next)
        const now = Date.now()
        const coalesce = key != null && key === lastKey && now - lastAt < COALESCE_MS
        set({
          doc: next,
          past: coalesce ? past : [...past, doc].slice(-HISTORY_LIMIT),
          future: [],
          lastKey: key ?? null,
          lastAt: now,
          savedAt: now,
        })
      },

      replace: (doc) => {
        const { doc: prev, past } = get()
        set({ doc, past: [...past, prev].slice(-HISTORY_LIMIT), future: [], lastKey: null, savedAt: Date.now() })
      },

      undo: () => {
        const { past, doc, future } = get()
        if (!past.length) return
        set({ doc: past[past.length - 1], past: past.slice(0, -1), future: [doc, ...future], lastKey: null, savedAt: Date.now() })
      },

      redo: () => {
        const { past, doc, future } = get()
        if (!future.length) return
        set({ doc: future[0], past: [...past, doc], future: future.slice(1), lastKey: null, savedAt: Date.now() })
      },

      setDevice: (device) => set({ device }),

      load: (doc, cloudId) => set({ doc, cloudId, past: [], future: [], lastKey: null, savedAt: Date.now(), cloudState: cloudId ? 'saved' : 'idle', cloudError: null }),

      reset: () => set({ doc: samplePortfolio(), cloudId: null, savedAt: null, past: [], future: [], lastKey: null, cloudState: 'idle', cloudError: null }),

      setCloud: (p) => set(p),
    }),
    {
      name: 'foliocraft:v1',
      partialize: (s) => ({ doc: s.doc, device: s.device, cloudId: s.cloudId }),
    },
  ),
)

export const useDoc = () => useBuilder((s) => s.doc)
