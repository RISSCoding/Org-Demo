import { EventForm } from "@/components/event-form";
import { requirePermission } from "@/lib/rbac";

export const metadata = { title: "Buat Event — HIMMAN UKRI" };

export default async function NewEvent() {
  await requirePermission("event:manage");
  return (
    <div className="space-y-6">
      <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Buat event</h1>
      <EventForm />
    </div>
  );
}
