"use server";

import { cookies } from "next/headers";

export async function setCookie(key: string, value: string) {
  const cookie = cookies();
  cookie.set(key, value);
}

export async function getCookie(key: string) {
  const cookie = cookies();
  let res = cookie.get(key)?.value;
  if (!res) return ``;
  return res;
}
