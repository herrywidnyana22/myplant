'use client';

import { useEffect, useState } from 'react';
import { useMqtt } from "../context/MqttContex"
import { ConnectionStatus } from './connection-status';
import { CardItem } from './card-item';
import { formatCapitalize } from '../utils/format-capitalize';
import { UseKeranStatus } from '../hooks/use-keran-status';
import { Layers, SquareStack } from 'lucide-react';
import { Hint } from './hint';

export const Card = () => {
    const data = UseKeranStatus()
    const { setConnectStatus } = useMqtt()
    
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
                "
            >

                <h1 
                    className="
                        text-xl 
                        font-semibold 
                        mb-10
                        text-font-primary
                    "
                >
                    Device 1
                </h1>
                <ConnectionStatus/>
            </div>
            {
                keranData.length > 0 &&
                <>
                {
                    !isCollapse 
                    ? (

                        <Hint label='Collapse'>
                            <div 
                                onClick={() => setIsCollapse(true)}
                                className='
                                    absolute 
                                    top-12 
                                    right-5 
                                    text-slate-500
                                    cursor-pointer'
                                >
                                <Layers className='size-4'/>
                            </div>
                        </Hint>
                    ) : (

                        <Hint label='Expand'>
                            <div 
                                onClick={() => setIsCollapse(false)}
                                className='
                                    absolute 
                                    top-12 
                                    right-5 
                                    text-slate-500
                                    cursor-pointer'
                                >
                                <SquareStack className='size-4'/>
                            </div>
                        </Hint>
                    )
                }
                </>
            }
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
        </div>
    );
}