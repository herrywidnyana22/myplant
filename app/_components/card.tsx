'use client';

import { useEffect, useState } from 'react';
import { useMqtt } from "../context/MqttContex"
import { ConnectionStatus } from './connection-status';
import { CardItem } from './card-item';
import { formatCapitalize } from '../utils/format-capitalize';
import { UseKeranStatus } from '../hooks/use-keran-status';
import { Layers, SquareStack } from 'lucide-react';
import { Hint } from './hint';
import { Switch } from '@/components/ui/switch';

export const Card = () => {
    const data = UseKeranStatus()
    const { connectStatus,setConnectStatus } = useMqtt()
    
    const [keranData, setKeranData] = useState(data)
    const [isCollapse, setIsCollapse] = useState(true)

    useEffect(() => {
        setKeranData(data);
        
        if (!data || data.length === 0 ){
            setConnectStatus("DEVICE DISCONNECTED")
        } else {
            setConnectStatus("DEVICE CONNECTED")
        }
    }, [data, setConnectStatus])

    console.log({ keranData })

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
                    <Switch 
                        id="mode"
                        // checked={onMode==="TIMER"}
                        // onCheckedChange={onSwitchChange}
                    />
                }
                </div>

            </div>
            {
                connectStatus === "DEVICE CONNECTED" 
                ? (
                    <div
                        className=" 
                            h-[560px]
                            relative
                            flex
                            flex-col
                            gap-5
                            p-2
                            overflow-y-auto
                            scroll-smooth
                        "
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