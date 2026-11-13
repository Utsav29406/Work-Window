import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from './auth'
import { TooLargeError, createPortfolio, liftImages, loadPortfolio, savePortfolio } from './cloud'
import { useBuilder } from './store'
import { toast } from '@/components/ui/Toast'

const SAVE_DELAY = 1200

const errText = (e: unknown) => (e instanceof TooLargeError ? e.message : 'Could not save to your account. Changes are kept in this browser.')

/**
 * Keeps the builder in step with the signed-in user's account:
 * - `/builder?id=…` opens that portfolio from the cloud,
 * - a browser-only draft is moved into the account once the user signs in,
 * - edits autosave after a short pause.
 */
export function useCloudSync() {
  const { user, ready } = useAuth()
  const [params, setParams] = useSearchParams()
  const opening = useRef(false)

  // Open, verify or migrate once auth is known.
  useEffect(() => {
    if (!ready || !user || opening.current) return
    const { cloudId, doc, load, setCloud } = useBuilder.getState()
    const wanted = params.get('id')
    opening.current = true

    const run = async () => {
      try {
        const id = wanted ?? cloudId
        if (id) {
          const rec = await loadPortfolio(id).catch(() => null)
          if (rec) {
            // Keep local edits to this same portfolio if they are newer than the cloud copy
            // (e.g. made while offline); otherwise open the cloud copy.
            const localAt = useBuilder.getState().savedAt ?? 0
            const cloudAt = rec.updatedAt ?? 0
            if (id === cloudId && localAt > cloudAt) {
              await savePortfolio(id, useBuilder.getState().doc)
              setCloud({ cloudState: 'saved', cloudError: null })
            } else load(rec.doc, id)
            if (wanted) {
              params.delete('id')
              setParams(params, { replace: true })
            }
            return
          }
          if (wanted) toast('That portfolio could not be opened.')
          setCloud({ cloudId: null })
        }
        // Browser-only draft: save it into the account.
        setCloud({ cloudState: 'saving' })
        const lifted = await liftImages(doc)
        const newId = await createPortfolio(lifted)
        useBuilder.getState().load(lifted, newId)
        toast('Saved to your account')
      } catch (e) {
        setCloud({ cloudState: 'error', cloudError: errText(e) })
      } finally {
        opening.current = false
      }
    }
    void run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, user?.uid])

  // Debounced autosave whenever the document changes.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined
    const off = useBuilder.subscribe((s, prev) => {
      if (s.doc === prev.doc || !s.cloudId || !useAuth.getState().user) return
      // A freshly opened document has no history; there is nothing new to save.
      if (!s.past.length && !s.future.length) return
      clearTimeout(timer)
      useBuilder.getState().setCloud({ cloudState: 'saving' })
      const id = s.cloudId
      timer = setTimeout(async () => {
        try {
          await savePortfolio(id, useBuilder.getState().doc)
          if (useBuilder.getState().cloudId === id) useBuilder.getState().setCloud({ cloudState: 'saved', cloudError: null })
        } catch (e) {
          useBuilder.getState().setCloud({ cloudState: 'error', cloudError: errText(e) })
        }
      }, SAVE_DELAY)
    })
    return () => {
      clearTimeout(timer)
      off()
    }
  }, [])
}
