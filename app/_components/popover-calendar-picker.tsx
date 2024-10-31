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

type PopoverDatePickerProps = {
    isNow?: boolean
    date: Date
    setDate: (date: Date) => void
}

export function PopoverDatePicker({isNow, date, setDate}: PopoverDatePickerProps) {
    const [isOpen, setIsOpen] = useState(false)

    const dateInBali = startOfDay(addHours(new Date(), 8));
    
    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (selectedDate) {
            setDate(selectedDate)
            setIsOpen(false) 
        }

        console.log({selectedDate})
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
                        mr-2 
                        size-4`,
                        isNow && "opacity-50 pointer-events-none"
                    )} 
                />
                {
                    isNow 
                    ? <span> Sekarang</span> 
                    : date ? format(date, 'dd MMMM yyyy') : <span>Pick a date</span>
                }
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
            <Calendar
                mode="single"
                selected={date}
                onSelect={handleDateSelect}
                disabled={(tgl) =>isBefore(startOfDay(tgl), dateInBali)}
                initialFocus
            />
      </PopoverContent>
    </Popover>
  )
}
