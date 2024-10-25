import { useEffect, useState } from 'react';
import { useMqtt } from '../context/MqttContex';
import { KeranStatusProps } from '../types/KeranStatusType';

interface RelayStatus {
  name: string
  status: KeranStatusProps["status"]
  duration: number
  runtime: number
}

interface StatusMessage {
  name: string
  duration: number
  status: KeranStatusProps["status"]
}

interface DurationMessage {
  name: string
  duration: number
}

interface RuntimeMessage {
  name: string
  runtime: number
}

export const UseKeranStatus = () => {
    const [combineStatus, setCombineStatus] = useState<RelayStatus[]>([])
    const [statusMsg, setStatusMsg] = useState<StatusMessage[]>([])
    const [durationMsg, setDurationMsg] = useState<DurationMessage[]>([])
    const [runtimeMsg, setRuntimeMsg] = useState<RuntimeMessage[]>([])

    const { client } = useMqtt()

    // Formatter function to combine status and runtime into relayStatus
    const formatRelayStatus = () => {

        const combined = statusMsg.map(item1 => {
            const item2 = durationMsg.find(item => item.name === item1.name);
            const item3 = runtimeMsg.find(item => item.name === item1.name);

            return {
                ...item1,
                duration: item2 ? item2.duration : 0,
                runtime: item3 ? item3.runtime : 0
            }
        })

        setCombineStatus(combined)
    }

    useEffect(() => {
        if (client) {

            client.subscribe('myplant/status', (err) => {
                if (err) {
                    console.error('Failed to subscribe to relay status:', err)
                }
            })

            client.subscribe('myplant/duration', (err) => {
                if (err) {
                    console.error('Failed to subscribe to relay duration:', err)
                }
            })

            client.subscribe('myplant/runtime', (err) => {
                if (err) {
                    console.error('Failed to subscribe to relay runtime:', err)
                }
            })

            
            client.on('message', (topic: string, message: Buffer) => {
                console.log("Topic:", topic); 
                console.log("Message:", message.toString());
                
                if (topic === 'myplant/status') {
                    try {
                        const statusArray: StatusMessage[] = JSON.parse(message.toString())

                        setStatusMsg(statusArray)
                    } catch (error) {
                        console.error('Failed to parse MQTT status message:', error)
                    }

                } else if (topic === 'myplant/duration') {
                    try {
                        const durationArray: DurationMessage[] = JSON.parse(message.toString())

                        setDurationMsg(durationArray)
                    } catch (error) {
                        console.error('Failed to parse MQTT runtime message:', error)
                    }
                }else if (topic === 'myplant/runtime') {
                    try {
                        const runtimeArray: RuntimeMessage[] = JSON.parse(message.toString())

                        setRuntimeMsg(runtimeArray)
                    } catch (error) {
                        console.error('Failed to parse MQTT runtime message:', error)
                    }
                }
            })

            // request initalstate in device when page refresh
            client.publish('myplant/web', 'init')
        }
    }, [client])

    // UseEffect to trigger relayStatus formatting when statusMap or runtimeMap changes
    useEffect(() => {
        formatRelayStatus()
    }, [statusMsg, durationMsg, runtimeMsg])

    return combineStatus
}
