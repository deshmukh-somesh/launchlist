import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import { trpc } from "@/app/_trpc/client";
import React from "react";

interface CategorySelectProps {
  selectedCategories: string[];
  onSelect: (categories: string[]) => void;
  disabled?: boolean;
}

export function CategorySelect({ 
  selectedCategories = [],
  onSelect, 
  disabled 
}: CategorySelectProps) {
  const [open, setOpen] = useState(false);
  const { data: categories, isLoading } = trpc.category.getAllCategories.useQuery();
  const [search, setSearch] = useState("");

  // Ensure we have a flat array of categories for the command menu
  const flattenedCategories = React.useMemo(() => {
    if (!categories) return [];
    
    // Get root categories (no parentId)
    const rootCategories = categories.filter(cat => !cat.parentId);
    
    // Get subcategories (has parentId)
    const subCategories = categories.filter(cat => cat.parentId);
    
    // Sort by order
    return [...rootCategories, ...subCategories].sort((a, b) => a.order - b.order);
  }, [categories]);

  // Filter categories based on search
  const filteredCategories = React.useMemo(() => {
    if (!search.trim()) return flattenedCategories;
    
    const searchLower = search.toLowerCase();
    return flattenedCategories.filter(category => 
      category.name.toLowerCase().includes(searchLower) ||
      category.description?.toLowerCase().includes(searchLower)
    );
  }, [flattenedCategories, search]);

  console.log('CategorySelect render:', {
    selectedCategories,
    categories,
    isLoading
  });

  if (isLoading) {
    console.log('CategorySelect: Loading...');
    return (
      <Button disabled className="w-full justify-between opacity-50">
        Loading categories...
      </Button>
    );
  }

  if (!categories || categories.length === 0) {
    console.log('CategorySelect: No categories found');
    return (
      <Button disabled className="w-full justify-between opacity-50">
        No categories available
      </Button>
    );
  }

  console.log('CategorySelect: Rendering with categories:', categories.length);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            "bg-[#151725] border-[#2A2B3C] text-white",
            "hover:bg-[#1A1C2E] hover:border-[#6E3AFF]",
            !selectedCategories.length && "text-gray-500"
          )}
          disabled={disabled}
        >
          {selectedCategories.length > 0
            ? `${selectedCategories.length} categories selected`
            : "Select categories..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0 bg-[#151725] border-[#2A2B3C]">
        <Command className="bg-transparent">
          <CommandInput 
            placeholder="Search categories..." 
            value={search}
            onValueChange={setSearch}
            className="text-white"
          />
          <CommandList>
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {filteredCategories.map((category) => {
                const isSelected = selectedCategories.includes(category.id);
                const parentName = category.parentId 
                  ? categories.find(c => c.id === category.parentId)?.name 
                  : null;

                return (
                  <CommandItem
                    key={category.id}
                    onSelect={() => {
                      const newSelection = isSelected
                        ? selectedCategories.filter(id => id !== category.id)
                        : [...selectedCategories, category.id];
                      onSelect(newSelection);
                    }}
                    className="text-white hover:bg-[#1A1C2E] cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Check className={cn(
                        "h-4 w-4",
                        isSelected ? "opacity-100" : "opacity-0"
                      )} />
                      <span>{category.name}</span>
                      {parentName && (
                        <span className="text-sm text-gray-400">
                          in {parentName}
                        </span>
                      )}
                    </div>
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