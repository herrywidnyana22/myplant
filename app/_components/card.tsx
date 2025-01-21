'use client';

import { useEffect, useState } from 'react';
import { useMqtt } from "../context/MqttContex"
import { ConnectionStatus } from './connection-status';
import { CardItem } from './card-item';
import { formatCapitalize } from '../utils/format-capitalize';
import { useKeranStatus } from '../hooks/use-keran-status';
import { CalendarClock, Clock, Layers, Play, Settings, SquareStack } from 'lucide-react';
import { Hint } from './hint';
import { PopoverSpecialMode } from './popover-special-mode';
import { cn } from '@/lib/utils';
import { DynamicIsland } from './dynamic-island';
import { useConfirm } from '../hooks/use-confirm';
import { usePublish } from '../hooks/use-publish';
import { KeranStatusProps } from '../types/KeranStatusType';

export const Card = () => {
    const { combineStatus, deviceModeMsg } = useKeranStatus()
    const { connectStatus,setConnectStatus } = useMqtt()
    
    const [keranData, setKeranData] = useState(combineStatus)
    const [isCollapse, setIsCollapse] = useState(false)
    const [isSpesialMode, setIsSpesialMode] = useState(false)
    const [dateLabel, setDateLabel] = useState<string | null>(null)
    const [durationLabel, setDurationLabel] = useState<string | null>(null)
    const [runningNames, setRunningNames] = useState<string>("")
    const [numOfRunning,setNumOfRunning] = useState(0)

    const { publishMessage } = usePublish()

    const [ConfirmSwitched, confirm] = useConfirm(
        `Yakin ingin mengubah mode?`,
        "Ini akan mematikan semua keran terlebih dahulu"
    )

    useEffect(() => {
        setKeranData(combineStatus)
        
        if (!combineStatus || combineStatus.length === 0 ){
            setConnectStatus("DEVICE DISCONNECTED")
        } else {
            setConnectStatus("DEVICE CONNECTED")
        }

        const runningKeran= combineStatus
            .filter(item => item.status === "RUNNING")
            .map(item => item.name)
            .join(", ")

        const runningKeranCount = combineStatus.filter(item => item.status === "RUNNING").length;

        setRunningNames(runningKeran)
        setNumOfRunning(runningKeranCount)

    }, [combineStatus, setConnectStatus])

    useEffect(() => {
        if (!deviceModeMsg || deviceModeMsg.length === 0) {
            setDateLabel(null)
            setDurationLabel(null)
            return
        }

        const { startDate, startTime, duration } = deviceModeMsg[0]
    
        // Check if startDate and startTime are "now"
        const label = () => { 
            if (!startDate) return null
            
            if (startDate === "now" && startTime === "now")
            {
                return "now"
            } else {
                return `${startDate} ${startTime}`
            } 
        }

        const durasiLabel = duration === 0 ? null : `${duration} minute`
    
        setDateLabel(label)
        setDurationLabel(durasiLabel)
      }, [deviceModeMsg])

    const handleSettingsClick = async () => {
        
         // Get active keran data
        const activeKeran = keranData
                            .filter((keran) => keran.status === "RUNNING")
                            .map((keran) => {
                                const match = keran.id.match(/\d+/)
                                return match ? Number(match[0]) : null
                            })
        if (activeKeran.length === 0 || activeKeran === null){
            setIsSpesialMode(true)
        }else{
            // Show confirmation dialog
            const isOk = await confirm()
            if (isOk) {
                // turn off all active keran
                controlKeran("OFF", activeKeran, 0)
                
                // Show popover
                setIsSpesialMode(true)
            }
        }
    }

    const controlKeran = (action: KeranStatusProps["status"], data: (number | null)[], duration: number) => {
    
        const topic = 'myplant/bulkcontrol'
        
        const msgSuccess =`Semua keran berhasil di-OFF kan...`
        const msgError =`Semua keran GAGAL di-OFF kan...`

        const msg = JSON.stringify({
                        listKeran: data,
                        status: action,
                        duration
                    })
        
        publishMessage({topic, msg, msgSuccess, msgError})
    }

    console.log({keranData})
    console.log({deviceModeMsg})
    return ( 
    <>
        <div
            className="
                relative
                w-full
                max-w-md
                rounded-3xl
                m-auto
                p-5
                shadow-card-shadow
            "
        >
            <div 
                className="
                    flex
                    justify-between
                    items-center
                    mb-8
                "
            >
                <div
                    className="
                        flex
                        items-center
                        gap-4
                    "
                >
                    <ConnectionStatus/>
                    <p 
                        className="
                            text-xl 
                            font-semibold 
                            text-font-primary
                        "
                    >
                        Noid 1
                    </p>
                    
                </div>
                    <DynamicIsland>
                    {       
                        (dateLabel || durationLabel) && (
                        <>
                            <span className='flex gap-2 items-center'>
                                <CalendarClock className='size-4' />
                                <p>{dateLabel}</p>
                            </span>
                            <span className='flex gap-2 items-center'>
                                <Clock className='size-4' />
                                <p>{durationLabel}</p>
                            </span>

                        </>
                    )}
                    {
                        runningNames !== "" &&
                        <Hint label={`${numOfRunning} ON: ${runningNames}`}>
                            <span className='flex gap-2'>
                                <Play className='size-4 flex-shrink-0' />
                                <p className='truncate'>{runningNames}</p>
                            </span>
                        </Hint>
                    }

                    </DynamicIsland>
                <div
                    className="
                        flex 
                        items-center
                        gap-4
                    "
                >
                {
                    keranData.length > 0 &&
                    <div 
                        className='
                            text-slate-500
                            cursor-pointer 
                        '
                    >
                    {
                        !isCollapse 
                        ? (

                            <Hint label='Collapse'>
                                <div onClick={() => setIsCollapse(true)} >
                                    <Layers className='size-4'/>
                                </div>
                            </Hint>
                        ) : (

                            <Hint label='Expand'>
                                <div onClick={() => setIsCollapse(false)}>
                                    <SquareStack className='size-4'/>
                                </div>
                            </Hint>
                        )
                    }
                    </div>
                }
                {
                    connectStatus === "DEVICE CONNECTED" &&
                    <PopoverSpecialMode 
                        data={keranData}
                        open={isSpesialMode}
                        onOpenChange={(open) => setIsSpesialMode(open)}
                    >
                        <Settings 
                            onClick={handleSettingsClick}
                            className='
                                size-5 
                                cursor-pointer 
                                text-font-primary
                            '
                        />
                    </PopoverSpecialMode>
                }
                </div>

            </div>
            {
                connectStatus === "DEVICE CONNECTED" 
                ? (
                    <div
                        className={cn(` 
                            h-[600px]
                            relative
                            flex
                            flex-col
                            gap-5
                            p-2
                            overflow-y-auto
                            scroll-smooth`,
                            // isCollapse && "overflow-hidden"
                        )}
                    >
                        {
                            keranData.map((item, i) =>(
                                <CardItem
                                    key={i}
                                    id={i}
                                    label={formatCapitalize(item.name)}
                                    status={item.status}
                                    duration={item.duration}
                                    durationMode={item.duration > 0 ? "TIMER" : "NO TIMER"}
                                    time={item.runtime}
                                    collapse={isCollapse}
                                    dateLabel={dateLabel}
                                    durationLabel={durationLabel}
                                    disabled={deviceModeMsg[0]?.booked.includes(i)}
                                />
                            ))
                        }
                    </div>
                ) : <p className='text-center text-slate-400 italic'>Device disconnected</p>
            }
        </div>
        <ConfirmSwitched/>
    </>
    );
}