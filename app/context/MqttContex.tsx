'use client';

import mqtt, { MqttClient } from 'mqtt';
import { MqttStatusProps } from '../types/MqttStatustype';
import { createContext, useContext, useEffect, useState } from 'react';

const TOPICS = [
  'myplant/status',
  'myplant/duration',
  'myplant/runtime',
  'myplant/devicemode',
  'myplant/device/connected',   // Track Arduino
  'myplant/web/connected',      // Track web client
  'myplant/confirm'
]

const ConnectionStatus = {
  ONLINE: 'online',
  OFFLINE: 'offline',
}

const MqttContext = createContext<{
    client: MqttClient | null
    connectStatus: MqttStatusProps["status"]
    setConnectStatus: (status: MqttStatusProps["status"]) => void
}>({
    client: null,
    connectStatus: 'OFF',
    setConnectStatus: () => {},
})

export const MqttProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [client, setClient] = useState<MqttClient | null>(null);
    const [connectStatus, setConnectStatus] = useState<MqttStatusProps["status"]>('OFF')

    useEffect(() => {
        const mqttClient = mqtt.connect(process.env.NEXT_PUBLIC_MQTT_URL as string, {
            clientId: "emqx_react_" + Math.random().toString(16).substring(2, 8),
            username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
            password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
            clean: true,
            will: {
                topic: 'myplant/web/connected',
                payload: ConnectionStatus.OFFLINE,
                qos: 1,
                retain: true
            }
        })

        mqttClient.on('connect', () => {

            TOPICS.forEach((topic) => {
                mqttClient.subscribe(topic)
            })

            mqttClient.publish(
                'myplant/web/connected',
                ConnectionStatus.ONLINE,
                { 
                    qos: 1, 
                    retain: true 
                }
            )
        })

        mqttClient.on('error', () => {
            setConnectStatus('OFF')
        })

        mqttClient.on('reconnect', () => {
            setConnectStatus("CONNECTING")
        })

        mqttClient.on('message', (topic, message) => {
            if (topic !== "myplant/device/connected") return

            const status = message.toString();
            setConnectStatus(
                status === "online" 
                    ? "DEVICE CONNECTED" 
                    : "DEVICE DISCONNECTED"
            )
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
