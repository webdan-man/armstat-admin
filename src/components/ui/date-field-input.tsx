"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  applyDateInputMask,
  extractDateInputDigits,
  formatDateInputMask,
  formatDisplayDate,
  getDateInputCaretPosition,
  parseDotDisplayDate,
} from "@/lib/format-display-date";
import { cn } from "@/lib/utils";

const MAX_DATE_INPUT_DIGITS = 8;

type DateFieldInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type" | "value" | "onChange"
> & {
  value: string;
  onChange: (value: string) => void;
};

const DateFieldInput = React.forwardRef<HTMLInputElement, DateFieldInputProps>(
  function DateFieldInput({ value, onChange, className, ...props }, ref) {
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const caretRef = React.useRef<number | null>(null);
    const caretOnInputRef = React.useRef(0);
    const [open, setOpen] = React.useState(false);
    const maskedValue = applyDateInputMask(value);
    const selectedDate = parseDotDisplayDate(maskedValue);

    const setInputRef = React.useCallback(
      (node: HTMLInputElement | null) => {
        inputRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    React.useLayoutEffect(() => {
      if (caretRef.current === null || !inputRef.current) return;
      inputRef.current.setSelectionRange(caretRef.current, caretRef.current);
      caretOnInputRef.current = caretRef.current;
      caretRef.current = null;
    }, [maskedValue]);

    const syncCaret = (event: React.SyntheticEvent<HTMLInputElement>) => {
      caretOnInputRef.current = event.currentTarget.selectionStart ?? maskedValue.length;
    };

    const updateMaskedValue = React.useCallback(
      (nextMasked: string, previousCaret: number, isDelete = false) => {
        caretRef.current = getDateInputCaretPosition(
          maskedValue,
          nextMasked,
          previousCaret,
          isDelete
        );
        onChange(nextMasked);
      },
      [maskedValue, onChange]
    );

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const caret = caretOnInputRef.current;
      const nativeEvent = event.nativeEvent as InputEvent;
      const inputType = nativeEvent.inputType ?? "";
      const isDelete = inputType.startsWith("delete");

      const prevDigits = extractDateInputDigits(maskedValue);
      const digitsBeforeCaret = extractDateInputDigits(
        maskedValue.slice(0, caret)
      ).length;

      let nextMasked: string;

      if (isDelete) {
        nextMasked = applyDateInputMask(event.target.value);
      } else {
        const insertedDigits = nativeEvent.data?.replace(/\D/g, "") ?? "";
        if (
          insertedDigits &&
          prevDigits.length + insertedDigits.length <= MAX_DATE_INPUT_DIGITS
        ) {
          const nextDigits =
            prevDigits.slice(0, digitsBeforeCaret) +
            insertedDigits +
            prevDigits.slice(digitsBeforeCaret);
          nextMasked = formatDateInputMask(nextDigits);
        } else {
          nextMasked = applyDateInputMask(event.target.value);
        }
      }

      updateMaskedValue(nextMasked, caret, isDelete);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      caretOnInputRef.current = event.currentTarget.selectionStart ?? 0;
      const input = event.currentTarget;
      const caret = caretOnInputRef.current;
      const hasSelection = input.selectionStart !== input.selectionEnd;

      if (hasSelection || caret === 0) return;

      const deleteDigitBeforeCaret = () => {
        event.preventDefault();
        const digitsBeforeCaret = extractDateInputDigits(
          maskedValue.slice(0, caret)
        ).length;
        const digits = extractDateInputDigits(maskedValue);
        const nextDigits =
          digits.slice(0, digitsBeforeCaret - 1) +
          digits.slice(digitsBeforeCaret);
        updateMaskedValue(formatDateInputMask(nextDigits), caret, true);
      };

      if (event.key === "Backspace" && maskedValue[caret - 1] === ".") {
        deleteDigitBeforeCaret();
        return;
      }

      if (event.key === "Delete" && maskedValue[caret] === ".") {
        event.preventDefault();
        const digitsBeforeCaret = extractDateInputDigits(
          maskedValue.slice(0, caret)
        ).length;
        const digits = extractDateInputDigits(maskedValue);
        const nextDigits =
          digits.slice(0, digitsBeforeCaret) + digits.slice(digitsBeforeCaret + 1);
        updateMaskedValue(formatDateInputMask(nextDigits), caret, true);
      }
    };

    return (
      <div className="relative flex items-center">
        <Input
          ref={setInputRef}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="dd.mm.yyyy"
          maxLength={10}
          value={maskedValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onClick={syncCaret}
          onSelect={syncCaret}
          className={cn("pr-9", className)}
          {...props}
        />
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="absolute right-2 flex size-6 items-center justify-center rounded text-[#575757] hover:bg-[#f3f4f6]"
              aria-label="Ընտրել ամսաթիվ"
            >
              <CalendarIcon className="size-4" aria-hidden />
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate ?? undefined}
              defaultMonth={selectedDate ?? undefined}
              onSelect={(date) => {
                if (!date) return;
                onChange(formatDisplayDate(date));
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  }
);

export { DateFieldInput };
