"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function setActiveEventCookie(eventId: string) {
  const cookieStore = await cookies();
  cookieStore.set("activeEventId", eventId, { path: "/", maxAge: 60 * 60 * 24 * 30 }); // 30 days
  revalidatePath("/", "layout");
}

export async function clearActiveEventCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("activeEventId");
  revalidatePath("/", "layout");
}

export async function checkActiveEventCookie() {
  const cookieStore = await cookies();
  return !!cookieStore.get("activeEventId");
}
