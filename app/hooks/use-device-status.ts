import { useEffect, useState } from 'react';
import { useMqtt } from '../context/MqttContex';
import { KeranStatusProps } from '../types/KeranStatusType';

export type RelayStatusProps = {
    id:string
    name: string
    status: KeranStatusProps["status"]
    duration: number
    runtime: number
}

type StatusMessageProps = {
    name: string
    duration: number
    status: KeranStatusProps["status"]
}

type DurationMessageProps = {
    name: string
    duration: number
}

type RuntimeMessageProps = {
    name: string
    runtime: number
}

export const UseDeviceStatus = () => {
    const [combineStatus, setCombineStatus] = useState<RelayStatusProps[]>([]);
    const [statusMsg, setStatusMsg] = useState<StatusMessageProps[]>([]);
    const [durationMsg, setDurationMsg] = useState<DurationMessageProps[]>([]);
    const [runtimeMsg, setRuntimeMsg] = useState<RuntimeMessageProps[]>([]);
    
    // Flags to track if data from each topic has been received
    const [statusReceived, setStatusReceived] = useState(false);
    const [durationReceived, setDurationReceived] = useState(false);
    const [runtimeReceived, setRuntimeReceived] = useState(false);

    const { client } = useMqtt();

    const formatRelayStatus = () => {
        const combined = statusMsg.map((item1, i) => {
            const item2 = durationMsg.find(item => item.name === item1.name)
            const item3 = runtimeMsg.find(item => item.name === item1.name)

            return {
                ...item1,
                id: `${i+1}`,
                duration: item2 ? item2.duration : 0,
                runtime: item3 ? item3.runtime : 0
            }
        })

        setCombineStatus(combined)
    }

    useEffect(() => {
        if (client) {
            // Subscribe to the topics
            client.subscribe('myplant/schedule', (err) => {
                if (err) {
                    console.error('Failed to subscribe to schedule status:', err)
                }
            });

            // Handle messages from the subscribed topics
            client.on('message', (topic: string, message: Buffer) => {
                console.log("Topic:", topic);
                console.log("Message:", message.toString())

                if (topic === 'myplant/status') {
                    try {
                        const statusArray: StatusMessageProps[] = JSON.parse(message.toString())
                        setStatusMsg(statusArray)
                        setStatusReceived(true)
                    } catch (error) {
                        console.error('Failed to parse MQTT status message:', error)
                    }
                } 
            })

            
            client.publish('myplant/web', 'init')
        }
    }, [client])

    
    useEffect(() => {
        if (statusReceived && durationReceived && runtimeReceived) {
            formatRelayStatus();

            // Reset
            setStatusReceived(false);
            setDurationReceived(false);
            setRuntimeReceived(false);
        }
    }, [statusReceived, durationReceived, runtimeReceived]);

    return combineStatus;
};
