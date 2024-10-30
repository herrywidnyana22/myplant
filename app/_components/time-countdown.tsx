
import { useEffect, useState } from 'react';
import { KeranStatusProps } from '../types/KeranStatusType';
import { cn } from '@/lib/utils';
import { formatTime } from '../utils/format-time';

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
        } else if (status === "OFF") {
            setRuntime(0) // Reset the runtime when stopped
        }

        // Cleanup the interval when the component unmounts or status changes
        return () => {
            if (interval) {
                clearInterval(interval)
            }
        }
    }, [status])

    // Update runtime only when the component mounts or the initialRuntime changes
    useEffect(() => {
        if (initialRuntime > 0) {
            setRuntime(initialRuntime) // Set runtime to initial only if it's greater than 0
        }
    }, [initialRuntime])

    

    return (
        <p
            className={cn('text-slate-500',
                status === "RUNNING" && 'text-emerald-500',
                status === "PAUSED" && 'text-orange-500',
            )}
        >
            {formatTime(runtime)}
        </p>
    )
}

export default TimeCountdown;
