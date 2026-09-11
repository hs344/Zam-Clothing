import { ABOUT, TEAM } from "@/lib/team";

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export function AboutUs() {
  return (
    <section id="about" aria-labelledby="about-heading" className="mx-auto max-w-[1440px] px-5 md:px-10 pt-20 md:pt-28">
      <div className="grid gap-10 md:grid-cols-12 items-start border-t border-line pt-14">
        <div className="md:col-span-5">
          <p className="eyebrow text-gold">{ABOUT.eyebrow}</p>
          <h2 id="about-heading" className="font-serif text-3xl md:text-5xl mt-4 leading-[1.1]">
            {ABOUT.title}
          </h2>
        </div>
        <div className="md:col-span-6 md:col-start-7 space-y-4 text-[0.95rem] text-ash leading-relaxed">
          {ABOUT.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>

      <ul className="mt-12 md:mt-16 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
        {TEAM.map((m, i) => (
          <li key={m.name}>
            {/* Photo frame: thin charcoal frame, cream matte, portrait photo inside. */}
            <figure className="border border-charcoal/80 bg-white p-2.5 md:p-3 shadow-soft">
              <div className="relative aspect-[4/5] overflow-hidden bg-cream-2 border border-line">
                {m.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.image} alt={`${m.name}, ${m.role}`} loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-stone" aria-label={`${m.name} — photo coming soon`}>
                    <span className="font-serif text-5xl md:text-6xl text-beige">{initials(m.name)}</span>
                    <span className="mt-3 eyebrow text-stone/80">0{i + 1}</span>
                  </div>
                )}
              </div>
              <figcaption className="pt-3 pb-1 text-center">
                <p className="text-[0.92rem] font-medium">{m.name}</p>
                <p className="mt-0.5 text-[0.68rem] uppercase tracking-[0.2em] text-ash">{m.role}</p>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
