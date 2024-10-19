'use client'

import { useEffect, useState } from 'react';
import mqtt from 'mqtt';
import { DotStatus } from '../_components/dot-status';


const MQTT_URL = 'wss://broker.emqx.io:8084/mqtt'

export const MQTTClient = () => {
    const [isConnected, setIsConnected] = useState(false)

    const clientId = "emqx_react_" + Math.random().toString(16).substring(2, 8);
    const username = "emqx_test";
    const password = "emqx_test";

    useEffect(() => {
        
        const mqttClient = mqtt.connect(MQTT_URL, {
            clientId,
            username,
            password,
            clean: true, // keep session
            connectTimeout: 4000, // connection timeout
            reconnectPeriod: 1000, 
        });

        // Set connection status
        mqttClient.on('connect', () => {
            console.log('Connected to MQTT broker');
            setIsConnected(true);
            // Subscribe to a topic
            mqttClient.subscribe('solenoid/keran1', { qos: 0 });
        })


        mqttClient.on('error', (err) => {
            console.error('Connection error: ', err)
            mqttClient.end();
        })

        
        return () => {
            if (mqttClient) mqttClient.end()
        }
    }, [setIsConnected])

     return (
        <DotStatus
            status={isConnected ? "CONNECTED" : "DISCONNECTED"}
        />
    );
}
