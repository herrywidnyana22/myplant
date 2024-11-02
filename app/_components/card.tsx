'use client';

import { useEffect, useState } from 'react';
import { useMqtt } from "../context/MqttContex"
import { ConnectionStatus } from './connection-status';
import { CardItem } from './card-item';
import { formatCapitalize } from '../utils/format-capitalize';
import { UseKeranStatus } from '../hooks/use-keran-status';
import { Layers, Settings, SquareStack } from 'lucide-react';
import { Hint } from './hint';
import { PopoverSpecialMode } from './popover-special-mode';
import { cn } from '@/lib/utils';

export const Card = () => {
    const data = UseKeranStatus()
    const { connectStatus,setConnectStatus } = useMqtt()
    
    const [keranData, setKeranData] = useState(data)
    const [isCollapse, setIsCollapse] = useState(true)
    const [isSpesialMode, setIsSpesialMode] = useState(false)

    useEffect(() => {
        setKeranData(data);
        
        if (!data || data.length === 0 ){
            setConnectStatus("DEVICE DISCONNECTED")
        } else {
            setConnectStatus("DEVICE CONNECTED")
        }
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
                    >
                        <Settings className='size-5 cursor-pointer text-muted-foreground'/>
                    </PopoverSpecialMode>
                }
                </div>

            </div>
            {
                connectStatus === "DEVICE CONNECTED" 
                ? (
                    <div
                        className={cn(` 
                            h-[560px]
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