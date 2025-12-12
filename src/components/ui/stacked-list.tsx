"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StackedListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const StackedList = React.forwardRef<HTMLDivElement, StackedListProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col", className)} {...props}>
      {children}
    </div>
  )
);
StackedList.displayName = "StackedList";

interface StackedListItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  showChevron?: boolean;
  muted?: boolean;
}

const StackedListItem = React.forwardRef<
  HTMLButtonElement,
  StackedListItemProps
>(
  (
    {
      className,
      children,
      icon,
      badge,
      showChevron = true,
      muted = false,
      ...props
    },
    ref
  ) => (
    <button
      ref={ref}
      className={cn(
        "min-h-[2.5rem] text-left text-sm flex items-center px-2.5 relative",
        "transition-colors duration-75",
        "hover:z-10 active:z-10 focus-visible:z-20 radix-state-open:z-10",
        "border border-gray-200 -mb-px last:mb-0",
        "first:rounded-t-[10px] last:rounded-b-[10px]",
        "focus-ring",
        "hover:bg-gray-50 active:bg-gray-100 radix-state-open:bg-gray-50",
        "hover:border-gray-300 shadow-none active:border-gray-300",
        "disabled:bg-background disabled:text-gray-300 disabled:border-gray-200",
        "radix-state-open:border-gray-300",
        muted ? "text-gray-400 font-medium" : "text-foreground font-medium",
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <div className="flex min-w-0 items-center grow gap-1.5 px-1.5 py-2">
        <span className="line-clamp-1">{children}</span>
        {badge}
      </div>
      {showChevron && (
        <div className="p-1 shrink-0 text-gray-400">
          <ChevronRight className="w-4 h-4" />
        </div>
      )}
    </button>
  )
);
StackedListItem.displayName = "StackedListItem";

interface StackedListAddButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
}

const StackedListAddButton = React.forwardRef<
  HTMLButtonElement,
  StackedListAddButtonProps
>(({ className, children, icon, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "min-h-[2.5rem] text-left text-sm flex items-center px-2.5 relative",
      "transition-colors duration-75",
      "hover:z-10 active:z-10 focus-visible:z-20 radix-state-open:z-10",
      "border border-gray-200 -mb-px last:mb-0",
      "first:rounded-t-[10px] last:rounded-b-[10px]",
      "focus-ring",
      "hover:bg-gray-50 active:bg-gray-100 radix-state-open:bg-gray-50",
      "hover:border-gray-300 shadow-none active:border-gray-300",
      "disabled:bg-background disabled:text-gray-300 disabled:border-gray-200",
      "radix-state-open:border-gray-300",
      "text-gray-400 font-medium",
      className
    )}
    {...props}
  >
    {icon}
    <div className="flex min-w-0 items-center grow gap-1.5 px-1.5 py-2">
      {children}
    </div>
  </button>
));
StackedListAddButton.displayName = "StackedListAddButton";

export { StackedList, StackedListItem, StackedListAddButton };
