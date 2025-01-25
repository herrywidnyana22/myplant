import React, { useState, useRef } from 'react';
import { CustomNumberRange } from './custom-number-range';

interface CustomDurationPickerProps {
    onSelect: (duration: number) => void
}

const CustomDurationPicker = ({ onSelect }: CustomDurationPickerProps) => {
    const [selectedHours, setSelectedHours] = useState(0) // Start at 0 for hours
    const [selectedMinutes, setSelectedMinutes] = useState(0) // Start at 0 for minutes

    const hoursRef = useRef<HTMLDivElement>(null)
    const minutesRef = useRef<HTMLDivElement>(null)

    const hours = Array.from({ length: 24 }, (_, i) => i)
    const minutes = Array.from({ length: 60 }, (_, i) => i)

    // Confirm button handler that captures the highlighted values
    const handleConfirm = () => {
        onSelect(selectedHours * 60 + selectedMinutes)
    }

    return (
        <div 
            className="
                text-center
            "
        >
            <div 
                className="
                    relative 
                    flex 
                    items-center 
                    justify-center
                    mt-2
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
                            justify-center 
                            items-center 
                            text-xs 
                            gap-20
                            rounded-md
                        "
                    >
                        <p>hour</p>
                        <p>minute</p>
                    </span>
                </div>

                {/* Hours Wheel */}
                <CustomNumberRange
                    itemRef={hoursRef}
                    items={hours}
                    selectedItem={selectedHours}
                    setSelectedItem={setSelectedHours}
                />

                {/* Minutes Wheel */}
                <CustomNumberRange
                    itemRef={minutesRef}
                    items={minutes}
                    selectedItem={selectedMinutes}
                    setSelectedItem={setSelectedMinutes}
                />
            </div>

            <button
                onClick={handleConfirm}
                disabled={selectedHours === 0 && selectedMinutes === 0}
                className="
                    w-full
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
