'use client';

import { useEffect, useState } from 'react';
import { useMqtt } from "../context/MqttContex"
import { ConnectionStatus } from './connection-status';
import { CardItem } from './card-item';
import { formatCapitalize } from '../utils/format-capitalize';
import { UseKeranStatus } from '../hooks/use-keran-status';
import { CalendarClock, Clock, Layers, Play, Settings, SquareStack } from 'lucide-react';
import { Hint } from './hint';
import { PopoverSpecialMode } from './popover-special-mode';
import { cn } from '@/lib/utils';
import { DynamicIsland } from './dynamic-island';

export const Card = () => {
    const data = UseKeranStatus()
    const { connectStatus,setConnectStatus } = useMqtt()
    
    const [keranData, setKeranData] = useState(data)
    const [isCollapse, setIsCollapse] = useState(false)
    const [isSpesialMode, setIsSpesialMode] = useState(false)
    const [dateLabel, setDateLabel] = useState<string | null>(null)
    const [durationLabel, setDurationLabel] = useState<string | null>(null)
    const [runningNames , setRunningNames] = useState<string>("")
    

    useEffect(() => {
        setKeranData(data);
        
        if (!data || data.length === 0 ){
            setConnectStatus("DEVICE DISCONNECTED")
        } else {
            setConnectStatus("DEVICE CONNECTED")
        }

        const runningKeran= data
            .filter(item => item.status === "RUNNING")
            .map(item => item.name)
            .join(", ")

        setRunningNames(runningKeran)

    }, [data, setConnectStatus])


    console.log({keranData})
    
    return ( 
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
                        <Hint label={`ON: ${runningNames}`}>
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
                        isSpesialMode={isSpesialMode}
                        setIsSpesialMode={setIsSpesialMode}
                        setDateLabel ={setDateLabel}
                        setDurationLabel ={setDurationLabel}
                    >
                        <Settings 
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
                            isCollapse && "overflow-hidden h-[600px]"
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
                                    mode={item.duration > 0 ? "TIMER" : "NO TIMER"}
                                    time={item.runtime}
                                    collapse={isCollapse}
                                />
                            ))
                        }
                    </div>
                ) : <p className='text-center text-slate-400 italic'>Device disconnected</p>
            }
        </div>
    );
}