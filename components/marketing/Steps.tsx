export default function Steps() {
  const Card = ({ title, children, icon }: { title: string; children: React.ReactNode; icon: string }) => (
    <div className="card p-6">
      <div className="mb-3 text-3xl">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-gray-300">{children}</p>
    </div>
  );

  return (
    <section className="section">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <a id="cta" className="sr-only" />
        {/* Beta Product badge removed for fixed top placement */}
        <a href="#pricing" className="mx-auto inline-block btn-primary">Test Our AI for $2</a>
        <p className="mt-2 text-sm text-gray-400">Covers AI scraping costs - no subscription trap</p>

        <h3 className="mt-16 text-2xl font-semibold">How It Works (Step-By-Step for MVP)</h3>
        <p className="mt-1 text-sm text-gray-400">Pay $2 upfront, $19 only when a meeting is booked</p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <Card title="Step 1 – Upload Leads" icon="📥">
            Drag & drop your CSV with names, emails, and profile URLs
          </Card>
          <Card title="Step 2 – AI Personalization" icon="🤖">
            Our AI reads bios, recent posts, and job titles to craft unique, human-like emails
          </Card>
          <Card title="Step 3 – Send Emails & Track Results" icon="📧">
            Send batches, see opens, clicks, and replies instantly
          </Card>
          <Card title="Step 4 – Book Meetings Automatically" icon="📅">
            AI books qualified leads directly into your calendar. You only pay $19 when a meeting is booked.
          </Card>
        </div>
      </div>
    </section>
  );
}
