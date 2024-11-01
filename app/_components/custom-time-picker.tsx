import { cn } from '@/lib/utils';
import React, { useRef, useEffect } from 'react';

export interface CustomTimePickerProps {
    hour: number
    minute: number
    setHour: (value:number) => void
    setMinute: (value:number) => void
}

const CustomTimePicker = ({ 
    hour,
    minute,
    setHour,
    setMinute,
 }: CustomTimePickerProps) => {

    const hoursRef = useRef<HTMLDivElement>(null)
    const minutesRef = useRef<HTMLDivElement>(null)
    const itemHeight = 28// Adjusted item height in pixels
    const visibleItems = 9 // Number of visible items in the scrolling list
    const centerIndex = Math.floor(visibleItems / 2) 

    const hours = Array.from({ length: 24 }, (_, i) => i)
    const minutes = Array.from({ length: 60 }, (_, i) => i)

   
    useEffect(() => {
        if (hoursRef.current) {
            hoursRef.current.scrollTop = 0 
            setHour(0) 
        }
        if (minutesRef.current) {
            minutesRef.current.scrollTop = 0 
            setMinute(0) 
        }
    }, [setHour, setMinute])
    
    const getSelectedItem = (ref: React.RefObject<HTMLDivElement>, items: number[]) => {
        if (ref.current) {
            const currentScrollTop = ref.current.scrollTop;
            const closestIndex = Math.round(currentScrollTop / itemHeight) - 1
            return items[closestIndex] !== undefined ? items[closestIndex] : 0
        }
        return 0;
    };

    // Scroll handler to update selected state
    const handleScroll = (
        ref: React.RefObject<HTMLDivElement>,
        items: number[],
        setSelected: (value: number) => void
    ) => {
        const selectedItem = getSelectedItem(ref, items)
        setSelected(selectedItem)
    }

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
                <div
                    ref={hoursRef}
                    onScroll={() => handleScroll(hoursRef, hours, setHour)}
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
                    onScroll={() => handleScroll(minutesRef, minutes, setMinute)}
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
