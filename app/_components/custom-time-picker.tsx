import React, { useEffect, useRef } from 'react';
import { CustomNumberRange } from './custom-number-range';

interface CustomTimePickerProps {
    hour: number
    minute: number
    setHour: (value:number) => void
    setMinute: (value:number) => void
    isDateNow: boolean
}

const CustomTimePicker = ({ 
    hour,
    minute,
    setHour,
    setMinute,
    isDateNow
 }: CustomTimePickerProps) => {

    const hoursRef = useRef<HTMLDivElement>(null)
    const minutesRef = useRef<HTMLDivElement>(null)
    const itemHeight = 36// Adjusted item height in pixels
    const visibleItems = 5// Number of visible items in the scrolling list

    const hours = Array.from({ length: 24 }, (_, i) => i)
    const minutes = Array.from({ length: 60 }, (_, i) => i)
    
    // Calculate default hour and minute based on the current time
    const now = new Date()
    let currentHour = isDateNow ? now.getHours() : hour
    let currentMinute = isDateNow ? now.getMinutes() + 5 : minute

    if (currentMinute >= 60) {
        currentMinute -= 60
        currentHour = (currentHour) % 24
    }

    useEffect(() => {
        if (isDateNow) {
            setHour(currentHour)
            setMinute(currentMinute)
        } 

        if (hoursRef.current) {
            const hourScrollPosition = (currentHour + 1) * itemHeight
            hoursRef.current.scrollTop = hourScrollPosition
        }
        if (minutesRef.current) {
            const minuteScrollPosition = (currentMinute + 2) * itemHeight
            minutesRef.current.scrollTop = minuteScrollPosition
        }
    }, [isDateNow])

    return (
            
            <div 
                className="
                    relative
                    flex 
                    items-center 
                    justify-center
                    space-x-1
                "
            >
                {/* Hours Wheel */}
                <CustomNumberRange
                    itemRef={hoursRef}
                    items={hours}
                    selectedItem={hour}
                    setSelectedItem={setHour}
                    itemHeight={itemHeight}
                    visibleItems={visibleItems}
                    limit={currentHour}
                    asTimePicker
                    isCurrentDate={isDateNow}
                />
                <span className='text-sm font-bold text-font-primary'>:</span>
                {/* Minutes Wheel */}
                <CustomNumberRange
                    itemRef={minutesRef}
                    items={minutes}
                    selectedItem={minute}
                    setSelectedItem={setMinute}
                    itemHeight={itemHeight}
                    visibleItems={visibleItems}
                    limit={currentMinute}
                    asTimePicker
                    isCurrentDate={isDateNow}
                />
            </div>
    )
}

export default CustomTimePicker
