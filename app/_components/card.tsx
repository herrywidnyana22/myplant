'use client';

import { useEffect, useRef, useState } from 'react';
import { useMqtt } from "../context/MqttContex"
import { ConnectionStatus } from './connection-status';
import { CardItem } from './card-item';
import { formatCapitalize } from '../utils/format-capitalize';
import { UseKeranStatus } from '../hooks/use-keran-status';

export const Card = () => {
    const data = UseKeranStatus()
    const [keranData, setKeranData] = useState(data)
    const { setConnectStatus } = useMqtt()

    useEffect(() => {
        setKeranData(data);
        
        if (!data || data.length === 0) {
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
                rounded-3xl
                m-52
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
            <div
                className=" 
                    relative
                    snap-y
                    snap-mandatory 
                    max-h-[520px]
                    py-2
                    overflow-y-auto
                    scroll-smooth
                    pb-[335px] 
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
                        />
                    ))
                }
            </div>
        </div>
    );
}