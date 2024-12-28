import { useEffect, useState, useCallback, useMemo } from 'react';
import { KeranStatusProps } from '../types/KeranStatusType';
import { usePublish } from './use-publish';
import { useMqtt } from '../context/MqttContex';

export type RelayStatusProps = {
    id: string;
    name: string;
    duration: number;
    runtime: number;
} & KeranStatusProps

type StatusMessageProps = {
    name: string;
} & KeranStatusProps

type DurationMessageProps = {
    name: string;
    duration: number;
};

type RuntimeMessageProps = {
    name: string;
    runtime: number;
};

export const UseKeranStatus = () => {
    const [combineStatus, setCombineStatus] = useState<RelayStatusProps[]>([]);
    const [statusMsg, setStatusMsg] = useState<StatusMessageProps[]>([]);
    const [durationMsg, setDurationMsg] = useState<DurationMessageProps[]>([]);
    const [runtimeMsg, setRuntimeMsg] = useState<RuntimeMessageProps[]>([]);
    const [receivedFlags, setReceivedFlags] = useState({
        status: false,
        duration: false,
        runtime: false,
    });

    const { client } = useMqtt();
    const { publishMessage } = usePublish();

    // Memoize the topics object
    const topics = useMemo(() => ({
        status: 'myplant/status',
        duration: 'myplant/duration',
        runtime: 'myplant/runtime',
    }), [])

    const handleIncomingMessage = useCallback((topic: string, message: Buffer) => {
        console.log("Topic:", topic);
        console.log("Message:", message.toString());

        try {
            const parsedMessage = JSON.parse(message.toString());
            
            switch (topic) {
                case topics.status:
                    // Transform status data into an array of StatusMessageProps
                    const transformedStatusArray: StatusMessageProps[] = Object.entries(parsedMessage).map(
                        ([key, value]) => ({
                            name: `keran${key}`,
                            status: value as KeranStatusProps["status"]
                        })
                    )
                    setStatusMsg(transformedStatusArray);
                    setReceivedFlags((prev) => ({ ...prev, status: true }));
                    break;

                case topics.duration:
                    // Transform duration data into an array of DurationMessageProps
                    const durationArray: DurationMessageProps[] = Object.entries(parsedMessage).map(
                        ([key, value]) => ({
                            name: `keran${key}`,
                            duration: value as number,
                        })
                    );
                    setDurationMsg(durationArray);
                    setReceivedFlags((prev) => ({ ...prev, duration: true }));
                    break;

                case topics.runtime:
                    // Transform runtime data into an array of RuntimeMessageProps
                    const runtimeArray: RuntimeMessageProps[] = Object.entries(parsedMessage).map(
                        ([key, value]) => ({
                            name: `keran${key}`,
                            runtime: value as number,
                        })
                    );
                    setRuntimeMsg(runtimeArray);
                    setReceivedFlags((prev) => ({ ...prev, runtime: true }));
                    break;

                default:
                    console.warn(`Unhandled topic: ${topic}`);
                    break;
            }
        } catch (error) {
            console.error(`Failed to parse MQTT message on topic ${topic}:`, error);
        }
    }, [topics]);

    const formatRelayStatus = useCallback(() => {
        // Combine status, duration, and runtime into one array
        const combined = statusMsg.map((item1, i) => {
            const item2 = durationMsg.find((item) => item.name === item1.name);
            const item3 = runtimeMsg.find((item) => item.name === item1.name);

            return {
                ...item1,
                id: `keran${i+1}`,
                duration: item2 ? item2.duration : 0,
                runtime: item3 ? item3.runtime : 0,
            };
        });

        setCombineStatus(combined);
        setReceivedFlags({ status: false, duration: false, runtime: false });
    }, [statusMsg, durationMsg, runtimeMsg]);

    useEffect(() => {
        if (client) {
            // Subscribe to required topics
            Object.values(topics).forEach((topic) => {
                client.subscribe(topic, (err) => {
                    if (err) {
                        console.error(`Failed to subscribe to topic ${topic}:`, err);
                    } else {
                        console.log(`Subscribed to topic ${topic}`);
                    }
                });
            });

            // Set message handler
            client.on('message', handleIncomingMessage)
            
        }
        
    }, [client, handleIncomingMessage, publishMessage, topics]);

    useEffect(() => {
        if (receivedFlags.status && receivedFlags.duration && receivedFlags.runtime) {
            formatRelayStatus(); // Call format only when all flags are set
            // Reset flags after processing
            setReceivedFlags({ status: false, duration: false, runtime: false });
        }
    }, [receivedFlags, formatRelayStatus]);

    useEffect(() => {
        // Publish an initialization message
        publishMessage({
            topic: 'myplant/web',
            msg: 'init',
            msgSuccess: 'Initialization success...',
            msgError: 'Initialization failed...',
        })
    }, []);

    return combineStatus;
};
