import { cn } from "@/lib/utils";
import { KeranStatusProps } from "../types/KeranStatusType";
import { LucideIcon } from "lucide-react";

type ControlButtonProps = {
    onClick: () => void
    className?: string 
    icon: LucideIcon 
    iconClassName: string
} & KeranStatusProps

export const ControlButton = ({
    onClick,
    className,
    status,
    iconClassName,
    icon: Icon
}: ControlButtonProps) => {
    return ( 
        <button 
            onClick={onClick}
            className={cn(`
                p-3
                rounded-full
                transition-shadow
                text-slate-500
                bg-white
                shadow-shadow-button-active`,
                (status !== "OFF") && 'shadow-shadow-button',
                className
            )}
        >
            <Icon className={iconClassName} />
        </button>
    );
}