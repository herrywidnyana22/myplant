import { cn } from "@/lib/utils"

type OverlayEffectProps = {
    children: React.ReactNode
    className?: string
}

export const OverlayEffect = ({children, className}: OverlayEffectProps) =>{
    return(
        <div
            className={cn(`
                absolute
                transition-opacity
                group-hover:opacity-60
                opacity-0
                bg-black`,
                className
            )}
        >
            {children}
        </div>
    )
}