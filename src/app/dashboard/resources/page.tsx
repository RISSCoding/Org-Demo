import { ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { RESOURCE_CATEGORIES } from "@/lib/resources";
import { cardCls } from "@/lib/ui";

export const metadata = { title: "Materi — ORG" };
export const dynamic = "force-dynamic";

export default async function MemberResources() {
  const items = await prisma.resource.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="s-display s-title text-3xl text-[var(--s-head)]">Materi</h1>
        <p className="text-sm text-muted-foreground">Materi, template, dan panduan dari pengurus.</p>
      </div>

      {items.length === 0 ? (
        <p className={`${cardCls} p-6 text-sm text-muted-foreground`}>Belum ada materi.</p>
      ) : (
        RESOURCE_CATEGORIES.map((c) => {
          const list = items.filter((i) => i.category === c.value);
          if (list.length === 0) return null;
          return (
            <section key={c.value} className="space-y-2">
              <h2 className="text-lg font-semibold">{c.label}</h2>
              <ul className={`${cardCls} divide-y divide-border`}>
                {list.map((r) => (
                  <li key={r.id}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-3 p-4 hover:bg-muted/50">
                      <span>
                        <span className="font-medium">{r.title}</span>
                        {r.description && <span className="block text-sm text-muted-foreground">{r.description}</span>}
                      </span>
                      <ExternalLink className="mt-1 size-4 shrink-0 text-muted-foreground" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
