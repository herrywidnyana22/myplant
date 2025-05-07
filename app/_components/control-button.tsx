import { cn } from "@/lib/utils";
import { KeranStatusProps } from "../types/KeranStatusType";
import { LucideIcon, Loader2 } from "lucide-react";

type ControlButtonProps = {
    onClick: () => void
    className?: string 
    icon: LucideIcon 
    iconClassName: string
    isLoading?: boolean
} & KeranStatusProps

export const ControlButton = ({
    onClick,
    className,
    iconClassName,
    isLoading,
    icon: Icon
}: ControlButtonProps) => {
    return ( 
        <button
            onClick={onClick}
            disabled={isLoading}
            className={cn(`
                p-3
                rounded-full
                transition-shadow
                bg-white
                shadow-shadow-button-active
                disabled:opacity-50
                disabled:cursor-not-allowed`,
                className
            )}
            >
            {
                isLoading 
                ? (
                    <Loader2 className={cn(iconClassName, "animate-spin bg-transparent")} />
                ) : (
                    <Icon className={iconClassName} />
                )
            }
        </button>
    );
}