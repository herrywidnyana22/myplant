import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { KeranDataProps } from "../hooks/use-keran-status";
import { useState } from "react";
import { cn } from "@/lib/utils";
import CustomDurationPicker from "./custom-duration-picker";
import { Switch } from "@/components/ui/switch";
import { PopoverDatePicker } from "./popover-calendar-picker";
import { Button } from "@/components/ui/button";
import { UnfoldVertical } from "lucide-react";
import { durationOptionData } from "../data/duration-option";
import { DurationButton } from "./duration-button";
import { DurationButtonNew } from "./duration-button-new";
import { Hint } from "./hint";
import { toast } from "sonner";
import { usePublish } from "../hooks/use-publish";

type PopoverSpecialModeProps = {
    children: React.ReactNode
    data: KeranDataProps[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export const PopoverSpecialMode = ({
    children,
    data,
    open,
    onOpenChange,
}: PopoverSpecialModeProps) => {

    const [listData, setListData] = useState(data)
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [isNow, setIsNow] = useState(false)
    const [isAlternate, setIsAlternate] = useState(true)
    const [hour, setHour] = useState(new Date().getHours())
    const [minute, setMinute] = useState(new Date().getMinutes() + 5)
    const [durationActive, setDurationActive] = useState("")
    const [newDuration, setNewDuration]= useState(0)
    const [selectedDuration, setSelectedDuration]= useState(0)
    const [isDurationNewActive, setIsDurationNewActive] = useState(false)

    const { publishMessage } = usePublish()

    const formatTime = (selectedHour: number, selectedMinute: number) => {
        // Ensure hour and minute are always two digits
        const formattedHour = String(selectedHour).padStart(2, "0");
        const formattedMinute = String(selectedMinute).padStart(2, "0");
        return `${formattedHour}:${formattedMinute}`;
    };


    const reorder = (
        list: KeranDataProps[],
        startIndex: number,
        endIndex: number
    )=> {
        const result = Array.from(list);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);

        return result;
    }

    const onDragEnd = (result: DropResult) => {
        const { destination, source } = result
        if (!destination) return

        setListData(reorder(listData, source.index, destination.index))
    }

    const handleNewDurationSelect = (newDurasi: number) => {
        setNewDuration(newDurasi)
        setIsDurationNewActive(false)
    }

    const onKeranSwitch = (index: number) => { 
        setListData((prevList) =>
            prevList.map((item, i) =>
                i === index ? { 
                    ...item, 
                    isBooked: !item.isBooked
                } : item
            )
        )
    }

    const onConfirm = async() => {
        if (selectedDuration <= 0) {
            return toast.error("Tentukan durasi keran hidup!")
        }

        const order = listData
            .filter((keran) => keran.isBooked) // Include only items where isBooked is true
            .map((keran) => {
                    const match = keran.id.match(/\d+/);
                    return match ? Number(match[0]) : null;
        })

        if(order.length === 0 || order === null){
            return toast.error("Minimal 1 keran aktif!")
        }
        
        const topic = 'myplant/keranmode';
        const msgSuccess = "Mode spesial berhasil diterapkan"
        const msgError = "Mode spesial gagal diterapkan!"
        const formattedDate = selectedDate.toLocaleDateString('en-CA')

        const msg = JSON.stringify({
            order,
            nextDuration: selectedDuration,
            startDate: isNow ? "now" : formattedDate,
            startTime: isNow ? "now" : formatTime(hour, minute),
            isAlternate
        })

        publishMessage({ topic, msg, msgSuccess, msgError })
        
        onOpenChange(false)
    }


    return (
        <Popover open={open} onOpenChange={onOpenChange}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent 
                className="
                    relative 
                    w-3/4
                    space-y-6
                "
            >
                <div>
                    <h1 
                        className="
                            font-semibold 
                            text-lg 
                        "
                    >
                        Mode Spesial
                    </h1>
                    <div
                        className="
                            text-muted-foreground 
                            text-sm
                            break-words
                        "
                    >
                        Kamu bisa atur durasi serta kapan keran diaktifkan
                        keran akan menyala satu per satu secara bergantian berdasar
                        urutan dan durasi keran.
                    </div>
                </div>
                <div
                    className="
                        flex 
                        gap-4 
                        justify-between
                    "
                >
                    <div 
                        className="
                            relative 
                            w-[45%]
                            flex
                            flex-col
                            justify-start
                            gap-2
                            p-2 
                            mt-4
                            rounded-md 
                            border 
                            text-slate-500
                            border-neutral-300 
                        "
                    >
                        <span 
                            className="
                                absolute 
                                -top-3 
                                left-2 
                                bg-white px-2
                            "
                        >
                            Waktu mulai
                        </span>
                        <div 
                            className="
                                flex 
                                justify-between 
                                gap-2 
                                p-2
                                mt-4
                            "
                        >
                            <div 
                                className="
                                    text-muted-foreground 
                                    text-sm
                                "
                            >
                                Atur tanggal mulai keran, posisikan ON jika memulai sekarang
                            </div>
                            <Switch onCheckedChange={() => setIsNow(!isNow)}/>
                        </div>
                        <PopoverDatePicker
                            setSelectedDate={setSelectedDate}
                            selectedDate={selectedDate}
                            isNow={isNow}
                            hour={hour}
                            minute={minute}
                            setHour={setHour}
                            setMinute={setMinute}
                        />
                        <div 
                            className="
                                relative
                                w-full
                                py-2
                                pt-4
                                my-4
                                grid 
                                grid-cols-3 
                                gap-1 
                                justify-items-center
                                border border-spacing-1
                                rounded-xl
                            "
                        >
                            <span 
                                className="
                                    absolute 
                                    -top-3 
                                    left-2 
                                    px-2
                                    bg-white 
                                "
                            >
                                Durasi
                            </span>
                        {
                            durationOptionData.map((item, i) => (
                                <DurationButton
                                    key={i}
                                    id={`${item.duration}-${item.id}`}
                                    status={"OFF"}
                                    initDuration={0}
                                    duration={item.duration}
                                    durationActive={durationActive} 
                                    setDurationActive={setDurationActive}
                                    setOnDuration={setSelectedDuration}
                                />
                            ))
                        }
                        {
                            newDuration === 0 
                            ? 
                                (
                                    <DurationButtonNew
                                        isDurationNewActive={isDurationNewActive}
                                        setIsDurationNewActive={setIsDurationNewActive}
                                    />

                                )
                            : 
                                (

                                    <DurationButton
                                        id={`NEW-${newDuration}`}
                                        status={"OFF"}
                                        initDuration={0}
                                        duration={newDuration}
                                        durationActive={durationActive} 
                                        setDurationActive={setDurationActive}
                                        setOnDuration={setSelectedDuration}
                                        setNewDuration={setNewDuration}
                                        isNew
                                    />
                                )
                        }
                        </div>
                        {

                            isDurationNewActive && 
                            (
                                <div 
                                    className="
                                        w-2/3
                                        text-center
                                        mt-2
                                        border-t 
                                        border-spacing-1
                                        
                                    "
                                >
                                    <CustomDurationPicker onSelect={handleNewDurationSelect} />
                                </div>

                            )
                        
                        }
                    </div>

                    <div 
                        className="
                            relative
                            w-[55%]
                            flex 
                            gap-2 
                            p-2
                            pt-8
                            my-4
                            border 
                            border-spacing-1
                            rounded-xl
                        "
                    >
                        <span 
                            className="
                                absolute 
                                -top-3 
                                left-2 
                                px-2 
                                bg-white
                                text-slate-500
                            "
                        >
                            Atur Urutan Nyala Keran
                        </span>
                        <span
                            className="
                                absolute 
                                -top-2 
                                right-2 
                                px-2 
                                bg-white
                                text-slate-500
                            "
                        >
                            <Hint label={
                                isAlternate 
                                ? "nonaktifkan untuk nyala barengan"
                                : "aktifkan untuk nyala bergantian"
                            }>
                                <Switch
                                    checked={isAlternate}
                                    onCheckedChange={() => setIsAlternate(!isAlternate)}
                                    className={
                                        isAlternate ? "bg-font-primary" : "bg-neutral-200"
                                    }
                                />
                            </Hint>
                        </span>
                        <div 
                            className="
                                flex 
                                flex-col 
                                gap-2
                            "
                        >
                            { listData.map((item, i) => (
                                <span key={i} className="font-semibold text-font-primary">
                                    #{i + 1}.
                                </span>
                            ))}
                        </div>
                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="droppable">
                                {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={cn(`
                                        relative
                                        w-full
                                        transition-all  
                                        duration-500
                                        tracking-wide
                                        font-semibold
                                        text-neutral-500`
                                    )}
                                >
                                    {listData.map((item, index) => (
                                    <Draggable key={item.id} index={index} draggableId={item.id}>
                                        {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            style={{
                                                ...provided.draggableProps.style,
                                                top: "auto", // prevent jumping
                                                left: "auto", // prevent jumping
                                                zIndex: snapshot.isDragging ? 50 : "auto", // increase z-index while dragging
                                            }}
                                            className={cn(
                                                "mb-2",
                                                snapshot.isDragging &&
                                                "relative bg-gray-200 px-2 rounded-md z-50 opacity-100"
                                            )}
                                        >
                                            <div 
                                                className="
                                                    group 
                                                    flex 
                                                    justify-between 
                                                    items-center
                                                "
                                            >
                                            <div 
                                                className="
                                                    flex 
                                                    gap-2 
                                                    items-center
                                                "
                                            >
                                                <p>{item.name}</p>
                                                <UnfoldVertical 
                                                    className="
                                                        size-4 
                                                        opacity-0 
                                                        group-hover:opacity-100
                                                    " 
                                                />
                                                <p className="font-medium">{selectedDuration} Menit</p>
                                            </div>
                                            <Hint label="Aktif/Nonaktif">
                                                <Switch
                                                    checked={item.isBooked}
                                                    onCheckedChange={() => onKeranSwitch(index)}
                                                    className={
                                                        item.isBooked ? "bg-font-primary" : "bg-neutral-200"
                                                    }
                                                />
                                            </Hint>
                                            </div>
                                        </div>
                                        )}
                                    </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                                )}
                            </Droppable>
                            </DragDropContext>

                    </div>

                </div>
                <div>
                    <Button
                        onClick={onConfirm}
                        size={"lg"}
                        variant={"secondary"}
                        className="
                            w-full
                            text-white
                            bg-font-primary
                            hover:text-zinc-600
                        "
                    >
                        Confirm
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
