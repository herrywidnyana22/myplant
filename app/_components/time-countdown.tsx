
import { useEffect, useState } from 'react';
import { KeranStatusProps } from '../types/KeranStatusType';
import { cn } from '@/lib/utils';
import { Hint } from './hint';

interface TimeCountProps {
  initialRuntime: number
  status:  KeranStatusProps["status"]
}

const TimeCountdown = ({ 
    initialRuntime,
    status="OFF"
}: TimeCountProps) => {

    const [runtime, setRuntime] = useState(initialRuntime)

    useEffect(() => {
        let interval: NodeJS.Timeout | null = null

        // If relay is ON, start counting
        if (status === "RUNNING") {
            interval = setInterval(() => {
                setRuntime((prev) => prev + 1000) // Increment runtime by 1000 ms (1 second)
            }, 1000)
        } else if (status === "PAUSED") {
            // Do nothing (keep current runtime)
        } else if (status === "OFF") {
            setRuntime(0) // Reset the runtime when stopped
        }

        // Cleanup the interval when the component unmounts or status changes
        return () => {
            if (interval) {
                clearInterval(interval)
            }
        };
    }, [status])

    // Update runtime only when the component mounts or the initialRuntime changes
    useEffect(() => {
        if (initialRuntime > 0) {
            setRuntime(initialRuntime) // Set runtime to initial only if it's greater than 0
        }
    }, [initialRuntime])

    // Format runtime into HH:MM:SS
    const formatTime = (milliseconds: number): string => {
        const seconds = Math.floor(milliseconds / 1000) // Convert milliseconds to seconds
        const hours = String(Math.floor(seconds / 3600)).padStart(2, '0') // Total hours
        const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0') // Minutes
        const secs = String(Math.floor(seconds % 60)).padStart(2, '0') // Seconds
        return `${hours}:${minutes}:${secs}`
    }

    return (
        <Hint
            label={status}
        >
            <span
                className={cn('text-slate-500',
                    status === "RUNNING" && 'text-emerald-500',
                    status === "PAUSED" && 'text-orange-500',
                )}
            >
                {formatTime(runtime)}
            </span>
        </Hint>
    )
}

export default TimeCountdown;
