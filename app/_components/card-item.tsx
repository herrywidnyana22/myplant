'use client'

import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Pause, Play, Square } from "lucide-react";
import { DotStatus } from "./dot-status";
import { useState } from "react";
import { KeranStatusProps } from "../types/KeranStatusType";
import { ControlButton } from "./control-button";
import { useMqtt } from "../context/MqttContex";
import TimeCountdown from "./time-countdown";

export type CardItemProps={
    id:string
    label: string
    mode?: "AUTO" | "MANUAL"
    time: number
} & KeranStatusProps

export const CardItem = ({
    id,
    label,
    mode="AUTO",
    switchStatus,
    runningStatus=switchStatus!=="OFF" ? "START" : null,
    progressStatus=switchStatus!=="OFF" ? "RUNNING" : "OFF",
    time

}: CardItemProps) => {
    const { client } = useMqtt();
    const [modeValue, setModeValue] = useState(mode)
    const [onRunningStatus, setOnRunningStatus] = useState(runningStatus)
    const [onProgressStatus, setOnProgressStatus] = useState(progressStatus)

    const onSwitchChange = async() =>{
        const newMode = modeValue === "AUTO" ? "MANUAL" : "AUTO";
        setModeValue(newMode)
    }
    const controlKeran = (keranID: string, action: typeof runningStatus) => {
        
        if(client) {// Format message "keran1:ON"
            const topic = 'myplant/control';
            const actionValue = action === 'START' ? 'ON' : 'OFF'
            const message = `${keranID}:${actionValue}`

            client.publish(topic, message, (err) => {
                if (err) {
                    console.error('Failed to publish message:', err);
                } else {
                    console.log('Message published successfully:', message);
                }
            })
        } else {
            console.error('MQTT client not connected');
        }
    }

    const onStart = (keranID: typeof id, action: typeof runningStatus) =>{
        controlKeran(keranID, action)
        setOnRunningStatus(action)

        if(action === "START"){
            setOnProgressStatus("RUNNING")
        }

        if(action === "PAUSE"){
            setOnProgressStatus("DELAYED")
        }

        if(action === "STOP"){
            setOnProgressStatus("OFF")
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
                relative
                bg-primary-1`,
                status === "OFF"
                ? 'cursor-not-allowed opacity-50 pointer-events-none'
                : 'cursor-pointer'
            )}
        >
            <div
                className={cn(`
                    size-64
                    flex
                    flex-col
                    justify-between
                    p-6
                    list-none
                    rounded-3xl
                    transition-shadow
                    shadow-card-shadow`, 
                    onRunningStatus === "START" && 'shadow-card-shadow-inner scale-95'
                    
                )}
            >
                <div
                    className="
                        flex
                        justify-between
                    "
                >
                    <DotStatus connectStatus={"CONNECTED"}/>
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
                <div 
                    className="
                        flex 
                        justify-between 
                        items-center 
                        gap-2
                    "
                >
                    <ControlButton
                        onClick={() => onStart(id, "STOP")}
                        switchStatus={switchStatus}
                        icon={Square}
                        iconClassName={"size-5 bg-rose-500 text-rose-500 rounded-sm"}
                        className={(onRunningStatus === "START" ||  onRunningStatus === "PAUSE") 
                            ? 'shadow-shadow-button' 
                            : undefined
                        }
                    />
                    <ControlButton 
                        onClick={() => onStart(id, "START")}
                        switchStatus={switchStatus}
                        icon={Play}
                        iconClassName={"size-8 text-font-primary"}
                        className={onRunningStatus === "START" 
                            ? 'shadow-shadow-button-active'
                            : 'shadow-shadow-button'
                        }
                    />
                    <ControlButton 
                        onClick={() => onStart(id, "PAUSE")}
                        switchStatus={switchStatus}
                        icon={Pause}
                        iconClassName={"size-5"}
                        className={onRunningStatus === "PAUSE"  || onRunningStatus !== "START"
                            ? 'shadow-shadow-button-active'
                            : 'shadow-shadow-button'
                        }
                    />
                </div>
                <div
                    className="
                        flex
                        justify-between
                    "
                >
                    <span className="text-muted-foreground">{onProgressStatus}</span>
                    <div className="text-muted-foreground font-bold">
                        <TimeCountdown
                            initialRuntime={time} 
                            onRunningStatus={onRunningStatus}
                        />
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}