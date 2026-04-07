import type { Attribute } from "@/types/attribute";

export function buildLibraryOptions(
  attributes: Attribute[] | undefined,
  category: string
): { value: string; label: string }[] {
  if (!attributes || !category) return [];
  const rows: { value: string; label: string }[] = [];
  for (const attr of attributes.filter((a) => a.category === category)) {
    rows.push({
      value: attr._id,
      label: attr.key,
    });
  }

  return rows;
}

export function buildLibraryDisplay(
  attributes: Attribute[],
  attributeId: string,
  valueKey: string
): string {
  const attr = attributes.find((a) => a._id === attributeId);
  const val = attr?.values.find((v) => v.key === valueKey);
  if (!attr || !val) return `${attributeId}:${valueKey}`;

  return val.translations?.am ?? val.key;
}
