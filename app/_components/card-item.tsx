'use client'

import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Pause, Play, Square } from "lucide-react";
import { DotStatus } from "./dot-status";
import { KeranStatusProps } from "../types/KeranStatusType";
import { ControlButton } from "./control-button";
import { useEffect, useRef, useState } from "react";

import { usePublish } from "../hooks/use-publish";
import { DurationButton } from "./duration-button";
import { toast } from "sonner";
import { useConfirm } from "../hooks/use-confirm";
import { durationOptionData } from "../data/duration-option";
import { DurationButtonNew } from "./duration-button-new";

import CustomDurationPicker from "./custom-duration-picker";
import TimeCountdown from "./time-countdown";

export type CardItemProps={
    id:number
    label: string
    mode: "TIMER" | "NO TIMER"
    duration: number
    time: number
    collapse?: boolean
} & KeranStatusProps

export const CardItem = ({
    id,
    duration,
    label,
    mode,
    status,
    time,
    collapse,
}: CardItemProps) => {

    const isNewDuration = !durationOptionData.some(option => option.duration === duration);
    
    const { publishMessage } = usePublish()
    const [durationActive, setDurationActive] = useState("")
    const [onDuration, setOnDuration] = useState(duration)
    const [onMode, setOnMode] = useState(mode)
    const [onStatus, setOnStatus] = useState(status)

    const [newDuration, setNewDuration]= useState(isNewDuration ? duration : 0)
    const [isDurationNewActive, setIsDurationNewActive] = useState(false)


    const [ConfirmMode, confirm] = useConfirm(
        "Yakin ingin mengubah ke mode TIMER?",
        "Ini akan mematikan keran terlebih dahulu"
    )

    // Ref to store the previous onMode
    const prevModeRef = useRef(mode)


    const onSwitchChange = async() =>{
        const modeValue:CardItemProps['mode'] = onMode === "TIMER" ? "NO TIMER" : "TIMER"
        
        if(onStatus === "RUNNING"){
            const isOk = await confirm()
            if(!isOk) return

            controlKeran("OFF")
        } 
        
        setOnDuration(0)
        setOnStatus("OFF")
        setOnMode(modeValue)
        setIsDurationNewActive(false)

    }
    const controlKeran = (action: typeof status) => {
        
        const topic = 'myplant/control'
       
        const msgSuccess =`${label} berhasil ${action}...`
        const msgError =`${label} gagal ${action}...`

        const msg = JSON.stringify({
                        keranID: id,
                        status: action,
                        duration: onDuration
                    })
        
        publishMessage({topic, msg, msgSuccess, msgError})
    }

    const handleControlButton = (action: typeof status) =>{
        if(action === "RUNNING" && onDuration === 0 && onMode === "TIMER"){
            return toast.error("Tentukan durasi terlebih dahulu")            
        }

        if(action === "RUNNING"){
            setIsDurationNewActive(false)
        }

        controlKeran(action)
    }

    const handleNewDurationSelect = (newDurasi: number) => {
        setNewDuration(newDurasi)
        setIsDurationNewActive(false)
    }

    // Update local state whenever props change
    useEffect(() => {
        setOnMode(mode)
        setOnDuration(duration)
        setOnStatus(status)
    }, [mode, status, duration])

    useEffect(() => {
        if (prevModeRef.current === "TIMER" && onStatus === "OFF") {
            setOnMode("TIMER")
            setDurationActive("")
        }
        
        prevModeRef.current = onMode
    }, [onStatus])

    return ( 
    <>
        <ConfirmMode/>
        <div
            className="
                flex 
                justify-center
                gap-2
            "
        >
            <div
                style={{
                    zIndex: id,
                    top: collapse ? `calc(0.3vh + ${id * 75}px)` : 0
                }}
                className={cn(`
                    w-64
                    flex
                    flex-col
                    justify-between
                    p-6
                    rounded-3xl
                    transition-shadow
                    shadow-card-shadow
                    bg-primary-1`, 
                    collapse
                    ? 'absolute'
                    : 'relative'
                )}
            >
                <div
                    className="
                        relative
                        flex
                        justify-between
                    "
                >
                    <DotStatus connectStatus={onStatus}/>
                    <p 
                        className="
                            absolute
                            -top-2 
                            left-1/2 
                            transform 
                            -translate-x-1/2 
                            text-md 
                            font-semibold 
                            text-font-primary
                        "
                    >
                        {label}
                    </p>
                    <Switch 
                        id="mode"
                        checked={onMode==="TIMER"}
                        onCheckedChange={onSwitchChange}
                    />
                </div>
                <div
                    className="
                        flex
                        items-center
                        justify-center
                        text-font-primary
                    "
                >
                    <div 
                        className="
                            text-muted-foreground 
                            font-bold
                        "
                    >
                        <TimeCountdown
                            initialRuntime={time} 
                            status={onStatus}
                        />
                    </div>
                </div>
                {
                    onMode === "TIMER" &&
                    (
                    <div 
                        className="
                            w-full
                            py-2
                            grid 
                            grid-cols-3 
                            gap-1 
                            justify-items-center 
                            border border-spacing-1
                            rounded-xl
                        "
                    >
                    {
                        durationOptionData.map((item, i) => (
                            <DurationButton
                                key={i}
                                id={`${id}-${item.duration}-${item.id}`}
                                status={status}
                                initDuration={duration}
                                duration={item.duration}
                                durationActive={durationActive} 
                                setDurationActive={setDurationActive}
                                setOnDuration={setOnDuration}
                            />
                        ))
                    }
                    {
                        newDuration === 0 
                        ? 
                            (
                                <DurationButtonNew
                                    isDurationNewActive={isDurationNewActive}
                                    setIsDurationNewActive={setIsDurationNewActive}
                                    className= {onStatus === "RUNNING" ? "opacity-50 pointer-events-none" : ""}
                                />

                            )
                        : 
                            (

                                <DurationButton
                                    id={`${id}-NEW-${newDuration}`}
                                    status={status}
                                    initDuration={duration}
                                    duration={newDuration}
                                    durationActive={durationActive} 
                                    setDurationActive={setDurationActive}
                                    setOnDuration={setOnDuration}
                                    setNewDuration={setNewDuration}
                                    isNew
                                />
                            )
                    }
                    </div>
                    )

                }
                <div 
                    className={cn(`
                        flex 
                        justify-between 
                        items-center 
                        gap-2
                        p-3
                        rounded-2xl`,
                        onStatus === "RUNNING" && 'shadow-card-shadow-inner mt-2'
                    )}
                >
                    <ControlButton
                        onClick={() => handleControlButton("OFF")}
                        status={onStatus}
                        icon={Square}
                        iconClassName={"size-5 bg-rose-500 text-rose-500 rounded-sm"}
                        className={(onStatus === "RUNNING" ||  onStatus === "PAUSED") 
                            ? 'shadow-shadow-button' 
                            : 'opacity-50 pointer-events-none'
                        }
                    />
                    <ControlButton 
                        onClick={() => handleControlButton("RUNNING")}
                        status={onStatus}
                        icon={Play}
                        iconClassName={"size-8 text-font-primary"}
                        className={onStatus === "RUNNING" 
                            ? 'shadow-shadow-button-active opacity-50 pointer-events-none'
                            : 'shadow-shadow-button'
                        }
                    />
                    <ControlButton 
                        onClick={() => handleControlButton("PAUSED")}
                        status={onStatus}
                        icon={Pause}
                        iconClassName={"size-5"}
                        className={onStatus === "PAUSED"  || onStatus !== "RUNNING"
                            ? 'shadow-shadow-button-active opacity-50 pointer-events-none'
                            : 'shadow-shadow-button'
                        }
                    />
                </div>
            {

                isDurationNewActive && 
                (
                    <div 
                        className="
                            py-2
                            border 
                            border-spacing-1
                            rounded-xl
                        "
                    >
                        <CustomDurationPicker onSelect={handleNewDurationSelect} />
                    </div>

                )
            
            }       
            </div>
        </div>
    </>
    )
}