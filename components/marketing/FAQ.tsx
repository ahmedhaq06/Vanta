const faqs = [
  { q: "Do I need technical skills?", a: "Just upload a CSV and start. No coding, no complex setup required." },
  { q: "How does payment work?", a: "$2 upfront to test AI on 500 leads. Then $19 only when a qualified meeting is booked with your target prospect." },
  { q: "Can I scale?", a: "Phase 2 will automate entire sales pipelines, including calls and CRM integration for enterprise scale." },
  { q: "Is it safe?", a: "We scrape only public data and handle emails responsibly. You control all messaging and targeting." },
];

export default function FAQ() {
  return (
    <section className="section">
      <div className="mx-auto max-w-3xl px-4">
        {/* Beta Product badge removed for fixed top placement */}
        <h3 className="text-center text-3xl font-semibold">Frequently Asked Questions</h3>
        <div className="mt-8 divide-y divide-white/10 rounded-2xl border border-white/10">
          {faqs.map((f) => (
            <details key={f.q} className="group">
              <summary className="cursor-pointer list-none px-6 py-5 font-medium focus:outline-none group-open:bg-white/5">
                {f.q}
              </summary>
              <div className="px-6 pb-6 text-gray-300">{f.a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
