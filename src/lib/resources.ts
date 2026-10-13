export const RESOURCE_CATEGORIES = [
  { value: "MODUL", label: "Modul & Materi" },
  { value: "TEMPLATE", label: "Template" },
  { value: "PANDUAN", label: "Panduan" },
  { value: "LAINNYA", label: "Lainnya" },
] as const;

export const categoryLabel = (v: string) => RESOURCE_CATEGORIES.find((c) => c.value === v)?.label ?? v;
