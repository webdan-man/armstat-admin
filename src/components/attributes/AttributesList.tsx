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
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import AttributesExportButton from "@/components/attributes/AttributesExportButton";
import ImportAttributes from "@/components/attributes/ImportAttributes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormItem } from "@/components/ui/form";
import { FieldLabel } from "@/components/ui/field";
import { withToastError } from "@/lib/withToastError";
import AttributesTable from "@/components/attributes/AttributesTable";

export default function AttributesList() {
  const { data, isLoading } = useSWR(swrKeys.attributes, fetchAttributes);
  const { data: categories = [] } = useSWR(swrKeys.attributesCategories, fetchAttributeCategories);
  const { mutate } = useSWRConfig();

  const [categoryFilter, setCategoryFilter] = useState<string>("__all__");
  const [idFilter, setIdFilter] = useState<string>("__all__");
  const [librarySearch, setLibrarySearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [formSaving, setFormSaving] = useState(false);
  const [formCategory, setFormCategory] = useState<string>("");
  const [formName, setFormName] = useState("");

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
  const getAttributeLabel = (id: string): string => {
    const attribute = data?.find((item) => item._id === id);
    return attribute?.title?.hy ?? id;
  };

  const filteredAttributeIds = useMemo(() => {
    const query = librarySearch.trim().toLowerCase();
    if (!query) return attributeIds;
    return attributeIds.filter((id) => getAttributeLabel(id).toLowerCase().includes(query));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributeIds, librarySearch, data]);

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
    setFormName("");
    setModalOpen(true);
  };

  const onEdit = () => {
    const attribute = selectedAttribute;
    if (!attribute) return;

    setModalMode("edit");
    setFormCategory(attribute.category || "");
    setFormName(String(attribute.title.hy ?? ""));
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

    if (!formName) {
      toast.error("Հայերենը դաշտը պարտադիր է");
      return;
    }
    setFormSaving(true);
    try {
      const saved = await withToastError(
        () =>
          saveAttributeLibrary({
            mode: modalMode,
            category: formCategory,
            id,
            title: { hy: formName, ru: "", en: "" },
          }),
        {
          title: modalMode === "edit" ? "Թարմացված է" : "Ստեղծված է",
        }
      );

      await mutate(swrKeys.attributes);

      if (modalMode === "create" && saved) {
        setCategoryFilter(saved.category);
        setIdFilter(saved._id);
      }

      setModalOpen(false);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Սխալ";
      toast.error(message);
    } finally {
      setFormSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col gap-5 pb-10">
      <div className="sticky top-0 z-10 flex min-h-11 w-full flex-col gap-4 bg-[#f9fafb] pt-7 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl leading-6 font-medium text-[#2c2c2c]">Հատկանիիշների գրադարաններ</h1>
        <Button
          type="button"
          className="h-11 shrink-0 rounded-lg border-0 bg-[#004d99] px-5 text-[13px] font-medium text-white hover:bg-[#004080]"
          onClick={openCreate}
        >
          <Plus />
          Նոր հատկանիշ
        </Button>
      </div>

      <div className="rounded-[10px] bg-white p-6 shadow-[0_6px_14px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <FormItem className="flex w-full max-w-[320px] flex-col gap-2 text-sm">
              <FieldLabel className="text-muted-foreground">Հատկանիշի կատեգորիա</FieldLabel>
              <Select
                value={categoryFilter}
                onValueChange={(value) => {
                  setCategoryFilter(value);
                  setIdFilter("__all__");
                }}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Ընտրել տեսակ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Ընտրել տեսակ</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.title.hy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>

            <FormItem className="flex w-full max-w-[320px] flex-col gap-2 text-sm">
              <FieldLabel className="text-muted-foreground">Գրադարան</FieldLabel>
              <Select
                value={idFilter}
                onValueChange={(value) => setIdFilter(value)}
                onOpenChange={(open) => {
                  if (!open) setLibrarySearch("");
                }}
                disabled={categoryFilter === "__all__" || attributeIds.length === 0}
              >
                <SelectTrigger className="h-9 w-full">
                  <SelectValue placeholder="Ընտրել գրադարան" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="w-(--radix-select-trigger-width)"
                >
                  <div className="sticky top-0 z-10 bg-popover p-1">
                    <Input
                      autoFocus
                      value={librarySearch}
                      placeholder="Որոնել"
                      className="h-8"
                      onChange={(e) => setLibrarySearch(e.target.value)}
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  <SelectItem value="__all__">Ընտրել գրադարան</SelectItem>
                  {filteredAttributeIds.length === 0 ? (
                    <div className="px-2 py-2 text-sm text-muted-foreground">Արդյունք չկա</div>
                  ) : (
                    filteredAttributeIds.map((id) => (
                      <SelectItem key={id} value={id}>
                        {getAttributeLabel(id)}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </FormItem>
          </div>

          <div className="flex flex-col gap-4 border-t border-[#eef0f2] pt-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={onEdit}
                disabled={idFilter === "__all__"}
              >
                <Pencil />
                Խմբագրել
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <AttributesExportButton
                selectedId={selectedAttribute?._id ?? "__all__"}
                disabled={idFilter === "__all__" || !selectedAttribute}
              />

              <ImportAttributes
                selectedId={selectedAttribute?._id}
                onImport={() => mutate(swrKeys.attributes)}
              />

              <Button
                variant="destructive"
                size="sm"
                className="h-9"
                onClick={onDelete}
                disabled={idFilter === "__all__"}
              >
                <Trash2 />
                Հեռացնել
              </Button>
            </div>
          </div>
        </div>
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
                  {categories.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.title.hy}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-3">
              <div className="text-muted-foreground text-sm">Անվանում</div>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
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

      {!isLoading && idFilter === "__all__" && (
        <div className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-[13px]">
          Ընտրեք գրադարան՝ տվյալները ցուցադրելու համար
        </div>
      )}

      {!isLoading && idFilter !== "__all__" && filtered.length === 0 && (
        <div className="text-muted-foreground rounded-md border border-dashed p-6 text-center text-[13px]">
          Ընտրված գրադարանի համար տվյալներ չեն գտնվել
        </div>
      )}

      {filtered.length > 0 && <AttributesTable attributes={filtered} />}

      {isLoading && (
        <div className="flex w-full justify-center py-2">
          <Loader2 className="size-13 animate-spin" />
        </div>
      )}
    </div>
  );
}
