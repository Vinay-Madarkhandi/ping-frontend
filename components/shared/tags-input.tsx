"use client";

import { KeyboardEvent, useState } from "react";
import { X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MAX_TAGS = 10;
const MAX_TAG_LENGTH = 30;

interface TagsInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/** Chip-style tag editor: type and press Enter/comma to add, click × or Backspace to remove. */
export function TagsInput({
  value,
  onChange,
  disabled,
  placeholder = "Add a tag…",
  className,
}: TagsInputProps) {
  const [draft, setDraft] = useState("");

  function addTag(raw: string) {
    const tag = raw.trim();
    if (!tag || tag.length > MAX_TAG_LENGTH) return;
    if (value.length >= MAX_TAGS) return;
    if (value.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  }

  function removeTag(tag: string) {
    onChange(value.filter((existing) => existing !== tag));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    } else if (event.key === "Backspace" && draft === "" && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-transparent px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring/50",
        disabled && "opacity-50",
        className
      )}
    >
      {value.map((tag) => (
        <Badge key={tag} variant="secondary" className="gap-1 pr-1 text-xs">
          {tag}
          <button
            type="button"
            disabled={disabled}
            onClick={() => removeTag(tag)}
            className="rounded-full p-0.5 hover:bg-muted-foreground/20"
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove {tag}</span>
          </button>
        </Badge>
      ))}
      <Input
        value={draft}
        disabled={disabled || value.length >= MAX_TAGS}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(draft)}
        placeholder={value.length >= MAX_TAGS ? `Max ${MAX_TAGS} tags` : placeholder}
        className="h-6 flex-1 min-w-[100px] border-0 p-0 shadow-none focus-visible:ring-0"
      />
    </div>
  );
}
