"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HelpCategoryCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  isActive?: boolean;
  onClick: () => void;
}

export function HelpCategoryCard({
  icon: Icon,
  title,
  description,
  isActive = false,
  onClick,
}: HelpCategoryCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all hover:shadow-md",
        "text-center w-full min-h-[160px] justify-center",
        isActive
          ? "border-[#4169E1] bg-blue-50"
          : "border-gray-200 bg-white hover:border-gray-300"
      )}
    >
      <div
        className={cn(
          "p-3 rounded-lg",
          isActive ? "bg-[#4169E1] text-white" : "bg-gray-100 text-gray-600"
        )}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </button>
  );
}
