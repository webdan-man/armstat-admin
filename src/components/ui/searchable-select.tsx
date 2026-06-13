"use client";

import * as React from "react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type SearchableSelectOption = {
  value: string;
  /** Plain text used for filtering and as the default rendered label. */
  label: string;
  /** Extra text to match against when searching. */
  keywords?: string;
  disabled?: boolean;
  /** Custom node rendered inside the dropdown item (falls back to `label`). */
  node?: React.ReactNode;
  itemClassName?: string;
};

type SearchableSelectProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  options: SearchableSelectOption[];
  /** Options that are always shown and never filtered (e.g. an "all" reset item). */
  leadingOptions?: SearchableSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  triggerClassName?: string;
  contentClassName?: string;
  /** Only render the search box when the number of options is at least this. */
  minOptionsForSearch?: number;
  /** Sort options alphabetically (A→Z) by label. Defaults to true. */
  sort?: boolean;
};

export function SearchableSelect({
  value,
  onValueChange,
  options,
  leadingOptions = [],
  placeholder = "Ընտրել",
  searchPlaceholder = "Որոնել",
  emptyText = "Արդյունք չկա",
  disabled,
  triggerClassName,
  contentClassName,
  minOptionsForSearch = 1,
  sort = true,
}: SearchableSelectProps) {
  const [search, setSearch] = React.useState("");

  const showSearch = options.length >= minOptionsForSearch;

  const sortedOptions = React.useMemo(() => {
    if (!sort) return options;
    return [...options].sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" })
    );
  }, [options, sort]);

  const filteredOptions = React.useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sortedOptions;
    return sortedOptions.filter((option) =>
      `${option.label} ${option.keywords ?? ""}`.toLowerCase().includes(query)
    );
  }, [sortedOptions, search]);

  const renderItem = (option: SearchableSelectOption) => (
    <SelectItem
      key={option.value}
      value={option.value}
      disabled={option.disabled}
      className={option.itemClassName}
    >
      {option.node ?? option.label}
    </SelectItem>
  );

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      onOpenChange={(open) => {
        if (!open) setSearch("");
      }}
    >
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent
        position="popper"
        className={cn("w-(--radix-select-trigger-width)", contentClassName)}
      >
        {showSearch && (
          <div className="bg-popover sticky top-0 z-10 p-1">
            <Input
              autoFocus
              value={search}
              placeholder={searchPlaceholder}
              className="h-8"
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => event.stopPropagation()}
            />
          </div>
        )}
        {leadingOptions.map(renderItem)}
        {filteredOptions.length === 0 ? (
          <div className="text-muted-foreground px-2 py-2 text-sm">{emptyText}</div>
        ) : (
          filteredOptions.map(renderItem)
        )}
      </SelectContent>
    </Select>
  );
}
