import { cn } from '@/lib/utils';
import React, { useRef, useEffect } from 'react';

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
    const itemHeight = 28// Adjusted item height in pixels
    const visibleItems = 9 // Number of visible items in the scrolling list
    const centerIndex = Math.floor(visibleItems / 2) 

    const hours = Array.from({ length: 24 }, (_, i) => i)
    const minutes = Array.from({ length: 60 }, (_, i) => i)
    
    // Calculate default hour and minute based on the current time
    const now = new Date();
    let defaultHour = isDateNow ? now.getHours() : hour;
    let defaultMinute = isDateNow ? now.getMinutes() + 5 : minute;

    if (defaultMinute >= 60) {
        defaultMinute -= 60;
        defaultHour = (defaultHour + 1) % 24;
    }

useEffect(() => {
    if (isDateNow) {
        setHour(defaultHour);
        setMinute(defaultMinute);
    } 

    if (hoursRef.current) {
        const hourScrollPosition = (defaultHour + 1) * itemHeight
        hoursRef.current.scrollTop = hourScrollPosition
    }
    if (minutesRef.current) {
        const minuteScrollPosition = (defaultMinute + 1) * itemHeight
        minutesRef.current.scrollTop = minuteScrollPosition
    }
    }, [isDateNow])

    const getSelectedItem = (ref: React.RefObject<HTMLDivElement>, items: number[], limit:number) => {
        if (ref.current) {
            const currentScrollTop = ref.current.scrollTop
            const closestIndex = Math.round(currentScrollTop / itemHeight) - 1
            
            return items[closestIndex] !== undefined ? items[closestIndex] : 0
        }
        return 0;
    };

    // Scroll handler to update selected state
    const handleScroll = (
        ref: React.RefObject<HTMLDivElement>,
        items: number[],
        setSelected: (value: number) => void,
        limit: number
    ) => {
        if (!ref.current) return;
    
        const currentScrollTop = ref.current.scrollTop;
        const selectedItem = getSelectedItem(ref, items, limit);
    
        // Prevent upward scrolling past the limit
        const closestIndex = Math.round(currentScrollTop / itemHeight) - 1;
        if (isDateNow && items[closestIndex] < limit) {
            ref.current.scrollTop = (limit + 1) * itemHeight// Snap back to the limit
            return;
        }
    
        setSelected(selectedItem);
    };

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
                {JSON.stringify({isDateNow})}
                {/* Hours Wheel */}
                <div
                    ref={hoursRef}
                    onScroll={() => handleScroll(hoursRef, hours, setHour, defaultHour)}
                    className="
                        relative 
                        w-8
                        h-60 
                        overflow-y-scroll 
                        scrollbar-hide 
                        snap-y 
                        snap-mandatory
                    "
                >
                    
                    <div 
                        className="
                            flex 
                            flex-col 
                            items-center 
                            gap-2
                        "
                    >
                    {
                        Array.from({ length: centerIndex }).map((_, idx) => (
                            <div key={idx} style={{ height: `${itemHeight}px` }}></div>
                        ))
                    }
                    {
                        hours.map((hourItems) => (
                            <div
                                key={hourItems}
                                className={cn(`
                                    text-sm 
                                    font-medium 
                                    snap-center`,
                                    hourItems === hour 
                                    ? 'text-white bg-font-primary font-semibold py-1 px-2 rounded-md' 
                                    : 'text-gray-400'
                                )}
                            >
                                {hourItems < 10 ? `0${hourItems}` : hourItems}
                            </div>
                        ))
                    }
                    {
                        Array.from({ length: centerIndex }).map((_, idx) => (
                            <div key={idx} style={{ height: `${itemHeight}px` }}/>
                        ))
                    }
                    </div>
                </div>
                <span className='text-sm font-bold text-font-primary'>:</span>
                {/* Minutes Wheel */}
                <div
                    ref={minutesRef}
                    onScroll={() => handleScroll(minutesRef, minutes, setMinute, defaultMinute)}
                    className="
                        relative 
                        w-8 
                        h-60 
                        overflow-y-scroll 
                        scrollbar-hide 
                        snap-y 
                        snap-mandatory
                    "
                >
                    <div 
                        className="
                            flex 
                            flex-col 
                            items-center 
                            gap-2
                        "
                    >
                    {
                        Array.from({ length: centerIndex }).map((_, idx) => (
                            <div key={idx} style={{ height: `${itemHeight}px` }}/>
                        ))
                    }
                    {
                        minutes.map((minuteItem) => (
                            <div
                                key={minuteItem}
                                className={cn(`
                                    text-sm 
                                    font-medium 
                                    snap-center`,
                                    minuteItem === minute 
                                    ? 'text-white bg-font-primary font-semibold py-1 px-2 rounded-md' 
                                    : 'text-gray-400'
                                )}
                            >
                                {minuteItem < 10 ? `0${minuteItem}` : minuteItem}
                            </div>
                        ))
                    }
                    {
                        Array.from({ length: centerIndex }).map((_, idx) => (
                            <div key={idx} style={{ height: `${itemHeight}px` }}></div>
                        ))
                    }
                    </div>
                </div>
            </div>
    )
}

export default CustomTimePicker
