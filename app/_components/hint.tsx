'use client'

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"



type HintProps={
    children: React.ReactNode
    label: string
    side?: "top" | "bottom" | "right" | "left"
    align?: "start" | "center" | "end"
}

export const Hint = ({
    children,
    label,
    side,
    align,
}: HintProps) => {
    return ( 
        <TooltipProvider>
            <Tooltip delayDuration={50}>
                <TooltipTrigger asChild>
                    {children}
                </TooltipTrigger>
                <TooltipContent
                    side={side}
                    align={align}
                    className="
                        border
                        border-white/5
                        text-white
                        bg-black
                    "
                >
                    <p
                        className="
                            text-xs
                            font-medium
                        "
                    >
                        { label }

                    </p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}