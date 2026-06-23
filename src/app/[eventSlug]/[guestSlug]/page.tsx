import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import GuestPageClient from "@/components/GuestPageClient";
import { getSettings, getGifts } from "@/app/actions";

interface PageProps {
  params: Promise<{ eventSlug: string; guestSlug: string }>;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function generateMetadata({ params }: PageProps) {
  const { eventSlug } = await params;
  const event = await prisma.event.findUnique({ where: { slug: eventSlug } });
  if (!event) return {};

  const settings = await getSettings(event.id);
  const prefix = settings.babyGender === "GIRL" ? "DA" : settings.babyGender === "BOY" ? "DO" : "DE";
  const title = settings.babyName ? `CHÁ ${prefix} ${settings.babyName}` : "CHÁ DE BEBÊ";
  const description = settings.eventDate
    ? `Confirme sua presença no Chá de Bebê! ${new Date(settings.eventDate).toLocaleString('pt-BR', { dateStyle: 'long' })}`
    : "Confirme sua presença!";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: settings.invitationUrl ? [{ url: settings.invitationUrl, width: 800, height: 1000 }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: settings.invitationUrl ? [settings.invitationUrl] : [],
    },
  };
}

export default async function GuestPage({ params }: PageProps) {
  const { eventSlug, guestSlug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug: eventSlug }
  });
  if (!event) notFound();

  const settings = await getSettings(event.id);
  const gifts = await getGifts(event.id);

  const guest = await prisma.guest.findUnique({
    where: { eventId_slug: { eventId: event.id, slug: guestSlug } },
  });

  if (!guest) notFound();

  const FONT_VAR_MAP: Record<string, string> = {
    "Playfair Display": "var(--font-playfair)",
    "Cormorant Garamond": "var(--font-cormorant)",
    "Dancing Script": "var(--font-dancing)",
    "Great Vibes": "var(--font-great-vibes)",
    "Lora": "var(--font-lora)",
    "Cinzel": "var(--font-cinzel)",
  };

  const inviteFontFamily = FONT_VAR_MAP[settings.inviteFont || "Playfair Display"] || "var(--font-playfair)";
  const inviteFontSize = settings.inviteFontSize || 18;

  const eventDateStr = settings.eventDate
    ? new Date(settings.eventDate).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' })
    : null;

  const isBoy = settings.babyGender === "BOY";
  const isGirl = settings.babyGender === "GIRL";
  const prefix = isGirl ? "DA" : isBoy ? "DO" : "DE";
  const babyName = "CHÁ DE BEBÊ";
  const rawBabyName = settings.babyName || "CHÁ DE BEBÊ";

  const genderColor = isBoy ? "text-sky-700" : isGirl ? "text-rose-700" : "text-primary";
  const genderBorder = isBoy ? "border-sky-200" : isGirl ? "border-rose-200" : "border-primary/20";
  const genderBgLight = isBoy ? "bg-sky-50" : isGirl ? "bg-rose-50" : "bg-primary/5";
  const genderFromBg = isBoy ? "from-sky-100" : isGirl ? "from-rose-100" : "from-primary/10";
  const genderToBg = isBoy ? "to-sky-50" : isGirl ? "to-rose-50" : "to-background";

  return (
    <GuestPageClient
      babyName={babyName}
      rawBabyName={rawBabyName}
      inviteFontFamily={inviteFontFamily}
      inviteFontSize={inviteFontSize}
      eventDateStr={eventDateStr}
      isBoy={isBoy}
      isGirl={isGirl}
      genderColor={genderColor}
      genderBorder={genderBorder}
      genderBgLight={genderBgLight}
      genderFromBg={genderFromBg}
      genderToBg={genderToBg}
      settings={JSON.parse(JSON.stringify(settings))}
      giftList={JSON.parse(JSON.stringify(gifts))}
      guestData={{
        nome: guest.nome, slug: guest.slug, status_confirmacao: guest.status_confirmacao,
        tipo: guest.tipo, membros: guest.membros,
        membros_confirmados: guest.membros_confirmados, fralda_tamanho: guest.fralda_tamanho,
        kit_churrasco: guest.kit_churrasco
      }}
      eventId={event.id}
    />
  );
}
