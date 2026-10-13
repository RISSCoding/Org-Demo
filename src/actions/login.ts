"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import type { FormState } from "@/types/forms";

const safeRedirect = (v: FormDataEntryValue | null) => {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/dashboard";
};

export async function loginAction(_: FormState, formData: FormData): Promise<FormState> {
  try {
    await signIn("credentials", {
      identifier: String(formData.get("identifier") ?? ""),
      password: String(formData.get("password") ?? ""),
      redirectTo: safeRedirect(formData.get("callbackUrl")),
    });
    return {};
  } catch (e) {
    if (e instanceof AuthError) {
      return { error: "NPM/email atau password salah, atau akun belum disetujui pengurus." };
    }
    throw e; // NEXT_REDIRECT must propagate
  }
}

export async function logoutAction() {
  await signOut({ redirectTo: "/login" });
}
