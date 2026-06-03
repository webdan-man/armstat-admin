import type { Attribute, AttributeValue } from "@/types/attribute";

const hasTextValue = (value?: string) => Boolean(value?.trim());

export function valueHasSecondaryTitle(value: AttributeValue): boolean {
  return Object.values(value.secondaryTitle ?? {}).some((title) => hasTextValue(title));
}

export function libraryHasTwoLevels(attribute: Attribute | null | undefined): boolean {
  return attribute?.values?.some(valueHasSecondaryTitle) ?? false;
}

export function sameValueIds(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((id, index) => id === sortedB[index]);
}

export function buildLibraryOptions(
  attributes: Attribute[] | undefined,
  category: string
): { value: string; label: string }[] {
  if (!attributes || !category) return [];
  const rows: { value: string; label: string }[] = [];
  for (const attr of attributes.filter((a) => a.category === category)) {
    rows.push({
      value: attr._id,
      label: attr.title?.hy?.trim() || attr._id,
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
  // TODO: NO idea, please check v._id
  const val = attr?.values.find((v) => v._id === valueKey);
  if (!attr || !val) return `${attributeId}:${valueKey}`;

  return val.title?.hy ?? val._id;
}
