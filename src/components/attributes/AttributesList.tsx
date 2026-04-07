"use client";

import React, { useMemo, useState } from "react";
import useSWR, { useSWRConfig } from "swr";
import {
  deleteAttribute,
  fetchAttributeCategories,
  fetchAttributes,
  saveAttributeLibrary,
} from "@/services/attributeService";
import { swrKeys } from "@/lib/swr/cache-keys";
import { Loader2 } from "lucide-react";
import AttributesExportButton from "@/components/attributes/AttributesExportButton";
import ImportAttributes from "@/components/attributes/ImportAttributes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LangSwitcher } from "@/components/main/LangSwitcher";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { withToastError } from "@/lib/withToastError";
import AttributesTable from "@/components/attributes/AttributesTable";

const categoryTranslations: Record<string, string> = {
  gender: "Սեռ",
  time: "Ժամանակ",
  province: "Մարզեր",
  age: "Տարիք",
  area: "Տարացք",
  other: "Այլ",
};

export default function AttributesList() {
  const { data, isLoading } = useSWR(swrKeys.attributes, fetchAttributes);
  const { data: categories = [] } = useSWR(swrKeys.attributesCategories, fetchAttributeCategories);
  const { mutate } = useSWRConfig();

  const [categoryFilter, setCategoryFilter] = useState<string>("__all__");
  const [idFilter, setIdFilter] = useState<string>("__all__");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formSaving, setFormSaving] = useState(false);
  const [formCategory, setFormCategory] = useState<string>("");
  const [nameLang, setNameLang] = useState<"am" | "ru" | "en">("am");
  const [formNames, setFormNames] = useState<{ am: string; ru: string; en: string }>({
    am: "",
    ru: "",
    en: "",
  });

  const attributeIds = useMemo(() => {
    if (categoryFilter === "__all__") return [];
    const set = new Set<string>();
    const shouldInclude =
      categoryFilter === "__all__" ? () => true : (category: string) => category === categoryFilter;

    for (const a of data ?? []) {
      if (shouldInclude(a.category)) set.add(a._id);
    }

    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [data, categoryFilter]);

  const selectedAttribute = useMemo(() => {
    if (!data || idFilter === "__all__") return undefined;
    return data.find((a) => a._id === idFilter);
  }, [data, idFilter]);

  const filtered = useMemo(() => {
    if (!data || idFilter === "__all__") return [];
    return data.filter((a) => {
      if (categoryFilter !== "__all__" && a.category !== categoryFilter) return false;
      return !(idFilter !== "__all__" && a._id !== idFilter);
    });
  }, [data, categoryFilter, idFilter]);

  const openCreate = () => {
    setModalMode("create");
    setFormCategory(categoryFilter !== "__all__" ? categoryFilter : "");
    setFormNames({ am: "", ru: "", en: "" });
    setNameLang("am");
    setModalOpen(true);
  };

  const onEdit = () => {
    const attribute = selectedAttribute;
    if (!attribute) return;

    setModalMode("edit");
    setFormCategory(attribute.category || "");
    setFormNames({
      am: String(attribute.translations.am ?? ""),
      ru: String(attribute.translations.ru ?? ""),
      en: String(attribute.translations.en ?? ""),
    });
    setNameLang("am");
    setModalOpen(true);
  };

  const onDelete = async () => {
    if (!selectedAttribute) return;
    try {
      await deleteAttribute(selectedAttribute._id);

      toast.success("Ջնջված է");

      await mutate(swrKeys.attributes);
      setIdFilter("__all__");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Սխալ";
      toast.error(message);
    }
  };

  const onSave = async () => {
    if (!formCategory) return;
    const id = modalMode === "edit" ? selectedAttribute?._id : undefined;
    if (modalMode === "edit" && !id) return;

    if (!formNames.en) {
      toast.error("ԱՆգլերենը դաշտը պարտադիր է");
      return;
    }
    setFormSaving(true);
    try {
      await withToastError(
        () =>
          saveAttributeLibrary({
            mode: modalMode,
            category: formCategory,
            id,
            translations: formNames,
          }),
        {
          title: modalMode === "edit" ? "Թարմացված է" : "Ստեղծված է",
        }
      );

      await mutate(swrKeys.attributes);
      setModalOpen(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Սխալ";
      toast.error(message);
    } finally {
      setFormSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Հատկանիիշների գրադարաններ</h1>
        <Button className="bg-green-700" onClick={openCreate}>
          Նոր հատկանիշ
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <div className="my-8 flex flex-wrap gap-10">
          <label className="flex flex-col gap-2 text-sm">
            <div className="text-muted-foreground">Հատկանիշի կատեգորիա</div>
            <select
              className="border-input bg-background h-9 rounded-md border px-3 text-sm"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setIdFilter("__all__");
              }}
            >
              <option value="__all__">Ընտրել տեսակ</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {categoryTranslations[c]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2 text-sm">
            <div className="text-muted-foreground">Գրադարան</div>
            <select
              className="border-input bg-background h-9 rounded-md border px-3 text-sm"
              value={idFilter}
              onChange={(e) => setIdFilter(e.target.value)}
            >
              <option value="__all__">Ընտրել գրադարան</option>
              {attributeIds.map((id) => (
                <option key={id} value={id}>
                  {data?.find((attribute) => attribute._id === id)?.translations?.am}
                </option>
              ))}
            </select>
          </label>
        </div>

        <AttributesExportButton
          selectedId={selectedAttribute?._id ?? "__all__"}
          disabled={idFilter === "__all__" || !selectedAttribute}
        />

        <ImportAttributes
          selectedId={selectedAttribute?._id}
          onImport={() => mutate(swrKeys.attributes)}
        />

        <Button
          className="h-15 max-w-30 bg-amber-500"
          onClick={onEdit}
          disabled={idFilter === "__all__"}
        >
          Խմբագրել գրադարանը
        </Button>
        <Button
          className="bg-destructive h-15 max-w-30"
          onClick={onDelete}
          disabled={idFilter === "__all__"}
        >
          Հեռացնել գրադարանը
        </Button>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{modalMode === "edit" ? "Խմբագրել հատկանիշ" : "Նոր հատկանիշ"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <div className="text-muted-foreground text-sm">Կատեգորիա</div>
              <Select
                value={formCategory || undefined}
                onValueChange={(v) => setFormCategory(v)}
                disabled={formSaving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ընտրել" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {categoryTranslations[c]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-muted-foreground text-sm">Անվանում</div>
                <LangSwitcher value={nameLang} onChange={setNameLang} />
              </div>
              <Input
                value={formNames[nameLang]}
                onChange={(e) => setFormNames((p) => ({ ...p, [nameLang]: e.target.value }))}
                disabled={formSaving}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Չեղարկել
            </Button>
            <Button type="button" onClick={onSave} disabled={formSaving || !formCategory}>
              {formSaving ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Պահպանել
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!!filtered.length && <AttributesTable attributes={filtered} />}

      {isLoading && (
        <div className="flex w-full justify-center py-2">
          <Loader2 className="size-13 animate-spin" />
        </div>
      )}
    </div>
  );
}
