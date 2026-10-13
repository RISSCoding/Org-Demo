"use client";

import { useEffect, useRef } from "react";
import { toast } from "@/components/ui/toast";
import type { FormState } from "@/types/forms";

/**
 * Memunculkan toast saat aksi formulir berhasil. Galat tetap tampil di dalam formulir
 * (di dekat kolom yang salah), karena toast hilang sendiri dan galat harus bisa dibaca ulang.
 */
export function useFormFeedback(state: FormState) {
  const seen = useRef<FormState | null>(null);
  useEffect(() => {
    if (seen.current === state) return;
    seen.current = state;
    if (state.success) toast.add({ title: state.success, type: "success" });
  }, [state]);
}

/** Arahkan fokus ke kolom pertama yang salah setelah pengiriman gagal, supaya pengguna langsung tahu harus memperbaiki apa. */
export function useFocusFirstInvalid(state: FormState, formRef: React.RefObject<HTMLFormElement | null>) {
  const seen = useRef<FormState | null>(null);
  useEffect(() => {
    if (seen.current === state) return;
    seen.current = state;
    if (!state.fieldErrors && !state.error) return;
    const el = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']");
    el?.focus({ preventScroll: false });
  }, [state, formRef]);
}

type Snapshot = { values: [string, string][]; checks: [string, boolean][] };

/**
 * React 19 mengosongkan semua kolom setelah formulir dikirim, termasuk saat server menolak isiannya.
 * Hook ini menyimpan isian sebelum dikirim dan mengembalikannya bila hasilnya galat, supaya
 * pengguna cukup memperbaiki kolom yang salah, bukan mengetik ulang semuanya.
 * Kolom password dan berkas sengaja tidak dipulihkan.
 */
export function useKeepFormValues(formRef: React.RefObject<HTMLFormElement | null>, state: FormState) {
  const snap = useRef<Snapshot | null>(null);
  const last = useRef(state);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const onSubmit = () => {
      const values: [string, string][] = [];
      const checks: [string, boolean][] = [];
      for (const el of Array.from(form.elements)) {
        if (!(el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) || !el.name) continue;
        if (el instanceof HTMLInputElement) {
          if (["file", "password", "hidden", "submit", "button"].includes(el.type)) continue;
          if (el.type === "checkbox" || el.type === "radio") {
            checks.push([`${el.name}\u0000${el.value}`, el.checked]);
            continue;
          }
        }
        values.push([el.name, el.value]);
      }
      snap.current = { values, checks };
    };
    form.addEventListener("submit", onSubmit);
    return () => form.removeEventListener("submit", onSubmit);
  }, [formRef]);

  useEffect(() => {
    if (last.current === state) return;
    last.current = state;
    const form = formRef.current;
    const s = snap.current;
    if (!form || !s || !(state.error || state.fieldErrors)) return;
    for (const [name, value] of s.values) {
      const el = form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[name="${CSS.escape(name)}"]`);
      if (el && el.value !== value) el.value = value;
    }
    for (const [key, checked] of s.checks) {
      const [name, value] = key.split("\u0000");
      const el = Array.from(form.querySelectorAll<HTMLInputElement>(`input[name="${CSS.escape(name)}"]`)).find((i) => i.value === value);
      if (el) el.checked = checked;
    }
  }, [state, formRef]);
}
