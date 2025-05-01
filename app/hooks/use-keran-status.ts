import { useEffect, useState } from 'react';
import { useMqtt } from '../context/MqttContex';
import { DeviceModeProps, KeranStatusProps } from '../types/KeranStatusType'

export type KeranDataProps = {
    id:string
    name: string
    duration: number
    runtime: number
    isAlternate: boolean //menyala bergantian
    isBooked: boolean
} & KeranStatusProps

type StatusMessageProps = {
    name: string
} & KeranStatusProps


type DurationMessageProps = {
    name: string
    duration: number
}

type RuntimeMessageProps = {
    name: string
    runtime: number
}

export const useKeranStatus = () => {
    const [combineStatus, setCombineStatus] = useState<KeranDataProps[]>([])
    const [statusMsg, setStatusMsg] = useState<StatusMessageProps[]>([])
    const [durationMsg, setDurationMsg] = useState<DurationMessageProps[]>([])
    const [runtimeMsg, setRuntimeMsg] = useState<RuntimeMessageProps[]>([])
    const [deviceModeMsg, setDeviceModeMsg] = useState<DeviceModeProps[]>([])
    
    // Flags to track if data from each topic has been received
    const [statusReceived, setStatusReceived] = useState(false)
    const [durationReceived, setDurationReceived] = useState(false)
    const [runtimeReceived, setRuntimeReceived] = useState(false)

    const { client } = useMqtt()

    const formatRelayStatus = () => {
        const combined = statusMsg.map((item1, i) => {
            const item2 = durationMsg.find(item => item.name === item1.name)
            const item3 = runtimeMsg.find(item => item.name === item1.name)

            return {
                ...item1,
                id: `keran${i}`,
                duration: item2 ? item2.duration : 0,
                runtime: item3 ? item3.runtime : 0,
                isAlternate: true,
                isBooked: false
            }
        })

        setCombineStatus(combined)
    }


    // Handle messages from the subscribed topics
    const handleMessage = (topic: string, message: Buffer) => {
        console.log("Topic:", topic);
        console.log("Message:", message.toString())

        try {
            const parsedMessage = JSON.parse(message.toString())

            if (topic === 'myplant/status') { //{"1":"OFF","2":"OFF","3":"OFF","4":"OFF","5":"OFF","6":"OFF","7":"OFF","8":"OFF","9":"OFF","10":"OFF","11":"OFF","12":"OFF"}
                
                const statusArray: StatusMessageProps[] = Object.entries(parsedMessage).map(
                    ([key, value]) => ({
                        name: `keran${key}`,
                        status: value as KeranStatusProps['status'],
                    })
                )

                setStatusMsg(statusArray)
                setStatusReceived(true)
                
            } else if (topic === 'myplant/duration') { //{"1":0,"2":0,"3":0,"4":0,"5":0,"6":0,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0}
                const durationArray: DurationMessageProps[] = Object.entries(parsedMessage).map(
                    ([key, value]) => ({
                        name: `keran${key}`,
                        duration: value as number,
                    })
                )

                setDurationMsg(durationArray)
                setDurationReceived(true)

            } else if (topic === 'myplant/runtime') { //{"1":0,"2":0,"3":0,"4":0,"5":0,"6":59132,"7":0,"8":0,"9":0,"10":0,"11":0,"12":0}
                
                const runtimeArray: RuntimeMessageProps[] = Object.entries(parsedMessage).map(
                    ([key, value]) => ({
                        name: `keran${key}`,
                        runtime: value as number,
                    })
                )
                setRuntimeMsg(runtimeArray)
                setRuntimeReceived(true)
            
            } else if (topic === 'myplant/devicemode') { //{"mode":"MANUAL","date":"","time":"","duration":0,"booked":[]}
                if (
                    typeof parsedMessage.mode === 'string' &&
                    (parsedMessage.mode === 'MANUAL' || parsedMessage.mode === 'SCHEDULE')
                ) {
                    setDeviceModeMsg(() => [
                        {
                            mode: parsedMessage.mode,
                            startDate: parsedMessage.date || '', // Use `date` for `startDate`
                            startTime: parsedMessage.time || '', // Use `time` for `startTime`
                            booked: parsedMessage.booked || [],  // Ensure `booked` is an array
                            duration: parsedMessage.duration || 0 // duration
                        },
                    ])
                } else {
                    console.error('Invalid deviceMode message:', parsedMessage);
                }
            }
        } catch (error) {
            console.error('Failed to parse MQTT runtime message:', error)
        }
    }

    useEffect(() => {
        if (client) {
            client.on('message', handleMessage)
        }
    }, [client])

    useEffect(() => {
        if (statusReceived && durationReceived && runtimeReceived) {
            formatRelayStatus()

            // Reset
            setStatusReceived(false)
            setDurationReceived(false)
            setRuntimeReceived(false)
        }
    }, [statusReceived, durationReceived, runtimeReceived])

    return { combineStatus, deviceModeMsg }
}