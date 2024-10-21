import { cn } from "@/lib/utils";
import { KeranStatusProps } from "../types/KeranStatusType";
import { LucideIcon } from "lucide-react";

type CustrolButtonProps = {
    onClick: () => void
    className?: string 
    icon: LucideIcon 
    iconClassName: string
} & KeranStatusProps

export const ControlButton = ({
    onClick,
    className,
    switchStatus,
    runningStatus,
    progressStatus,
    iconClassName,
    icon: Icon
}: CustrolButtonProps) => {
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
                (runningStatus === "START" ||  runningStatus === "PAUSE") && 'shadow-shadow-button',
                className
            )}
        >
            <Icon className={iconClassName} />
        </button>
    );
}