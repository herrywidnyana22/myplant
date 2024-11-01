"use client"


import { CalendarIcon } from "@radix-ui/react-icons"
import { addHours, format, isBefore, startOfDay } from "date-fns"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import React, { useState } from "react"
import CustomTimePicker, { CustomTimePickerProps } from "./custom-time-picker"

type PopoverDatePickerProps = {
    isNow?: boolean
    date: Date
    setDate: (date: Date) => void
} & CustomTimePickerProps

export function PopoverDatePicker({
    isNow, 
    date, 
    hour,
    minute,
    setHour,
    setMinute,
    setDate
}: PopoverDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    const dateInBali = startOfDay(addHours(new Date(), 8));
    

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
                    : date 
                        ?   <span className="flex gap-2">
                                <p> {format(date, 'dd MMMM yyyy')} </p>
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
                    selected={date}
                    onSelect={(selectedDate) => setDate(selectedDate!)}
                    disabled={(tgl) =>isBefore(startOfDay(tgl), dateInBali)}
                    initialFocus
                />
                <CustomTimePicker
                    minute={minute}
                    hour={hour}
                    setMinute={setMinute}
                    setHour={setHour}
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
