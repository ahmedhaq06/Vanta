export default function Pricing() {
  return (
    <section id="pricing" className="section">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <h3 className="text-3xl font-semibold">No Risk. Pay Only for Results.</h3>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="card p-8">
            <div className="text-5xl font-bold text-indigo-400">$2</div>
            <p className="mt-2 text-sm text-gray-300">Test AI on 500 leads (covers scraping costs)</p>
          </div>
          <div className="card p-8">
            <div className="text-5xl font-bold text-indigo-400">$19</div>
            <p className="mt-2 text-sm text-gray-300">Per booked meeting (only when qualified)</p>
          </div>
        </div>

        <div className="mt-6 card p-6 text-left text-sm text-gray-300">
          <div className="font-semibold">Compare:</div>
          <div className="mt-2 grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-gray-400">Other solutions:</div>
              <div>Pay upfront, no guarantees on results</div>
            </div>
            <div>
              <div className="text-indigo-300">Vanta:</div>
              <div>Pay only for booked meetings, zero risk</div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {/* Primary conversion button: directs to paywall with initial purchase flow */}
          <a href="/pay?type=initial" className="btn-primary">Get Started – $2 Test</a>
         
        </div>
      </div>
    </section>
  );
}
