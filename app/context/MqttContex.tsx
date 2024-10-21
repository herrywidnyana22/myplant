'use client'

import { createContext, useContext, useEffect, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';
import { MqttStatusProps } from '../types/MqttStatustype';

const MqttContext = createContext<{
    client: MqttClient | null
    connectStatus: MqttStatusProps["status"]
}>({ client: null, connectStatus: 'OFF' })

export const MqttProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [client, setClient] = useState<MqttClient | null>(null)
    const [connectStatus, setConnectStatus] = useState<MqttStatusProps["status"]>('OFF')

    useEffect(() => {
        const mqttClient = mqtt.connect(process.env.NEXT_PUBLIC_MQTT_URL as string, {
            clientId: "emqx_react_" + Math.random().toString(16).substring(2, 8),
            username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
            password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
            clean: true,
        })

        mqttClient.on('connect', () => {
            console.log('MQTT Client connected')
            setConnectStatus('CONNECTED')
        })

        mqttClient.on('error', (err) => {
            console.error('MQTT Client error:', err.message)
            setConnectStatus('OFF')
        })

        mqttClient.on('reconnect', () => {
            console.log('MQTT Client reconnecting...')
            setConnectStatus('RECONNECTING')
        })

        setClient(mqttClient)

        return () => {
            mqttClient.end()
        };
    }, []);

    return (
        <MqttContext.Provider value={{ client, connectStatus }}>
            {children}
        </MqttContext.Provider>
    );
};

export const useMqtt = () => {
    return useContext(MqttContext)
};
