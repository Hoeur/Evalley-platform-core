"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/design-system/ui/button";
import { Input } from "@/design-system/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/design-system/ui/select";

export function ProductFilters({
  categories,
  total,
}: {
  categories: string[];
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(currentQuery);
  const deferredQuery = useDeferredValue(query);

  const update = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (!value || value === "all") params.delete(key);
    else params.set(key, value);
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (deferredQuery === currentQuery) return;
    const params = new URLSearchParams(searchParams);
    if (deferredQuery.trim()) params.set("q", deferredQuery.trim());
    else params.delete("q");
    params.set("page", "1");
    router.replace(`${pathname}?${params.toString()}`);
  }, [currentQuery, deferredQuery, pathname, router, searchParams]);

  const hasFilters = ["q", "status", "category", "stock", "sort"].some((key) =>
    searchParams.has(key),
  );

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-semibold">Catalog inventory</h2>
        <p className="text-muted-foreground text-xs">
          {total} matching product{total === 1 ? "" : "s"}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-64 flex-1 lg:max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            className="bg-background h-9 pl-9"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search product name or SKU..."
          />
        </div>
        <Select
          value={searchParams.get("status") ?? "all"}
          onValueChange={(value) => update("status", value)}
        >
          <SelectTrigger
            aria-label="Filter by status"
            className="bg-background w-[138px]"
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={searchParams.get("category") ?? "all"}
          onValueChange={(value) => update("category", value)}
        >
          <SelectTrigger
            aria-label="Filter by category"
            className="bg-background w-[150px]"
          >
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={searchParams.get("stock") ?? "all"}
          onValueChange={(value) => update("stock", value)}
        >
          <SelectTrigger
            aria-label="Filter by inventory"
            className="bg-background w-[145px]"
          >
            <SelectValue placeholder="Inventory" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All inventory</SelectItem>
            <SelectItem value="in-stock">In stock</SelectItem>
            <SelectItem value="low-stock">Low stock</SelectItem>
            <SelectItem value="out-of-stock">Out of stock</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={searchParams.get("sort") ?? "createdAt.desc"}
          onValueChange={(value) => update("sort", value)}
        >
          <SelectTrigger
            aria-label="Sort products"
            className="bg-background w-[150px]"
          >
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt.desc">Newest first</SelectItem>
            <SelectItem value="name.asc">Name A–Z</SelectItem>
            <SelectItem value="price.desc">Highest price</SelectItem>
            <SelectItem value="price.asc">Lowest price</SelectItem>
            <SelectItem value="stock.asc">Lowest stock</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery("");
              router.push(pathname);
            }}
          >
            <RotateCcw />
            Reset
          </Button>
        )}
      </div>
    </div>
  );
}
