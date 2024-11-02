import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { DragDropContext, Draggable, Droppable, DropResult } from '@hello-pangea/dnd';
import { RelayStatusProps } from "../hooks/use-keran-status";
import { useState } from "react";
import { cn } from "@/lib/utils";
import CustomDurationPicker from "./custom-duration-picker";
import { Switch } from "@/components/ui/switch";
import { PopoverDatePicker } from "./popover-calendar-picker";
import { addHours, startOfDay } from "date-fns";
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
    isSpesialMode?: boolean
    data: RelayStatusProps[]
    setIsSpesialMode: (isSpesialMode: boolean) => void
}

export const PopoverSpecialMode = ({
    children,
    data,
    isSpesialMode,
    setIsSpesialMode
    
}: PopoverSpecialModeProps) => {

    const [listData, setListData] = useState(data)
    const [date, setDate] = useState<Date>(startOfDay(addHours(new Date(), 8)))
    const [isNow, setIsNow] = useState(false)
    const [hour, setHour] = useState(0)
    const [minute, setMinute] = useState(0)
    const [durationActive, setDurationActive] = useState("")
    const [newDuration, setNewDuration]= useState(0)
    const [selectedDuration, setSelectedDuration]= useState(0)
    const [isDurationNewActive, setIsDurationNewActive] = useState(false)
    const [keranActives, setKeranActives] = useState(() => 
        data ? data.map(() => true) : []
    )

    const { publishMessage } = usePublish()

    const reorder = (
        list: RelayStatusProps[],
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

    const onKeranSwitch = (checked: boolean, index: number) => { 
        setKeranActives((prev) =>
            prev.map((value, i) => (i === index ? checked : value))
        )
    }

    const onConfirm = () => {
        if (keranActives.every(value => !value)) {
            return toast.error("Minimal 1 keran aktif!");
        }
        if (selectedDuration <= 0) {
            return toast.error("Tentukan durasi keran hidup!");
        }

        const topic = 'myplant/mode';
        const msgSuccess = "Mode spesial berhasil diterapkan";
        const msgError = "Mode spesial gagal diterapkan!";
        const formattedDate = date.toISOString().split('T')[0];

        // Create the `order` and `isActive` arrays
        const order = listData.map(keran => Number(keran.id) - 1); // Extract the `id` values
        const isActive = listData.map((_, i) => keranActives[i]); // Extract `isActive` values based on index

        // Construct the message
        const msg = JSON.stringify({
            order,
            isActive,
            nextDuration: selectedDuration,
            startDate: isNow ? "now" : formattedDate,
            startTime: isNow ? "now" : `${hour}:${minute}`,
        });

        publishMessage({ topic, msg, msgSuccess, msgError });

        console.log({ listData });
    };



    return (
        <Popover onOpenChange={() => setIsSpesialMode(!isSpesialMode)}>
            <PopoverTrigger asChild>
                {children}
            </PopoverTrigger>
            <PopoverContent 
                className="
                    relative 
                    w-3/4
                    flex 
                    flex-col 
                    gap-4 
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
                    <p 
                        className="
                            text-muted-foreground 
                            text-sm
                        "
                    >
                        Kamu bisa atur durasi serta kapan keran diaktifkan
                    </p>
                </div>

                <div 
                    className="
                        relative 
                        flex
                        flex-col
                        justify-center
                        items-center
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
                        setDate={setDate}
                        date={date}
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
                                text-neutral-500
                                `)}
                            >
                                {listData.map((item, index) => (
                                <Draggable key={item.id} index={index} draggableId={item.id}>
                                    {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        // Ensure you manage styles for smooth drag behavior
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
                                        <div className="group flex justify-between items-center">
                                        <div className="flex gap-2 items-center">
                                            <p>{item.name}</p>
                                            <UnfoldVertical className="size-4 opacity-0 group-hover:opacity-100" />
                                            <p className="font-medium">{selectedDuration} Menit</p>
                                        </div>
                                        <Hint label="Aktif/Nonaktif">
                                            <Switch
                                                checked={keranActives[index]}
                                                onCheckedChange={(checked) => onKeranSwitch(checked, index)}
                                                className={
                                                    keranActives[index] ? "bg-font-primary" : "bg-neutral-200"
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
