'use client'

import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Pause, Play, Square } from "lucide-react";
import { DotStatus } from "./dot-status";
import { KeranStatusProps } from "../types/KeranStatusType";
import { ControlButton } from "./control-button";
import { useEffect, useRef, useState } from "react";

import TimeCountdown from "./time-countdown";
import { usePublish } from "../hooks/use-publish";
import { DurationButton } from "./duration-button";
import { toast } from "sonner";
import { useConfirm } from "../hooks/use-confirm";
import CustomDurationPicker from "./custom-duration-picker";

export type CardItemProps={
    id:number
    label: string
    mode: "TIMER" | "NO TIMER"
    duration: number
    time: number
} & KeranStatusProps

export const CardItem = ({
    id,
    duration,
    label,
    mode,
    status,
    time

}: CardItemProps) => {
    const { publishMessage } = usePublish()
    const [durationActive, setDurationActive] = useState("")
    const [onDuration, setOnDuration] = useState(duration)
    const [onMode, setOnMode] = useState(mode)
    const [onStatus, setOnStatus] = useState(status)

    const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

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

    }
    const controlKeran = (action: typeof status) => {
        
        const topic = 'myplant/control'
       
        const msgSuccess =`${label} ${action} berhasil...`
        const msgError =`${label} ${action} gagal...`

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

        controlKeran(action)
    }

    const handleDurationSelect = (duration: number) => {
        setSelectedDuration(duration)
        console.log("Selected Duration in Minutes:", duration)
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
                className={cn(`
                    w-64
                    flex
                    flex-col
                    gap-2
                    justify-between
                    p-6
                    rounded-3xl
                    transition-shadow
                    shadow-card-shadow
                    bg-primary-1`, 
                    onStatus === "RUNNING" && 'shadow-card-shadow-inner scale-95'
                    
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
                            text-xl 
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
                    (onMode === "TIMER") &&
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
                        <DurationButton
                            id={`${id}90menit`}
                            status={status}
                            initDuration={duration}
                            duration={90}
                            durationActive={durationActive} 
                            setDurationActive={setDurationActive}
                            setOnDuration={setOnDuration}
                        />
                        <DurationButton
                            id={`${id}60menit`}
                            status={status}
                            initDuration={duration}
                            duration={60}
                            durationActive={durationActive} 
                            setDurationActive={setDurationActive}
                            setOnDuration={setOnDuration}
                        />
                        <DurationButton
                            id={`${id}45menit`}
                            status={status}
                            initDuration={duration}
                            duration={45}
                            durationActive={durationActive} 
                            setOnDuration={setOnDuration}
                            setDurationActive={setDurationActive}
                        />
                        <DurationButton
                            id={`${id}30menit`}
                            status={status}
                            initDuration={duration}
                            duration={30}
                            durationActive={durationActive} 
                            setOnDuration={setOnDuration}
                            setDurationActive={setDurationActive}
                        />
                        <DurationButton
                            id={`${id}5menit`}
                            status={status}
                            initDuration={duration}
                            duration={5}
                            durationActive={durationActive} 
                            setOnDuration={setOnDuration}
                            setDurationActive={setDurationActive}
                        />
                        <DurationButton
                            id={`${id}3menit`}
                            status={status}
                            initDuration={duration}
                            duration={3}
                            durationActive={durationActive} 
                            setDurationActive={setDurationActive}
                            setOnDuration={setOnDuration}
                        />
                    </div>

                    )

                }
                <div 
                    className="
                        flex 
                        justify-between 
                        items-center 
                        gap-2
                    "
                >
                    <ControlButton
                        onClick={() => handleControlButton("OFF")}
                        status={onStatus}
                        icon={Square}
                        iconClassName={"size-5 bg-rose-500 text-rose-500 rounded-sm"}
                        className={(onStatus === "RUNNING" ||  onStatus === "PAUSED") 
                            ? 'shadow-shadow-button' 
                            : undefined
                        }
                    />
                    <ControlButton 
                        onClick={() => handleControlButton("RUNNING")}
                        status={onStatus}
                        icon={Play}
                        iconClassName={"size-8 text-font-primary"}
                        className={onStatus === "RUNNING" 
                            ? 'shadow-shadow-button-active'
                            : 'shadow-shadow-button'
                        }
                    />
                    <ControlButton 
                        onClick={() => handleControlButton("PAUSED")}
                        status={onStatus}
                        icon={Pause}
                        iconClassName={"size-5"}
                        className={onStatus === "PAUSED"  || onStatus !== "RUNNING"
                            ? 'shadow-shadow-button-active'
                            : 'shadow-shadow-button'
                        }
                    />
                </div>

                <div>
                    <CustomDurationPicker onSelect={handleDurationSelect} />
                        {selectedDuration !== null && (
                            <p className="mt-4 text-lg">Selected Duration: {selectedDuration} minutes</p>
                        )}
                </div>
            </div>
    </>
    )
}