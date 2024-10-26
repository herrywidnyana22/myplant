import { cn } from '@/lib/utils';
import React, { useState, useRef, useEffect } from 'react';

interface CustomDurationPickerProps {
    onSelect: (duration: number) => void;
}

const CustomDurationPicker = ({ onSelect }: CustomDurationPickerProps) => {
    const [selectedHours, setSelectedHours] = useState(0) // Start at 0 for hours
    const [selectedMinutes, setSelectedMinutes] = useState(0) // Start at 0 for minutes

    const hoursRef = useRef<HTMLDivElement>(null)
    const minutesRef = useRef<HTMLDivElement>(null)
    const itemHeight = 36 // Adjusted item height in pixels
    const visibleItems = 5 // Number of visible items in the scrolling list
    const centerIndex = Math.floor(visibleItems / 2) // Center position for highlight

    const hours = Array.from({ length: 24 }, (_, i) => i)
    const minutes = Array.from({ length: 59 }, (_, i) => i+1)

    // Set scroll position to highlight "0" on initial render
    useEffect(() => {
        if (hoursRef.current) {
            hoursRef.current.scrollTop = 0 // Adjust scrollTop to ensure "0" is highlighted
            setSelectedHours(0) // Set initial selection to 0 for hours
        }
        if (minutesRef.current) {
            minutesRef.current.scrollTop = 0 // Adjust scrollTop to ensure "0" is highlighted
            setSelectedMinutes(0) // Set initial selection to 0 for minutes
        }
    }, []);

    // Get selected item based on scroll position
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

        hapticFeedBack()
    }

    // Confirm button handler that captures the highlighted values
    const handleConfirm = () => {
        const hoursSelected = getSelectedItem(hoursRef, hours)
        const minutesSelected = getSelectedItem(minutesRef, minutes)
        onSelect(hoursSelected * 60 + minutesSelected)
    }

    const hapticFeedBack = () =>{
        if(navigator.vibrate){
            navigator.vibrate(10)
        }
    }

    return (
        <div 
            className='text-center'
        >
            <div 
                className="
                    relative 
                    flex 
                    items-center 
                    space-x-3
                "
            >
                <div 
                    className="
                        absolute 
                        h-8 
                        w-full 
                        flex 
                        top-1/2 
                        justify-center 
                        transform 
                        -translate-y-1/2 
                        pointer-events-none 
                        z-20
                    "
                >
                    <span 
                        className="
                            h-8 
                            w-full 
                            flex 
                            justify-between 
                            items-center 
                            px-3 
                            text-xs 
                            rounded-md
                            opacity-50 
                            bg-white 
                        "
                    >
                        <p className='pl-14'>hour</p>
                        <p>minute</p>
                    </span>
                </div>

                {/* Hours Wheel */}
                <div
                    ref={hoursRef}
                    onScroll={() => handleScroll(hoursRef, hours, setSelectedHours)}
                    className="
                        relative 
                        w-20 
                        h-40 
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
                        hours.map((hour) => (
                            <div
                                key={hour}
                                className={cn(`
                                    text-lg 
                                    font-medium 
                                    snap-center`,
                                    hour === selectedHours 
                                    ? 'text-font-primary font-semibold' 
                                    : 'text-gray-400'
                                )}
                            >
                                {hour}
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

                {/* Minutes Wheel */}
                <div
                    ref={minutesRef}
                    onScroll={() => handleScroll(minutesRef, minutes, setSelectedMinutes)}
                    className="
                        relative 
                        w-20 
                        h-40 
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
                        minutes.map((minute) => (
                            <div
                                key={minute}
                                className={cn(`
                                    text-lg 
                                    font-medium 
                                    snap-center`,
                                    minute === selectedMinutes 
                                    ? 'text-font-primary font-semibold' 
                                    : 'text-gray-400'
                                )}
                            >
                                {minute}
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

            <button
                onClick={handleConfirm}
                className="
                    mt-4 
                    px-4 
                    py-2 
                    bg-font-primary 
                    text-white rounded-lg 
                    hover:bg-blue-400 
                    focus:outline-none
                "
            >
                Confirm
            </button>
        </div>
    )
}

export default CustomDurationPicker
