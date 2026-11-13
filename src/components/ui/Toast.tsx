import { create } from 'zustand'
import { AnimatePresence, motion } from 'motion/react'
import { useBuilder } from '@/lib/store'

interface ToastState {
  msg: string | null
  undo: boolean
  id: number
  show: (msg: string, undo?: boolean) => void
  hide: () => void
}

let timer: ReturnType<typeof setTimeout> | undefined

export const useToast = create<ToastState>((set) => ({
  msg: null,
  undo: false,
  id: 0,
  show: (msg, undo = false) => {
    clearTimeout(timer)
    set((s) => ({ msg, undo, id: s.id + 1 }))
    timer = setTimeout(() => set({ msg: null }), undo ? 5000 : 2200)
  },
  hide: () => set({ msg: null }),
}))

export const toast = (msg: string, undo?: boolean) => useToast.getState().show(msg, undo)

export function Toaster() {
  const { msg, undo, id, hide } = useToast()
  const doUndo = useBuilder((s) => s.undo)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(20px+env(safe-area-inset-bottom))] z-[80] flex justify-center px-4">
      <AnimatePresence>
        {msg && (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            role="status"
            className="pointer-events-auto flex items-center gap-3 rounded-full bg-brand-900 py-2 pl-5 pr-2 text-sm font-medium text-cream shadow-lift"
          >
            {msg}
            {undo ? (
              <button
                onClick={() => {
                  hide()
                  doUndo()
                }}
                className="rounded-full bg-white/12 px-3 py-1 text-[13px] font-semibold text-gold-300 hover:bg-white/20"
              >
                Undo
              </button>
            ) : (
              <span className="w-2" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
