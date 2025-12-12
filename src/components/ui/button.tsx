"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium focus-ring disabled:pointer-events-auto transition-colors duration-150",
  {
    variants: {
      variant: {
        default:
          "bg-foreground text-background hover:bg-gray-800 active:bg-gray-700 disabled:bg-gray-400 disabled:text-gray-300",
        secondary:
          "bg-background hover:bg-gray-alpha-50 active:bg-gray-alpha-100 text-foreground border border-gray-alpha-200 hover:border-gray-alpha-300 shadow-none disabled:bg-background disabled:text-gray-300 disabled:border-gray-alpha-200",
        ghost:
          "bg-transparent hover:bg-gray-alpha-100 active:bg-gray-alpha-200 text-foreground disabled:bg-transparent disabled:text-gray-400",
        destructive:
          "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 disabled:bg-red-300",
        link: "text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 rounded-[10px]",
        sm: "h-8 px-3 text-xs rounded-lg",
        lg: "h-10 px-6 rounded-[10px]",
        xl: "h-12 px-8 text-base rounded-xl",
        icon: "h-9 w-9 p-0 rounded-[10px]",
        "icon-sm": "h-8 w-8 p-0 rounded-lg",
        "icon-lg": "h-10 w-10 p-0 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        data-loading={loading}
        {...props}
      >
        {loading ? (
          <>
            <span className="opacity-0">{children}</span>
            <span className="absolute inset-0 flex items-center justify-center">
              <svg
                className="h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
