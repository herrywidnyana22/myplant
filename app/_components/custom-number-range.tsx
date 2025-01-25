'use client'

import { cn } from "@/lib/utils"
import { useEffect } from "react"

type CustomNumberRangeProps  = {
    itemRef: React.RefObject<HTMLDivElement>
    items: number[]
    selectedItem: number
    setSelectedItem: (selectedItem:number) => void;
    visibleItems?: number
    itemHeight?: number
    asTimePicker?:boolean
    limit?: number
    isCurrentDate?: boolean
    className?: string
}

export const CustomNumberRange = ({
    itemRef,
    items,
    selectedItem,
    setSelectedItem,
    visibleItems = 5,
    itemHeight = 36,
    limit = 0,
    asTimePicker= false,
    isCurrentDate=false,
    className
}: CustomNumberRangeProps) => {

    const centerIndex = Math.floor(visibleItems / 2) // Center position for highlight

    // Set scroll position to highlight "0" on initial render
    useEffect(() => {
        if(!asTimePicker && itemRef.current) {
            itemRef.current.scrollTop = 0 // Adjust scrollTop to ensure "0" is highlighted
            setSelectedItem(0) // Set initial selection to 0 for hours
            return
        }         
    }, []);

    // Get selected item based on scroll position
    const getSelectedItem = (ref: React.RefObject<HTMLDivElement>, items: number[]) => {
        if (ref.current) {
            const currentScrollTop = ref.current.scrollTop;
            const closestIndex = Math.round(currentScrollTop / (itemHeight)) - 1

            const scrollTop = ( limit + 1) * itemHeight
        
            if (isCurrentDate && items[closestIndex] < limit) {
                ref.current.scrollTop = scrollTop// Snap back to the limit
                return limit
            }

            return items[closestIndex] !== undefined ? items[closestIndex] : 0
            
        }
        return 0
    }

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
            ref={itemRef}
            onScroll={() => handleScroll(itemRef, items, setSelectedItem)}
            className={cn(`
                relative 
                w-10 
                h-40
                overflow-y-scroll 
                scrollbar-hide 
                snap-y 
                snap-mandatory`,
                className
            )}
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
                items.map((item) => (
                    <div
                        key={item}
                        className={cn(`
                            text-lg 
                            font-medium 
                            snap-center`,
                            item === selectedItem 
                            ? 'text-font-primary font-semibold' 
                            : 'text-gray-400'
                        )}
                    >
                        {
                            asTimePicker 
                            ? item < 10 ? `0${item}` : item
                            : item
                        }
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
    );
}