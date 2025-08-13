"use server";

import { cookies } from "next/headers";

export const getCookie = async (name) => {
  const cookieStore = await cookies();
  const data = cookieStore.get(name);
  return data?.value;
}

export const createCookie = async (name, data, expires, httpOnly = true) => {
  const cookieStore = await cookies();
  cookieStore.set(name, data, {
    httpOnly: httpOnly,
    secure: true,
    expires: new Date(expires * 1000),
    sameSite: "strict",
    path: "/"
  });
}

export const deleteCookie = async (name) => {
  const cookieStore = await cookies();
  const deletedCookie = cookieStore.delete(name);
  return deletedCookie;
}