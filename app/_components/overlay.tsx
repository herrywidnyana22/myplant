import { cn } from "@/lib/utils"

type OverlayEffectProps = {
    children: React.ReactNode
    className?: string,
    style?: React.CSSProperties;
}

export const OverlayEffect = ({children, className, style}: OverlayEffectProps) =>{
    return(
        <div
            style={style}
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