const ROLES = ['Product designers', 'Engineers', 'Architects', 'Photographers', 'Writers', 'Brand studios', 'Illustrators', 'Consultants', 'Data scientists', 'Art directors']

export function Marquee() {
  const row = [...ROLES, ...ROLES]
  return (
    <section aria-label="Who WorkWindow is for" className="border-y border-line bg-paper/60 py-5">
      <div className="relative overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
        <div className="flex w-max animate-marquee items-center gap-10 hover:[animation-play-state:paused]">
          {row.map((r, i) => (
            <span key={i} className="flex items-center gap-10 whitespace-nowrap font-display text-xl italic text-ink-2">
              {r}
              <span className="h-1.5 w-1.5 rotate-45 bg-gold-500" aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
