const faqs = [
  {
    question: "How fast can Ping detect an outage?",
    answer:
      "Monitors can run as often as every 10 seconds. A debounced state machine confirms the failure before alerting, so a single dropped packet doesn't trigger a false alarm.",
  },
  {
    question: "What counts toward my uptime percentage?",
    answer:
      "Uptime is duration-based and excludes time a monitor was paused and any data gaps — so the number reflects real availability, not just a count of checks.",
  },
  {
    question: "How do alerts get delivered?",
    answer:
      "Email alerts are sent through a durable outbox with retries and exponential backoff, so a temporary SMTP hiccup doesn't mean a missed alert.",
  },
  {
    question: "Can Ping check internal or private URLs?",
    answer:
      "Monitor URLs are validated for SSRF risk at creation and again at DNS resolution/connect time, which means checks are restricted to public, externally reachable endpoints.",
  },
  {
    question: "What happens when I hit my monthly check quota?",
    answer:
      "Affected monitors pause automatically until the month resets or you upgrade — they're clearly flagged in the dashboard so nothing fails silently.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 sm:py-28">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h2>
      </div>

      <div className="mt-10 divide-y rounded-2xl border bg-card">
        {faqs.map((faq) => (
          <details key={faq.question} className="group p-5 sm:p-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium sm:text-base">
              {faq.question}
              <span className="shrink-0 text-lg text-muted-foreground transition-transform group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
