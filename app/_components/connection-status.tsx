'use client'

import { useMqtt } from "../context/MqttContex";
import { DotStatus } from "./dot-status";


export const ConnectionStatus = () => {
    const { connectStatus } = useMqtt()

    return (
        <DotStatus connectStatus={connectStatus}/>
    )
};
