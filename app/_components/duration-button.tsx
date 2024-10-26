import { cn } from "@/lib/utils"
import { CardItemProps } from "./card-item"

type DurationButtonProps = {
    id: string
    status: CardItemProps['status']
    initDuration: number
    duration: number 
    durationActive: string
    setDurationActive: (durationActive: string) => void
    setOnDuration:  (duration: number) => void
    className?: string 
}

export const DurationButton = ({
    id,
    status,
    initDuration,
    duration,
    durationActive,
    setDurationActive,
    setOnDuration,
    className,
}: DurationButtonProps) => {
    const hoursDecimal = (duration / 60).toFixed(1)

    const dots = []
    for (let i = 1; i <= 60; i++) { // 60 iterations
        const rotation = i * 6; // Calculate rotation for each dot
        dots.push(
            <div
                key={i}
                className={cn(`
                    dot 
                    absolute 
                    w-[3px] 
                    h-[1px] 
                    right-[89%]
                    origin-[22px]`,
                    id === durationActive || 
                    (initDuration === duration && 
                    status === "RUNNING") 
                    ? 'bg-emerald-500'
                    : 'bg-orange-500'
                )}
                style={{ transform: `rotate(${rotation}deg)` }}
            />
        )
    }

    const handleClickDuration = () =>{
        setDurationActive(id)
        setOnDuration(duration)
    }

    return ( 
            <div
                onClick={handleClickDuration}
                className={cn(`
                    relative
                    w-12
                    h-12
                    flex
                    justify-center
                    items-center
                    rounded-full
                    transition-shadow
                    cursor-pointer
                    text-slate-400
                    bg-white`,
                    id === durationActive || (initDuration === duration && status==="RUNNING")
                    ? 'shadow-shadow-button'
                    : 'shadow-shadow-button-active',
                    status === "RUNNING" && initDuration !== duration ? "opacity-50 pointer-events-none" : "",
                    className
                )}
            >
                { dots }
                <div 
                    className="
                        flex 
                        flex-col 
                        items-center 
                        justify-center
                    "
                >
                {
                    duration >= 60 
                    ?   <>
                            <p className="text-[12px] font-extrabold">{hoursDecimal}</p>
                            <p className="text-[10px]">Jam</p>
                        </>
                    :   <>
                            <p className="text-[12px] font-extrabold">{duration}</p>
                            <p className="text-[10px]">Menit</p>
                        </>
                }
                </div>
            </div>
    );
}