'use client';

import mqtt, { MqttClient } from 'mqtt';
import { MqttStatusProps } from '../types/MqttStatustype';
import { createContext, useContext, useEffect, useState } from 'react';

const MqttContext = createContext<{
    client: MqttClient | null
    connectStatus: MqttStatusProps["status"]
    setConnectStatus: (status: MqttStatusProps["status"]) => void
}>({
    client: null,
    connectStatus: 'OFF',
    setConnectStatus: () => {},
});

export const MqttProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [client, setClient] = useState<MqttClient | null>(null);
    const [connectStatus, setConnectStatus] = useState<MqttStatusProps["status"]>('OFF')

    useEffect(() => {
        const mqttClient = mqtt.connect(process.env.NEXT_PUBLIC_MQTT_URL as string, {
            clientId: "emqx_react_" + Math.random().toString(16).substring(2, 8),
            username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
            password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
            clean: true,
        });

        mqttClient.on('connect', () => {
            console.log('MQTT Client connected')
        })

        mqttClient.on('error', (err) => {
            console.error('MQTT Client error:', err.message)
            setConnectStatus('OFF')
        })

        mqttClient.on('reconnect', () => {
            console.log('MQTT Client reconnecting...')
        })

        setClient(mqttClient)

        return () => {
            mqttClient.end()
        }
    }, [])

    return (
        <MqttContext.Provider value={{ client, connectStatus, setConnectStatus }}>
            {children}
        </MqttContext.Provider>
    )
}

export const useMqtt = () => {
    return useContext(MqttContext)
}
