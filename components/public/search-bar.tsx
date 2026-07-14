"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function SearchBar({
  initialQuery = "",
  action = "/search",
  placeholder = "Search articles…",
}: {
  initialQuery?: string;
  action?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`${action}?${params.toString()}`);
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full gap-2">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="flex-1"
      />
      <Button type="submit" size="default">
        <Search className="size-4" />
        Search
      </Button>
    </form>
  );
}
