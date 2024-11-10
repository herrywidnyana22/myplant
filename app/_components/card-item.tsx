'use client'

import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { DotStatus } from "./dot-status";
import { KeranStatusProps } from "../types/KeranStatusType";
import { useEffect, useRef, useState } from "react";

import { usePublish } from "../hooks/use-publish";
import { DurationButton } from "./duration-button";
import { toast } from "sonner";
import { useConfirm } from "../hooks/use-confirm";
import { durationOptionData } from "../data/duration-option";
import { DurationButtonNew } from "./duration-button-new";

import CustomDurationPicker from "./custom-duration-picker";
import TimeCountdown from "./time-countdown";
import { ControlButtonGroup } from "./control-button-group";

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
    const [onMode, setOnMode] = useState(mode)
    const [onStatus, setOnStatus] = useState(status)
    
    const [onDuration, setOnDuration] = useState(duration)
    const [durationActive, setDurationActive] = useState("")
    const [newDuration, setNewDuration]= useState(isNewDuration ? duration : 0)
    const [isDurationNewActive, setIsDurationNewActive] = useState(false)


    const [ConfirmMode, confirm] = useConfirm(
        `Yakin ingin mengubah ke mode ${onMode === "NO TIMER" ? "AUTO TIMER" : "MANUAL TIMER"}?`,
        "Ini akan mematikan keran dan mereset waktu terlebih dahulu"
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
                    transform: collapse ? `translateY(${id * -65}%)` : `translateY(0)`
                }}
                className={cn(`
                    relative
                    w-64
                    flex
                    flex-col
                    justify-between
                    p-6
                    rounded-3xl
                    shadow-card-shadow
                    transition-all  
                    duration-500 
                    bg-primary-1`, 
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
                <ControlButtonGroup 
                    status={onStatus}
                    className={onStatus === "RUNNING" ? 'shadow-card-shadow-inner mt-2' : undefined}
                    handleStop={() => handleControlButton("OFF")}
                    handlePlay={() => handleControlButton("RUNNING")}
                    handlePause={() => handleControlButton("PAUSED")}
                />
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