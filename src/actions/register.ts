"use server";

import { registerMember } from "@/actions/auth";
import type { FormState } from "@/types/forms";

export async function registerAction(_: FormState, formData: FormData): Promise<FormState> {
  const phone = String(formData.get("phoneNumber") ?? "").trim();
  const res = await registerMember({
    nim: String(formData.get("nim") ?? "").trim(),
    fullName: String(formData.get("fullName") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
    batchYear: formData.get("batchYear"),
    phoneNumber: phone || undefined,
  });
  if (!res.ok) return { error: res.error, fieldErrors: res.fieldErrors };
  return { success: "Pendaftaran berhasil. Akunmu akan aktif setelah disetujui pengurus." };
}
