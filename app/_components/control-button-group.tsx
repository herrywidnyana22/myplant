import { cn } from "@/lib/utils";
import { ControlButton } from "./control-button";
import { KeranStatusProps } from "../types/KeranStatusType";
import { Pause, Play, Square } from "lucide-react";

type ControlButtonGroupProps = {
    handleStop: () => void
    handlePlay: () => void
    handlePause: () => void
    className?: string
} & KeranStatusProps

export const ControlButtonGroup = ({status, handleStop, handlePlay, handlePause, className }: ControlButtonGroupProps) => {
    return ( 
         <div 
            className={cn(`
                flex 
                justify-between 
                items-center 
                gap-2
                p-3
                rounded-2xl`,
                className
            )}
        >
            <ControlButton
                onClick={handleStop}
                status={status}
                icon={Square}
                iconClassName={"size-5 bg-rose-500 text-rose-500 rounded-sm"}
                className={(status === "RUNNING" ||  status === "PAUSED") 
                    ? 'shadow-shadow-button' 
                    : 'opacity-50 pointer-events-none'
                }
            />
            <ControlButton 
                onClick={handlePlay}
                status={status}
                icon={Play}
                iconClassName={"size-8 text-green-500"}
                className={status === "RUNNING" 
                    ? 'shadow-shadow-button-active opacity-50 pointer-events-none'
                    : 'shadow-shadow-button'
                }
            />
            <ControlButton 
                onClick={handlePause}
                status={status}
                icon={Pause}
                iconClassName={"size-5 text-orange-500"}
                className={status === "PAUSED"  || status !== "RUNNING"
                    ? 'shadow-shadow-button-active opacity-50 pointer-events-none'
                    : 'shadow-shadow-button'
                }
            />
        </div>
    );
}