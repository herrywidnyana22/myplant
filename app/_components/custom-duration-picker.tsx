import React, { useState } from 'react';

interface CustomDurationPickerProps {
    onSelect: (duration: number) => void; // duration in minutes
}

const CustomDurationPicker: React.FC<CustomDurationPickerProps> = ({ onSelect }) => {
    const [selectedHours, setSelectedHours] = useState(0);
    const [selectedMinutes, setSelectedMinutes] = useState(0);

    const hours = Array.from({ length: 24 }, (_, i) => i); // 0-23 hours
    const minutes = Array.from({ length: 60 }, (_, i) => i); // 0-59 minutes

    const handleConfirm = () => {
        const duration = selectedHours * 60 + selectedMinutes;
        onSelect(duration);
    };

    return (
        <div className="flex flex-col items-center space-y-4 p-4 rounded-lg bg-gray-100 shadow-lg w-64">
            <h2 className="text-lg font-semibold mb-2">Select Duration</h2>
            <div className="flex justify-center items-center space-x-4">
                {/* Hours Wheel */}
                <div className="relative w-20 h-40 overflow-hidden">
                    <div className="absolute inset-y-0 flex flex-col items-center justify-center gap-2">
                        {hours.map((hour) => (
                            <button
                                key={hour}
                                onClick={() => setSelectedHours(hour)}
                                className={`text-lg font-medium ${
                                    hour === selectedHours ? 'text-blue-600' : 'text-gray-400'
                                } transition-transform`}
                            >
                                {hour} h
                            </button>
                        ))}
                    </div>
                </div>

                {/* Minutes Wheel */}
                <div className="relative w-20 h-40 overflow-hidden">
                    <div className="absolute inset-y-0 flex flex-col items-center justify-center gap-2">
                        {minutes.map((minute) => (
                            <button
                                key={minute}
                                onClick={() => setSelectedMinutes(minute)}
                                className={`text-lg font-medium ${
                                    minute === selectedMinutes ? 'text-blue-600' : 'text-gray-400'
                                } transition-transform`}
                            >
                                {minute} m
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <button
                onClick={handleConfirm}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none"
            >
                Confirm
            </button>
        </div>
    );
};

export default CustomDurationPicker;
