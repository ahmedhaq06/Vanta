import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden pt-36 pb-20" id="hero" style={{ backgroundColor: '#0b0b13' }}>
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h1 className="text-4xl font-bold leading-tight md:text-6xl">
          The SDR That Works 24/7
          <br />
          and Never Misses a Follow-Up.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-balance text-gray-300">
          Vanta AI turns lead lists into personalized outreach, ongoing follow-ups, qualification conversations, and booked meetings — all on autopilot.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="#cta" className="btn-primary">
            Get Early Access
          </Link>
          <Link href="/" className="btn-ghost">
            See Demo
          </Link>
        </div>

        <div className="mt-14 flex items-center justify-center gap-4 text-sm text-gray-300">
          <div className="feature-pill">Lead list</div>
          <div className="text-gray-500">→</div>
          <div className="feature-pill">Personalized messages</div>
          <div className="text-gray-500">→</div>
          <div className="feature-pill">Booked meeting calendar</div>
        </div>
      </div>
    </section>
  );
}
