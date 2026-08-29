import { getTags } from "@/api/tags.api";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import type { GetTagsResponse, Tag } from "@/types/api";
import { ApiError } from "@/types/error";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type TagComboboxMultipleProps = {
  selectedTags: Tag[];
  setSelectedTags: (tags: Tag[]) => void;
};

// Internal-only shape; `isNew` never leaks outside this component.
type ComboboxOption = Tag & { isNew?: boolean };

const tagKey = (t: Tag) => t.name.toLowerCase();

export function TagComboboxMultiple({
  selectedTags,
  setSelectedTags,
}: TagComboboxMultipleProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const anchor = useComboboxAnchor();

  useEffect(() => {
    let cancelled = false;

    const fetchTags = async () => {
      try {
        const res: GetTagsResponse = await getTags();
        if (!cancelled) setAvailableTags(res.data.tags);
      } catch (err) {
        if (cancelled) return;
        toast.error(err instanceof ApiError ? err.message : "An error occurred while getting tags");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchTags();
    return () => {
      cancelled = true;
    };
  }, []);

  const trimmedInput = inputValue.trim();
  const hasExactMatch = useMemo(
    () => availableTags.some((tag) => tagKey(tag) === trimmedInput.toLowerCase()),
    [availableTags, trimmedInput]
  );

  // Append a synthetic "create new tag" option only when the typed text
  // doesn't already match a real tag. This is what ComboboxEmpty used to
  // communicate as static text — now it's a real, selectable item.
  const comboboxItems: ComboboxOption[] = useMemo(() => {
    if (!trimmedInput || hasExactMatch) return availableTags;
    return [...availableTags, { name: trimmedInput, isNew: true }];
  }, [availableTags, trimmedInput, hasExactMatch]);

  const handleValueChange = (values: ComboboxOption[]) => {
    const resolved: Tag[] = [];
    let created: Tag | null = null;

    for (const v of values) {
      if (v.isNew) {
        const newTag: Tag = { name: v.name };
        resolved.push(newTag);
        created = newTag;
      } else {
        resolved.push(v);
      }
    }

    if (created) {
      setAvailableTags((prev) => [...prev, created!]);
    }

    setSelectedTags(resolved);
    setInputValue("");
  };

  // Safety net only: stops Enter from bubbling to a parent <form> submit.
  // Actual tag creation/selection is handled by onValueChange above.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.preventDefault();
  };

  return (
    <Combobox
      multiple
      autoHighlight
      items={comboboxItems}
      value={selectedTags}
      onValueChange={handleValueChange}
    >
      <ComboboxChips ref={anchor} className="w-full">
        <ComboboxValue>
          {(values: Tag[]) => (
            <>
              {values.map((tag) => (
                <ComboboxChip key={tagKey(tag)}>{tag.name}</ComboboxChip>
              ))}
              <ComboboxChipsInput
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isLoading ? "Loading tags..." : "Add tags..."}
                disabled={isLoading}
              />
            </>
          )}
        </ComboboxValue>
      </ComboboxChips>

      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>No tags found.</ComboboxEmpty>

        {/* Scroll instead of growing unbounded when the list is long. */}
        <ComboboxList className="max-h-60 overflow-y-auto">
          {(item: ComboboxOption) => (
            <ComboboxItem key={tagKey(item)} value={item}>
              {item.isNew ? `Create "${item.name}"` : item.name}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}