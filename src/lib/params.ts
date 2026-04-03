"use server";

import { cookies } from "next/headers";

export async function setCookie(key: string, value: string) {
  const cookieStore = await cookies();
  cookieStore.set(key, value);
}

export async function getCookie(key: string) {
  const cookieStore = await cookies();
  let res = cookieStore.get(key)?.value;
  if (!res) return ``;
  return res;
}
