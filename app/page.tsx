import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { LandingPage } from "@/components/marketing/landing-page";
import { getPlans } from "@/lib/api/plans";

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Ping",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "Real-time HTTP monitoring, incident alerts, and duration-based uptime tracking for servers and APIs.",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("JwtToken");

  if (token) {
    redirect("/monitors");
  }

  const { data: plans } = await getPlans();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingPage plans={plans} />
    </>
  );
}
