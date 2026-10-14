"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, Award, Bell, CalendarDays, Check, CreditCard, Mail, MessageCircle, PenLine, Upload, User as UserIcon, Wallet } from "lucide-react";
import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/actions/profile";
import { saveMySignatureAction } from "@/actions/signatures";
import { completeOnboardingAction } from "@/actions/onboarding";
import { saveNotificationConsent } from "@/actions/notifications";
import { KtaCard } from "@/components/kta-card";
import { SubmitButton } from "@/components/submit-button";
import { alertErr, btnGhost, btnLine, btnPrimary, cardCls, inputCls } from "@/lib/ui";
import type { FormState } from "@/types/forms";

type MemberStatus = "ACTIVE" | "INACTIVE" | "ALUMNI";

export type WizardUser = {
  fullName: string;
  nim: string;
  batchYear: number;
  email: string;
  phoneNumber: string | null;
  avatarUrl: string | null;
  signatureUrl: string | null;
  ktaNumber: string;
  ktaTitle: string;
  ktaSubtitle: string | null;
  ktaPayload: string;
  memberStatus: MemberStatus;
  emailConsentActive: boolean;
};

type Step = "profile" | "signature" | "kta" | "notifications" | "tour" | "done";

const STEP_LABEL: Record<Step, string> = {
  profile: "Profil",
  signature: "Tanda tangan",
  kta: "KTA digital",
  notifications: "Notifikasi",
  tour: "Panduan singkat",
  done: "Selesai",
};
const STEP_ORDER: Step[] = ["profile", "signature", "kta", "notifications", "tour", "done"];

function initialStep(user: WizardUser): Step {
  return user.phoneNumber ? "signature" : "profile";
}

export function Wizard({ user, replay = false }: { user: WizardUser; replay?: boolean }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(() => initialStep(user));
  const [finishing, setFinishing] = useState(false);

  const finish = async () => {
    setFinishing(true);
    try {
      if (!replay) await completeOnboardingAction();
      router.replace(replay ? "/dashboard/profile" : "/dashboard");
    } catch {
      setFinishing(false);
    }
  };

  const index = STEP_ORDER.indexOf(step);

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm text-muted-foreground">Selamat datang, {user.fullName.split(" ")[0]}</p>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Kenalan sebentar</h1>
        <p className="text-sm text-muted-foreground">
          Lima langkah singkat, sekitar 2 menit. Bisa diulang dari menu Profil kapan saja.
        </p>
      </header>

      {/* Stepper */}
      <ol className="flex flex-wrap items-center gap-x-3 gap-y-2" aria-label="Langkah tutorial">
        {STEP_ORDER.slice(0, -1).map((s, i) => {
          const active = i === index;
          const done = i < index;
          return (
            <li key={s} className="flex items-center gap-3">
              <span
                className={`grid size-6 place-items-center rounded-full border text-xs font-semibold ${
                  done
                    ? "border-[var(--emerald)] bg-[var(--emerald)] text-white"
                    : active
                      ? "border-[#ffa500] bg-[#ffa500]/15 text-[var(--state-warning-fg)]"
                      : "border-input text-muted-foreground"
                }`}
                aria-hidden
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className={`text-xs ${active ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                {STEP_LABEL[s]}
                <span className="sr-only">{active ? " (sedang)" : done ? " (selesai)" : ""}</span>
              </span>
              {i < STEP_ORDER.length - 2 && <span className="hidden h-px w-6 bg-border sm:inline-block" aria-hidden />}
            </li>
          );
        })}
      </ol>

      {step === "profile" && <ProfileStep user={user} onNext={() => setStep("signature")} />}
      {step === "signature" && <SignatureStep user={user} onNext={() => setStep("kta")} />}
      {step === "kta" && <KtaStep user={user} onNext={() => setStep("notifications")} />}
      {step === "notifications" && <NotificationStep user={user} onNext={() => setStep("tour")} />}
      {step === "tour" && <TourStep onNext={() => setStep("done")} />}
      {step === "done" && <DoneStep onFinish={finish} pending={finishing} replay={replay} />}
    </div>
  );
}

/* ============== Step 1: Profil ============== */

function ProfileStep({ user, onNext }: { user: WizardUser; onNext: () => void }) {
  const [state, action] = useActionState<FormState, FormData>(updateProfileAction, {});
  useEffect(() => {
    if (state.success) onNext();
  }, [state.success, onNext]);

  return (
    <section className={`${cardCls} space-y-5 p-5 sm:p-6`}>
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Lengkapi profil</h2>
        <p className="text-sm text-muted-foreground">
          Nomor HP dipakai pengurus untuk menghubungimu soal rapat, iuran, dan kegiatan. Tidak akan dibagikan ke luar.
        </p>
      </header>

      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="phoneNumber" className="text-sm font-medium">
            Nomor HP <span className="text-[var(--state-danger-fg)]">*</span>
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            required
            autoComplete="tel"
            defaultValue={user.phoneNumber ?? ""}
            placeholder="081234567890"
            className={inputCls}
          />
          {state.fieldErrors?.phoneNumber && (
            <p className="text-xs text-[var(--state-danger-fg)]">{state.fieldErrors.phoneNumber[0]}</p>
          )}
          <p className="text-xs text-muted-foreground">Format: 08xx, 628xx, atau +628xx.</p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="avatar" className="text-sm font-medium">
            Foto profil <span className="text-muted-foreground">(opsional)</span>
          </label>
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className={`${inputCls} file:mr-3 file:rounded-sm file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm`}
          />
          {state.fieldErrors?.avatar && (
            <p className="text-xs text-[var(--state-danger-fg)]">{state.fieldErrors.avatar[0]}</p>
          )}
          <p className="text-xs text-muted-foreground">PNG/JPG, maks 2 MB. Bisa ditambahkan nanti dari Profil.</p>
        </div>

        {state.error && (
          <p role="alert" className={alertErr}>
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {state.error}
          </p>
        )}

        <SubmitButton pendingLabel="Menyimpan…" className={btnPrimary}>
          Lanjut <ArrowRight className="size-4 transition-transform duration-fast ease-[var(--ease-out)] group-hover:translate-x-0.5" aria-hidden />
        </SubmitButton>
      </form>
    </section>
  );
}

/* ============== Step 2: Tanda tangan ============== */

function SignatureStep({ user, onNext }: { user: WizardUser; onNext: () => void }) {
  const [state, action] = useActionState<FormState, FormData>(saveMySignatureAction, {});
  useEffect(() => {
    if (state.success) onNext();
  }, [state.success, onNext]);

  return (
    <section className={`${cardCls} space-y-5 p-5 sm:p-6`}>
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-[var(--state-warning-fg)]">
          <PenLine className="size-5" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide">Bisa nanti</span>
        </div>
        <h2 className="text-lg font-semibold">Unggah tanda tangan</h2>
        <p className="text-sm text-muted-foreground">
          Dipakai otomatis di surat, sertifikat, dan lembar pengesahan saat kamu jadi ketua/sekretaris/panitia. Foto tanda tangan di kertas putih lalu unggah hasilnya.
        </p>
      </header>

      {user.signatureUrl && (
        <div className="flex items-center gap-3 rounded-sm border border-[var(--emerald)]/40 bg-[var(--emerald)]/10 px-3 py-2 text-sm">
          <Check className="size-4 text-[var(--emerald)]" aria-hidden />
          Tanda tangan sudah tersimpan. Kamu bisa lanjut.
        </div>
      )}

      <form action={action} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="signature" className="text-sm font-medium">Gambar tanda tangan</label>
          <input
            id="signature"
            name="signature"
            type="file"
            accept="image/png,image/jpeg"
            className={`${inputCls} file:mr-3 file:rounded-sm file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm`}
          />
          {state.fieldErrors?.signature && (
            <p className="text-xs text-[var(--state-danger-fg)]">{state.fieldErrors.signature[0]}</p>
          )}
          <p className="text-xs text-muted-foreground">PNG/JPG. Latar putih lebih bagus. Maks 2 MB.</p>
        </div>

        {state.error && (
          <p role="alert" className={alertErr}>
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {state.error}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <SubmitButton pendingLabel="Mengunggah…" className={btnPrimary}>
            <Upload className="size-4" aria-hidden /> Simpan tanda tangan
          </SubmitButton>
          <button type="button" onClick={onNext} className={btnLine}>
            Nanti saja
          </button>
        </div>
      </form>
    </section>
  );
}

/* ============== Step 3: KTA ============== */

function KtaStep({ user, onNext }: { user: WizardUser; onNext: () => void }) {
  return (
    <section className={`${cardCls} space-y-5 p-5 sm:p-6`}>
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-[var(--state-warning-fg)]">
          <CreditCard className="size-5" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide">KTA digital</span>
        </div>
        <h2 className="text-lg font-semibold">Ini kartu anggota digitalmu</h2>
        <p className="text-sm text-muted-foreground">
          Tunjukkan QR ini ke panitia saat hadir event. Kamu juga bisa menyimpannya sebagai gambar atau membuka mode layar penuh.
        </p>
      </header>

      <KtaCard
        size="sm"
        name={user.fullName}
        nim={user.nim}
        batchYear={user.batchYear}
        ktaNumber={user.ktaNumber}
        title={user.ktaTitle}
        subtitle={user.ktaSubtitle}
        payload={user.ktaPayload}
        status={user.memberStatus}
        showActions
      />

      <div className="flex flex-wrap gap-2 pt-2">
        <button type="button" onClick={onNext} className={btnPrimary}>
          Lanjut <ArrowRight className="size-4 transition-transform duration-fast ease-[var(--ease-out)] group-hover:translate-x-0.5" aria-hidden />
        </button>
        <Link href="/dashboard/kta" className={btnLine}>
          Buka halaman KTA
        </Link>
      </div>
    </section>
  );
}

/* ============== Step 4: Notifikasi ============== */

function NotificationStep({ user, onNext }: { user: WizardUser; onNext: () => void }) {
  const [email, setEmail] = useState(user.emailConsentActive);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    setError(null);
    start(async () => {
      try {
        await saveNotificationConsent({ inapp: true, email, whatsapp: false });
        onNext();
      } catch {
        setError("Gagal menyimpan preferensi. Coba lagi atau lewati dulu.");
      }
    });
  };

  return (
    <section className={`${cardCls} space-y-5 p-5 sm:p-6`}>
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-[var(--state-warning-fg)]">
          <Bell className="size-5" aria-hidden />
          <span className="text-xs font-semibold uppercase tracking-wide">Notifikasi</span>
        </div>
        <h2 className="text-lg font-semibold">Mau diingatkan soal apa?</h2>
        <p className="text-sm text-muted-foreground">
          Supaya kamu tidak lupa iuran, ketinggalan event, atau tidak tahu hasil seleksi panitia.
        </p>
      </header>

      {/* In-app (wajib) */}
      <div className="flex items-start gap-3 rounded-md border border-[var(--border-subtle)] bg-[var(--surface-2)] px-4 py-3">
        <Bell className="mt-0.5 size-5 shrink-0 text-[var(--gold-text)]" aria-hidden />
        <div className="flex-1">
          <p className="text-sm font-medium">Notifikasi di dalam aplikasi</p>
          <p className="text-sm text-muted-foreground">
            Bagian dari layanan — muncul di bell icon setiap kali ada yang butuh perhatianmu.
            Tidak bisa dimatikan.
          </p>
        </div>
      </div>

      {/* Email (opsional) */}
      <div className="flex items-start gap-3">
        <Mail className="mt-0.5 size-5 shrink-0 text-[var(--gold-text)]" aria-hidden />
        <div className="flex-1">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={email}
              onChange={(e) => setEmail(e.target.checked)}
              className="mt-0.5 size-4 accent-[#ffa500]"
            />
            <span>
              <span className="block text-sm font-medium">
                Email <span className="text-muted-foreground">(opsional)</span>
              </span>
              <span className="block text-sm text-muted-foreground">
                Pengingat iuran, hasil seleksi, dan event — dikirim ke{" "}
                <strong className="font-medium text-foreground">{user.email}</strong>.
              </span>
            </span>
          </label>
        </div>
      </div>

      {/* WhatsApp (disabled) */}
      <div className="flex items-start gap-3 opacity-70">
        <MessageCircle className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-hidden />
        <div className="flex-1">
          <p className="flex items-center gap-2 text-sm font-medium">
            WhatsApp
            <span className="rounded-md bg-[var(--surface-2)] px-2 py-0.5 text-xs font-medium text-muted-foreground">
              Segera hadir
            </span>
          </p>
          <p className="text-sm text-muted-foreground">
            Pengingat yang sama, tapi langsung ke WhatsApp. Bisa dimatikan kapan saja.
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className={alertErr}>
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {error}
        </p>
      )}

      <p className="text-xs text-muted-foreground">
        Preferensi bisa diubah kapan saja di menu <strong>Notifikasi → Pengaturan</strong>.
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={handleSave} className={btnPrimary}>
          {pending ? "Menyimpan…" : "Simpan & lanjut"}
          {!pending && <ArrowRight className="size-4 transition-transform duration-fast ease-[var(--ease-out)] group-hover:translate-x-0.5" aria-hidden />}
        </button>
        <button type="button" disabled={pending} onClick={onNext} className={btnGhost}>
          Lewati dulu
        </button>
      </div>
    </section>
  );
}

/* ============== Step 5: Tour ============== */

function TourStep({ onNext }: { onNext: () => void }) {
  const items = [
    {
      icon: CalendarDays,
      title: "Daftar event",
      desc: "Buka menu Event, pilih kegiatan, dan tiket QR muncul otomatis. Tunjukkan ke panitia saat hadir.",
    },
    {
      icon: Wallet,
      title: "Iuran kas bulanan",
      desc: "Tagihan muncul di menu Iuran Kas. Transfer ke bendahara, lalu unggah foto bukti transfernya.",
    },
    {
      icon: Award,
      title: "Sertifikat & piagam",
      desc: "Setelah hadir event, sertifikatmu siap diunduh dari menu Sertifikat.",
    },
    {
      icon: UserIcon,
      title: "Profil & tanda tangan",
      desc: "Ubah foto, nomor HP, atau tanda tangan kapan saja dari menu Profil.",
    },
  ];

  return (
    <section className={`${cardCls} space-y-5 p-5 sm:p-6`}>
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Empat hal yang sering dipakai</h2>
        <p className="text-sm text-muted-foreground">Cukup diingat sekarang, semua bisa dibuka dari dashboard.</p>
      </header>

      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map(({ icon: Icon, title, desc }) => (
          <li key={title} className="rounded-sm border border-border p-4">
            <Icon className="size-5 text-[var(--state-warning-fg)]" aria-hidden />
            <p className="mt-2 font-medium">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </li>
        ))}
      </ul>

      <button type="button" onClick={onNext} className={btnPrimary}>
        Mengerti, lanjut <ArrowRight className="size-4 transition-transform duration-fast ease-[var(--ease-out)] group-hover:translate-x-0.5" aria-hidden />
      </button>
    </section>
  );
}

/* ============== Step 6: Selesai ============== */

function DoneStep({ onFinish, pending, replay }: { onFinish: () => void; pending: boolean; replay: boolean }) {
  return (
    <section className={`${cardCls} space-y-5 p-5 text-center sm:p-8`}>
      <div className="mx-auto grid size-16 place-items-center rounded-full bg-[var(--state-success-bg)]">
        <Check className="size-8 text-[var(--emerald)]" aria-hidden />
      </div>
      <div className="space-y-2">
        <h2 className="s-display s-title text-2xl text-[var(--s-head)]">{replay ? "Panduan selesai" : "Siap dipakai"}</h2>
        <p className="text-sm text-muted-foreground">
          {replay
            ? "Bisa dibuka lagi kapan saja dari menu Profil → Buka panduan."
            : "Tutorial selesai. Kalau lupa caranya, buka menu Profil → Buka panduan."}
        </p>
      </div>
      <button
        type="button"
        onClick={onFinish}
        disabled={pending}
        className={`${btnPrimary} mx-auto`}
      >
        {pending ? "Membuka…" : replay ? "Kembali ke Profil" : "Ke dashboard"}
        <ArrowRight className="size-4 transition-transform duration-fast ease-[var(--ease-out)] group-hover:translate-x-0.5" aria-hidden />
      </button>
    </section>
  );
}
