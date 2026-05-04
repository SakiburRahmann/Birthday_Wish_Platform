import { supabase } from "@/lib/supabase";
import { BirthdayPageClient } from "./BirthdayPageClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  console.log("Generating Metadata for slug:", slug);
  
  const { data: event, error } = await supabase
    .from("events")
    .select("recipient_name, bio, profile_image_url")
    .eq("slug", slug)
    .single();

  if (error || !event) {
    console.error("Metadata fetch error:", error);
    return { title: "Profile Not Found" };
  }

  const title = `Happy Birthday, ${event.recipient_name}!`;
  const description = event.bio || `A special birthday celebration page for ${event.recipient_name}.`;
  const image = event.profile_image_url || "https://birthday-wish-platform.vercel.app/og-default.png";

  return {
    title,
    description,
    openGraph: { title, description, images: [{ url: image }], type: "website" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  console.log("Rendering Page for slug:", slug);

  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) console.error("Page fetch error:", error);

  return <BirthdayPageClient initialEvent={event} slug={slug} />;
}
