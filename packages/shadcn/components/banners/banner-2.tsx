"use client";

import { X, ChevronsRight } from "lucide-react";

export function Banner2() {
  return (
    <aside 
      role="banner"
      aria-label="Promotion announcement"
      className="flex items-center bg-zinc-950 px-6 py-3 relative"
    >
      <a
        href="#"
        className="flex items-center justify-start gap-2 w-full cursor-pointer"
        aria-label="Learn more about shadcn/ui kit Pro blocks"
      >
        <span className="text-sm text-white hover:underline">
          <span className="font-semibold">New update</span> · Pro blocks are now
          available in shadcn/ui kit for Figma!
        </span>
        <ChevronsRight className="hidden md:block w-4 h-4 text-white" />
      </a>
      <button 
        onClick={() => {/* Add close handler */}}
        className="absolute right-2 w-8 h-8 flex items-center justify-center rounded-md hover:bg-white/10"
        aria-label="Close announcement"
      >
        <X className="size-4 text-white" />
        <span className="sr-only">Close</span>
      </button>
    </aside>
  );
}
