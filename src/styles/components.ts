// Reusable component styles - single source of truth for common styling patterns
import { cva, type VariantProps } from 'class-variance-authority';

// Card component styles
export const cardVariants = cva(
  "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-border",
        outlined: "border-2 border-border",
        elevated: "shadow-lg border-0",
        filled: "bg-muted border-0",
        interactive: "hover:shadow-md hover:scale-[1.02] cursor-pointer"
      },
      padding: {
        none: "p-0",
        sm: "p-3",
        md: "p-4",
        lg: "p-6",
        xl: "p-8"
      },
      radius: {
        none: "rounded-none",
        sm: "rounded-sm",
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full"
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      radius: "lg"
    }
  }
);

// Container styles for consistent layout
export const containerVariants = cva(
  "mx-auto w-full",
  {
    variants: {
      size: {
        sm: "max-w-2xl",
        md: "max-w-4xl",
        lg: "max-w-6xl",
        xl: "max-w-7xl",
        full: "max-w-full"
      },
      padding: {
        none: "px-0",
        sm: "px-4",
        md: "px-6",
        lg: "px-8"
      }
    },
    defaultVariants: {
      size: "lg",
      padding: "md"
    }
  }
);

// Grid layout styles
export const gridVariants = cva(
  "grid gap-4",
  {
    variants: {
      cols: {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
        auto: "grid-cols-[repeat(auto-fit,minmax(250px,1fr))]"
      },
      gap: {
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
        xl: "gap-8"
      }
    },
    defaultVariants: {
      cols: "auto",
      gap: "md"
    }
  }
);

// Flex layout styles
export const flexVariants = cva(
  "flex",
  {
    variants: {
      direction: {
        row: "flex-row",
        col: "flex-col",
        "row-reverse": "flex-row-reverse",
        "col-reverse": "flex-col-reverse"
      },
      align: {
        start: "items-start",
        center: "items-center",
        end: "items-end",
        stretch: "items-stretch",
        baseline: "items-baseline"
      },
      justify: {
        start: "justify-start",
        center: "justify-center",
        end: "justify-end",
        between: "justify-between",
        around: "justify-around",
        evenly: "justify-evenly"
      },
      wrap: {
        nowrap: "flex-nowrap",
        wrap: "flex-wrap",
        "wrap-reverse": "flex-wrap-reverse"
      },
      gap: {
        none: "gap-0",
        sm: "gap-2",
        md: "gap-4",
        lg: "gap-6",
        xl: "gap-8"
      }
    },
    defaultVariants: {
      direction: "row",
      align: "center",
      justify: "start",
      wrap: "nowrap",
      gap: "md"
    }
  }
);

// Text styles
export const textVariants = cva(
  "text-foreground",
  {
    variants: {
      size: {
        xs: "text-xs",
        sm: "text-sm",
        base: "text-base",
        lg: "text-lg",
        xl: "text-xl",
        "2xl": "text-2xl",
        "3xl": "text-3xl",
        "4xl": "text-4xl"
      },
      weight: {
        normal: "font-normal",
        medium: "font-medium",
        semibold: "font-semibold",
        bold: "font-bold"
      },
      color: {
        default: "text-foreground",
        muted: "text-muted-foreground",
        primary: "text-primary",
        secondary: "text-secondary",
        destructive: "text-destructive",
        success: "text-green-600 dark:text-green-400",
        warning: "text-yellow-600 dark:text-yellow-400"
      },
      align: {
        left: "text-left",
        center: "text-center",
        right: "text-right",
        justify: "text-justify"
      }
    },
    defaultVariants: {
      size: "base",
      weight: "normal",
      color: "default",
      align: "left"
    }
  }
);

// Loading skeleton styles
export const skeletonVariants = cva(
  "animate-pulse bg-muted rounded",
  {
    variants: {
      variant: {
        text: "h-4 w-full",
        title: "h-6 w-3/4",
        avatar: "h-10 w-10 rounded-full",
        button: "h-10 w-24",
        card: "h-32 w-full",
        image: "aspect-square w-full"
      }
    },
    defaultVariants: {
      variant: "text"
    }
  }
);

// Status indicator styles
export const statusVariants = cva(
  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
        warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
        error: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
        info: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
        pending: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

// Animation styles
export const animationVariants = cva(
  "transition-all",
  {
    variants: {
      duration: {
        fast: "duration-150",
        normal: "duration-300",
        slow: "duration-500"
      },
      easing: {
        linear: "ease-linear",
        in: "ease-in",
        out: "ease-out",
        "in-out": "ease-in-out"
      }
    },
    defaultVariants: {
      duration: "normal",
      easing: "in-out"
    }
  }
);

// Form field styles
export const formFieldVariants = cva(
  "space-y-2",
  {
    variants: {
      state: {
        default: "",
        error: "[&>input]:border-destructive [&>textarea]:border-destructive",
        success: "[&>input]:border-green-500 [&>textarea]:border-green-500"
      }
    },
    defaultVariants: {
      state: "default"
    }
  }
);

// Export variant prop types for TypeScript
export type CardVariants = VariantProps<typeof cardVariants>;
export type ContainerVariants = VariantProps<typeof containerVariants>;
export type GridVariants = VariantProps<typeof gridVariants>;
export type FlexVariants = VariantProps<typeof flexVariants>;
export type TextVariants = VariantProps<typeof textVariants>;
export type SkeletonVariants = VariantProps<typeof skeletonVariants>;
export type StatusVariants = VariantProps<typeof statusVariants>;
export type AnimationVariants = VariantProps<typeof animationVariants>;
export type FormFieldVariants = VariantProps<typeof formFieldVariants>;