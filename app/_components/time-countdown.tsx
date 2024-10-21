import React, { useEffect, useState } from 'react';
import { KeranStatusProps } from '../types/KeranStatusType';

interface TimeCountProps {
  initialRuntime: number; // The runtime passed from the parent in milliseconds
  onRunningStatus: KeranStatusProps["runningStatus"]; // Indicates if the relay is ON
}

const TimeCountdown = ({ initialRuntime, onRunningStatus }: TimeCountProps) => {
    const [runtime, setRuntime] = useState(initialRuntime); // Initialize with milliseconds

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null;

        // If relay is ON, start counting
        if (onRunningStatus === "START") {
            interval = setInterval(() => {
                setRuntime((prev) => prev + 1000); // Increment runtime by 1000 ms (1 second)
            }, 1000);
        } else if (onRunningStatus === "PAUSE") {
            // Do nothing (keep current runtime)
        } else if (onRunningStatus === "STOP") {
            setRuntime(0); // Reset the runtime when stopped
        }

        // Cleanup the interval when the component unmounts or status changes
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [onRunningStatus]);

    // Update runtime only when the component mounts or the initialRuntime changes
    useEffect(() => {
        if (initialRuntime > 0) {
            setRuntime(initialRuntime); // Set runtime to initial only if it's greater than 0
        }
    }, [initialRuntime]);

    // Format runtime into HH:MM:SS
    const formatTime = (milliseconds: number): string => {
        const seconds = Math.floor(milliseconds / 1000); // Convert milliseconds to seconds
        const hours = String(Math.floor(seconds / 3600)).padStart(2, '0'); // Total hours
        const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0'); // Minutes
        const secs = String(Math.floor(seconds % 60)).padStart(2, '0'); // Seconds
        return `${hours}:${minutes}:${secs}`;
    };

    return <span>{formatTime(runtime)}</span>; // Display the formatted runtime
};

export default TimeCountdown;
