"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoryForm } from "@/components/forms/CategoryForm";

export function AddCategoryButton({
  label = "Nova categoria",
  variant = "secondary",
}: {
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant={variant} onClick={() => setOpen(true)}>
        <Plus className="size-4" /> {label}
      </Button>
      <CategoryForm open={open} onClose={() => setOpen(false)} />
    </>
  );
}
