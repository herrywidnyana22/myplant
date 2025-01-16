"use client"


import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import React, { useState } from "react"
import CustomTimePicker from "./custom-time-picker"

type PopoverDatePickerProps = {
    isNow?: boolean
    selectedDate: Date
    setSelectedDate: (date: Date) => void
    hour: number
    minute: number
    setHour: (value:number) => void
    setMinute: (value:number) => void
}

export function PopoverDatePicker({
    isNow, 
    selectedDate, 
    hour,
    minute,
    setHour,
    setMinute,
    setSelectedDate
}: PopoverDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [isDateNow, setIsDateNow] = useState(true)

    const isBeforeToday = (date: Date) => {
        const today = new Date()
        today.setHours(0, 0, 0, 0); // Normalize to midnight
        return date < today;
    }

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date)

        // Compare selected date with today's date
        const today = new Date()
        today.setHours(0, 0, 0, 0) // Normalize to midnight
        const selected = new Date(date)
        selected.setHours(0, 0, 0, 0) // Normalize to midnight

        setIsDateNow(selected.getTime() === today.getTime());
    }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
            <Button
                variant={"outline"}
                disabled={isNow}
                className={cn(`
                    w-full
                    justify-start 
                    text-left 
                    font-normal`,
                )}
            >
                <CalendarIcon 
                    className={cn(`
                        size-4`,
                        isNow && "opacity-50 pointer-events-none"
                    )} 
                />
                {
                    isNow 
                    ? <span> Sekarang</span> 
                    : selectedDate 
                        ?   <span className="flex gap-2">
                                <p> {format(selectedDate, 'dd MMMM yyyy')} </p>
                                <p> {hour < 10 ? `0${hour}` : hour}:{minute < 10 ? `0${minute}` : minute} </p>
                               
                            </span>
                        : <span>Pick a date</span>
                }
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto flex flex-col" align="start">
            <div className="flex gap-2">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => handleDateSelect(date!)}
                    disabled={(tgl) => isBeforeToday(tgl)}
                    initialFocus
                />
                <CustomTimePicker
                    minute={minute}
                    hour={hour}
                    setMinute={setMinute}
                    setHour={setHour}
                    isDateNow={isDateNow}
                />
            </div>
            <Button 
                onClick={() => setIsOpen(false)}
                variant={"secondary"}
                className="
                    bg-font-primary 
                    text-white
                    hover:text-zinc-500
                "  
            >
                Confirm
            </Button>
      </PopoverContent>
    </Popover>
  )
}
