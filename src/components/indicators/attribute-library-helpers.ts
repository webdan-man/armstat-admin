import type { Attribute } from "@/types/attribute";

export function buildLibraryOptions(
  attributes: Attribute[] | undefined,
  category: string
): { value: string; label: string }[] {
  if (!attributes || !category) return [];
  const rows: { value: string; label: string }[] = [];
  for (const attr of attributes.filter((a) => a.category === category)) {
    for (const v of attr.values) {
      const labelAm = v.translations?.am ?? v.key;
      rows.push({
        value: `${attr.key}:${v.key}`,
        label: labelAm,
      });
    }
  }
  return rows;
}

export function buildLibraryDisplay(
  attributes: Attribute[],
  attributeKey: string,
  valueKey: string
): string {
  const attr = attributes.find((a) => a.key === attributeKey);
  const val = attr?.values.find((v) => v.key === valueKey);
  if (!attr || !val) return `${attributeKey}:${valueKey}`;

  return val.translations?.am ?? val.key;
}
