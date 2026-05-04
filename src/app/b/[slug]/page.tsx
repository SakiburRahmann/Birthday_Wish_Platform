import { supabase } from "@/lib/supabase";
import { BirthdayPageClient } from "./BirthdayPageClient";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: event } = await supabase
    .from("events")
    .select("recipient_name, bio, profile_image_url")
    .eq("slug", params.slug)
    .single();

  if (!event) {
    return {
      title: "Profile Not Found",
    };
  }

  const title = `Happy Birthday, ${event.recipient_name}!`;
  const description = event.bio || `A special birthday celebration page for ${event.recipient_name}.`;
  const image = event.profile_image_url || "https://birthday-wish-platform.vercel.app/og-default.png";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `Birthday celebration for ${event.recipient_name}`,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function Page({ params }: Props) {
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("slug", params.slug)
    .single();

  return <BirthdayPageClient initialEvent={event} slug={params.slug} />;
}
