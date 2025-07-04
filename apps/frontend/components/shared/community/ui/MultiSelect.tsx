"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Badge } from "@repo/ui";
import { Button } from "@repo/ui";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@repo/ui";
import { Popover, PopoverContent, PopoverTrigger } from "@repo/ui";
import { cn } from "@repo/ui/lib/utils";

export type Option = {
  label: string;
  value: string;
  disabled?: boolean;
};

interface MultiSelectProps {
  options: Option[];
  placeholder?: string;
  defaultValue?: Option[];
  value?: Option[];
  onChange?: (options: Option[]) => void;
}

export function MultiSelect({
  options,
  placeholder = "Select options",
  defaultValue = [],
  value,
  onChange,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const isControlled = value !== undefined;
  const [selected, setSelected] = React.useState<Option[]>(
    defaultValue.filter((opt) => !opt.disabled)
  );
  const selectedOptions = isControlled ? value! : selected;

  const handleSelect = React.useCallback(
    (option: Option) => {
      if (option.disabled) return; 
      const isSelected = selectedOptions.some(
        (item) => item.value === option.value
      );
      const newSelected = isSelected
        ? selectedOptions.filter((item) => item.value !== option.value)
        : [...selectedOptions, option];
      if (!isControlled) setSelected(newSelected);
      onChange?.(newSelected);
    },
    [isControlled, onChange, selectedOptions]
  );

  // const handleRemove = React.useCallback(
  //   (option: Option) => {
  //     const newSelected = selectedOptions.filter(
  //       (item) => item.value !== option.value
  //     );
  //     if (!isControlled) setSelected(newSelected);
  //     onChange?.(newSelected);
  //   },
  //   [isControlled, onChange, selectedOptions]
  // );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full h-auto justify-between"
        >
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1 mr-2">
              {selectedOptions.map((option) => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {option.label}
                </Badge>
              ))}
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="text-left">
              {options.map((option) => {
                const isSelected = selectedOptions.some(
                  (item) => item.value === option.value
                );
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleSelect(option)}
                    className={cn(
                      "justify-start",
                      option.disabled && "opacity-50 pointer-events-none"
                    )}
                    aria-disabled={option.disabled}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50"
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3" />}
                    </div>
                    <span>{option.label}</span>
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
