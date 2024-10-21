import { useEffect, useState } from 'react';
import { useMqtt } from '../context/MqttContex';
import { KeranStatusProps } from '../types/KeranStatusType';

interface RelayStatus {
  name: string;
  status: KeranStatusProps["switchStatus"];
  runtime: number;
}

interface StatusMessage {
  name: string;
  status: KeranStatusProps["switchStatus"];
}

interface RuntimeMessage {
  name: string;
  runtime: number;
}

export const UseKeranStatus = () => {
    const [relayStatus, setRelayStatus] = useState<RelayStatus[]>([]);
    const [statusMap, setStatusMap] = useState<Record<string, KeranStatusProps["switchStatus"]>>({});
    const [runtimeMap, setRuntimeMap] = useState<Record<string, number>>({});

    const { client } = useMqtt();

    // Formatter function to combine status and runtime into relayStatus
    const formatRelayStatus = () => {
        const combinedStatus: RelayStatus[] = Object.keys(statusMap).map((name) => ({
            name,
            status: statusMap[name],
            runtime: runtimeMap[name] || 0, // Fallback to 0 if runtime is not available
        }))
        setRelayStatus(combinedStatus)
    }

    useEffect(() => {
        if (client) {
        // Subscribe to the relay status topic
        client.subscribe('myplant/status', (err) => {
            if (err) {
                console.error('Failed to subscribe to relay status:', err);
            }
        })

        client.subscribe('myplant/runtime', (err) => {
            if (err) {
                console.error('Failed to subscribe to relay runtime:', err);
            }
        })

        
        client.on('message', (topic: string, message: Buffer) => {
            if (topic === 'myplant/status') {
                try {
                    const statusArray: StatusMessage[] = JSON.parse(message.toString());
                    const newStatusMap: Record<string, KeranStatusProps["switchStatus"]> = {};

                    statusArray.forEach(({ name, status }) => {
                    newStatusMap[name] = status
                });

                    setStatusMap(newStatusMap)
                } catch (error) {
                    console.error('Failed to parse MQTT status message:', error);
                }

            } else if (topic === 'myplant/runtime') {
                try {
                    const runtimeArray: RuntimeMessage[] = JSON.parse(message.toString());
                    const newRuntimeMap: Record<string, number> = {};

                    runtimeArray.forEach(({ name, runtime }) => {
                        newRuntimeMap[name] = runtime; // Update the runtime map
                    });

                    setRuntimeMap(newRuntimeMap); // Update runtimeMap state
                } catch (error) {
                    console.error('Failed to parse MQTT runtime message:', error);
                }
            }
        });

        client.publish('myplant/web', 'init')
        }
    }, [client])

    // UseEffect to trigger relayStatus formatting when statusMap or runtimeMap changes
    useEffect(() => {
        if (Object.keys(statusMap).length > 0 || Object.keys(runtimeMap).length > 0) {
            formatRelayStatus()// Format data when either map is updated
        }
    }, [statusMap, runtimeMap])

    return relayStatus
}
