import React from "react";

/** Fallback class merge utility */
function cn(...classes: (string | undefined | null | false)[]) {
    return classes.filter(Boolean).join(" ");
}

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: "success" | "warning" | "danger" | "neutral" | "brand";
    size?: "sm" | "md";
    dot?: boolean; // If true, renders a small colored circle indicator before the text
}

export function Badge({ className, variant = "neutral", size = "sm", dot = false, children, ...props }: BadgeProps) {
    const baseStyles = "inline-flex items-center font-medium rounded-full";

    const variants = {
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        danger: "bg-red-100 text-red-800",
        neutral: "bg-gray-100 text-gray-700",
        brand: "bg-blue-100 text-blue-800",
    };

    const dotColors = {
        success: "bg-green-500",
        warning: "bg-yellow-500",
        danger: "bg-red-500",
        neutral: "bg-gray-400",
        brand: "bg-blue-600",
    };

    const sizes = {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-1 text-sm",
    };

    return (
        <span className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
            {dot && (
                <span className={cn("inline-block w-1.5 h-1.5 rounded-full mr-1.5", dotColors[variant])} />
            )}
            {children}
        </span>
    );
}
