export default function ComingSoon() {
  const items = [
    { title: "Multi-channel sequences", desc: "Email + LinkedIn + X DMs in coordinated campaigns" },
    { title: "AI voice agent for outbound calls", desc: "Autonomous phone outreach with natural conversation" },
    { title: "Negotiation assistant & demo generator", desc: "AI creates personalized demos for each prospect" },
    { title: "Enterprise dashboard & CRM integration", desc: "Advanced analytics and seamless CRM sync" },
  ];

  return (
    <section className="section" id="about">
      <div className="mx-auto max-w-5xl px-4 text-center">
        <h3 className="text-3xl font-semibold">From Your SDR to a Full Sales Team – Coming Soon</h3>
        <p className="mt-1 text-sm text-gray-400">Phase 2+ will automate your entire sales pipeline</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it) => (
            <div key={it.title} className="rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-6">
              <div className="mb-2 inline-block rounded-full border border-indigo-400/40 px-3 py-1 text-xs text-indigo-300">Coming Soon</div>
              <h4 className="text-lg font-semibold">{it.title}</h4>
              <p className="mt-2 text-sm text-gray-300">{it.desc}</p>
            </div>
          ))}
        </div>

        
      </div>
    </section>
  );
}
