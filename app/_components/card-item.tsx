'use client'

import { cn } from "@/lib/utils";
import { useConfirm } from "../hooks/use-confirm";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { SetupDialog } from "./setup-dialog";
import { Switch } from "@/components/ui/switch";
import { useStopwatch } from "react-timer-hook";
import { Pause, Play, Square, StopCircle } from "lucide-react";
import { DotStatus } from "./dot-status";

type CardItemProps={
    status: "ON" | "OFF"
    mode?: "AUTO" | "MANUAL"
    runStatus?: "RUNNING" | "DELAYED" | "PAUSED" | "OFF"
    label: string
    playStatus?: "START" | "PAUSE" | "STOP" | null
}

const ONE_HOUR_IN_SECONDS = 3600

export const CardItem = ({
    status,
    mode= "AUTO" ,
    runStatus="OFF",
    label,
    playStatus

}: CardItemProps) => {

    const [modeValue, setModeValue] = useState<string>(
        () => localStorage.getItem('mode') || mode
    )
    const [storedTime, setStoredTime] = useState<number>(0)
    const [onStatus, setOnStatus] = useState(playStatus)
    const [onRunStatus, setOnRunStatus] = useState(runStatus)

    const onSwitchChange = async() =>{
        const newMode = modeValue === "AUTO" ? "MANUAL" : "AUTO";
        setModeValue(newMode)
        localStorage.setItem('mode', newMode)
    }

    const {
        seconds,
        minutes,
        hours,
        start,
        pause,
        reset,
    } = useStopwatch({ autoStart: false });

    useEffect(() => {
        const savedTime = localStorage.getItem('stopwatch-time');
        if (savedTime) {
            setStoredTime(Number(savedTime));
        }
    }, [])

    // Update the stopwatch time based on localStorage time
    useEffect(() => {
        if (storedTime > 0) {
            const startTime = new Date();
            startTime.setSeconds(startTime.getSeconds() - storedTime); // Subtract the stored time from the current time
            reset(startTime, false); // Reset using the adjusted date
        }
    }, [storedTime, reset])

    // Save the stopwatch time in local storage on every second update
    useEffect(() => {
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;
        if (totalSeconds > 0) {
            localStorage.setItem('stopwatch-time', totalSeconds.toString());
        }
    }, [seconds, minutes, hours]);

    // Stop the timer if it reaches 1 hour
    useEffect(() => {
        if (hours * 3600 + minutes * 60 + seconds >= ONE_HOUR_IN_SECONDS) {
            pause();
        }
    }, [hours, minutes, seconds, pause]);


    const resetTimer = () => {
        reset(0, false); // Reset to zero
        localStorage.removeItem('stopwatch-time'); // Clear localStorage
    }

    const onStart = (value: typeof playStatus) =>{
        setOnStatus(value)
        
        if(value === "START"){
            setOnRunStatus("RUNNING")
            start()
        }

        if(value === "PAUSE"){
            setOnRunStatus("DELAYED")
            pause()
        }

        if(value === "STOP"){
            setOnRunStatus("OFF")
            resetTimer()
        }
    }

    return ( 
    <>
        {/* <SetupDialog
            label={`Atur ${label}`}
            isChecked={isCentang}
            setIsChecked={setIsCentang}
            isOpen={setupOpen}
            setIsOpen={setSetupOpen}
        /> */}
        <div
            className={cn(`
                peer
                relative
                bg-primary-1`,
                !status
                ? 'cursor-not-allowed opacity-50 pointer-events-none'
                : 'cursor-pointer'
            )}
        >
            <div
                className="
                    size-64
                    flex
                    flex-col
                    justify-between
                    p-6
                    list-none
                    rounded-3xl
                    transition-shadow
                    shadow-card-shadow 
                    peer-checked:shadow-card-shadow-inner
                    peer-checked:scale-95
                "
            >
                <div
                    className="
                        flex
                        justify-between
                    "
                >
                    <DotStatus status={"CONNECTED"}/>
                    <Switch 
                        id="mode"
                        checked={modeValue==="MANUAL"}
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

                    <h1
                        className="
                            text-3xl
                            font-bold
                        "
                    >
                        { label }
                    </h1>
                </div>
                <div className="flex justify-between items-center gap-2">
                    <button 
                        onClick={() => onStart("STOP")}
                        className={cn(`
                            p-3
                            rounded-full
                            transition-shadow
                            text-slate-500
                            bg-white
                            shadow-shadow-button-active`,
                            (onStatus === "START" ||  onStatus === "PAUSE") && 'shadow-shadow-button',
                        )}
                    >
                        <Square className="size-5 bg-rose-500 text-rose-500 rounded-sm"/>
                    </button>
                    <button 
                        onClick={() => onStart("START")}
                        className={cn(`
                            p-3
                            rounded-full
                            transition-shadow
                            text-slate-500
                            bg-white`,
                            onStatus === "START" 
                            ? 'shadow-shadow-button-active'
                            : 'shadow-shadow-button'
                        )}
                    >
                        <Play className="size-8 text-font-primary"/>
                    </button>
                    <button 
                        onClick={() => onStart("PAUSE")}
                        className={cn(`
                            p-3
                            rounded-full
                            transition-shadow
                            text-slate-500
                            bg-white`,
                            onStatus === "PAUSE"  || onStatus !== "START"
                            ? 'shadow-shadow-button-active'
                            : 'shadow-shadow-button'
                        )}
                    >
                        <Pause className="size-5"/>
                    </button>
                </div>
                <div
                    className="
                        flex
                        justify-between
                    "
                >
                    <span className="text-muted-foreground">{onRunStatus}</span>
                    <div className="text-muted-foreground font-bold">
                        <span>{hours.toString().padStart(2, '0')}</span>:
                        <span>{minutes.toString().padStart(2, '0')}</span>:
                        <span>{seconds.toString().padStart(2, '0')}</span>
                    </div>
                </div>
            </div>
        </div>
    </>
    );
}