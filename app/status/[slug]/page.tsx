import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublicStatusPage } from "@/lib/api/status-pages";
import { PublicStatusPageContent } from "@/components/shared/public-status-page-content";
import { StatusPagePasswordGate } from "@/components/shared/status-page-password-gate";

interface StatusPagePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: StatusPagePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { data, error } = await getPublicStatusPage(slug);

  if (error?.status === 401) {
    return { title: "Password required", robots: { index: false, follow: false } };
  }

  if (!data) {
    return { title: "Status page not found" };
  }

  const title = `${data.title} Status`;
  const description =
    data.description || `Live uptime and status for ${data.title}.`;

  return {
    title,
    description,
    alternates: { canonical: `/status/${slug}` },
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary", title, description },
    robots: { index: true, follow: true },
  };
}

export default async function PublicStatusPage({ params }: StatusPagePageProps) {
  const { slug } = await params;
  const { data: page, error } = await getPublicStatusPage(slug);

  if (error?.status === 401) {
    return <StatusPagePasswordGate slug={slug} />;
  }

  if (error?.status === 404 || !page) {
    notFound();
  }

  return <PublicStatusPageContent page={page} />;
}
