import React, { forwardRef } from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",
        outline: "text-foreground border-border hover:bg-accent",
        // iOS-inspired variants
        ios: "border-transparent bg-gradient-to-r from-primary/90 to-primary text-primary-foreground shadow-sm backdrop-blur-sm",
        glass: "glass text-foreground border-border/50 backdrop-blur-xl",
        notification: "border-transparent bg-destructive text-destructive-foreground shadow-lg animate-pulse",
        chip: "border-border bg-secondary/50 text-secondary-foreground hover:bg-secondary/80 haptic-feedback cursor-pointer"
      },
      size: {
        default: "h-5 px-2.5 text-xs",
        sm: "h-4 px-2 text-xs",
        lg: "h-6 px-3 text-sm",
        icon: "h-5 w-5 p-0 justify-center"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dismissible?: boolean
  onDismiss?: () => void
}

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, size, dismissible, onDismiss, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {children}
        {dismissible && (
          <button
            onClick={onDismiss}
            className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    )
  }
)
Badge.displayName = "Badge"

export { Badge, badgeVariants }