import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverClose,
} from "@/components/ui/popover";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";

import { KeranDataProps } from "../hooks/use-keran-status";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import CustomDurationPicker from "./custom-duration-picker";
import { Switch } from "@/components/ui/switch";
import { PopoverDatePicker } from "./popover-calendar-picker";
import { Button } from "@/components/ui/button";
import { durationOptionData } from "../data/duration-option";
import { DurationButton } from "./duration-button";
import { DurationButtonNew } from "./duration-button-new";
import { Hint } from "./hint";
import { toast } from "sonner";
import { usePublish } from "../hooks/use-publish";
import { X } from "lucide-react";

type PopoverSpecialModeProps = {
  children: React.ReactNode;
  data: KeranDataProps[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const TIME_MINIMAL_FROM_CURRENT = 5;

export const PopoverSpecialMode = ({
  children,
  data,
  open,
  onOpenChange,
}: PopoverSpecialModeProps) => {
  const [listData, setListData] = useState(data);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isNow, setIsNow] = useState(false);
  const [isAlternate, setIsAlternate] = useState(true);
  const [hour, setHour] = useState(new Date().getHours());
  const [minute, setMinute] = useState(
    new Date().getMinutes() + TIME_MINIMAL_FROM_CURRENT,
  );
  const [durationActive, setDurationActive] = useState("");
  const [newDuration, setNewDuration] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(0);
  const [isDurationNewActive, setIsDurationNewActive] = useState(false);

  const { publishMessage } = usePublish();

  const formatTime = (selectedHour: number, selectedMinute: number) => {
    // Ensure hour and minute are always two digits
    const formattedHour = String(selectedHour).padStart(2, "0");
    const formattedMinute = String(selectedMinute).padStart(2, "0");
    return `${formattedHour}:${formattedMinute}`;
  };

  const reorder = (
    list: KeranDataProps[],
    startIndex: number,
    endIndex: number,
  ) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination) return;

    setListData(reorder(listData, source.index, destination.index));
  };

  const handleNewDurationSelect = (newDurasi: number) => {
    setNewDuration(newDurasi);
    setIsDurationNewActive(false);
  };

  const allBooked = useMemo(
    () => listData.every((item) => item.isBooked),
    [listData],
  );

  const onKeranSwitch = (index: number) => {
    setListData((prevList) =>
      prevList.map((item, i) =>
        i === index
          ? {
              ...item,
              isBooked: !item.isBooked,
            }
          : item,
      ),
    );
  };

  const onToggleAllKerans = () => {
    setListData((prevList) =>
      prevList.map((item) => ({
        ...item,
        isBooked: !allBooked,
      })),
    );
  };

  const onConfirm = async () => {
    const now = new Date();
    const selectedDatetime = new Date(selectedDate);

    selectedDatetime.setHours(hour);
    selectedDatetime.setMinutes(minute);
    selectedDatetime.setSeconds(0);

    const minimumTime = new Date(
      now.getTime() + TIME_MINIMAL_FROM_CURRENT * 60 * 1000,
    ); // Add 5 minutes

    if (!isNow && selectedDatetime <= minimumTime) {
      return toast.error("Jadwal minimal 5 menit dari sekarang!");
    }

    if (selectedDuration <= 0) {
      return toast.error("Tentukan durasi keran hidup!");
    }

    const order = listData
      .filter((keran) => keran.isBooked)
      .map((keran) => {
        const match = keran.id.match(/\d+/);
        return match ? Number(match[0]) : null;
      })
      .filter((value): value is number => value !== null);

    if (order.length === 0) {
      return toast.error("Minimal 1 keran aktif!");
    }

    const topic = "myplant/keranmode";
    const msgSuccess = "Mode spesial berhasil diterapkan";
    const msgError = "Mode spesial gagal diterapkan!";
    const formattedDate = selectedDate.toLocaleDateString("en-CA");

    const msg = JSON.stringify({
      order,
      nextDuration: selectedDuration,
      startDate: isNow ? "now" : formattedDate,
      startTime: isNow ? "now" : formatTime(hour, minute),
      isAlternate,
    });

    publishMessage({ topic, msg, msgSuccess, msgError });

    onOpenChange(false);
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="center"
        side="top"
        sideOffset={12}
        className="
                    relative
                    w-full
                    max-w-[42rem]
                    min-w-[20rem]
                    px-4
                    py-3
                    md:px-0
                    md:py-0
                    rounded-[28px]
                    animate-none
                "
      >
        <div className="relative flex min-h-[24rem] flex-col overflow-hidden rounded-[28px] border border-neutral-200 bg-white shadow-xl shadow-slate-100">
          <PopoverClose asChild>
            <button
              type="button"
              className="absolute right-4 top-4 inline-flex size-10 items-center justify-center rounded-full text-slate-500 transition hover:bg-rose-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-font-primary"
            >
              <X className="size-4" />
              <span className="sr-only">Close</span>
            </button>
          </PopoverClose>
          <div className="px-4 py-3 md:px-5 md:py-4">
            <h1 className="text-xl font-semibold text-slate-900">
              Mode Spesial
            </h1>
          </div>
          <div className="max-h-[62vh] min-h-[24rem] overflow-auto bg-slate-50 px-4 pb-4 pt-2 md:px-5 md:pb-5 md:pt-3">
            <div className="grid gap-3 lg:grid-cols-[1.3fr_1.7fr]">
              <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-900">
                    Waktu Mulai
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Pilih kapan mode spesial dimulai. Aktifkan untuk mulai
                    sekarang.
                  </p>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-slate-50 px-3 py-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-slate-700">
                      Mulai sekarang
                    </div>
                    <Switch
                      checked={isNow}
                      onCheckedChange={() => setIsNow(!isNow)}
                    />
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
                </div>

                <div className="rounded-3xl border border-neutral-200 bg-slate-50 p-3">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Durasi
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Pilih durasi setiap keran hidup sebelum melanjutkan ke
                        urutan berikutnya.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {durationOptionData.map((item, i) => (
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
                    ))}
                    {newDuration === 0 ? (
                      <DurationButtonNew
                        isDurationNewActive={isDurationNewActive}
                        setIsDurationNewActive={setIsDurationNewActive}
                      />
                    ) : (
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
                    )}
                  </div>

                  {isDurationNewActive && (
                    <div className="mt-4 border-t border-neutral-200 pt-4">
                      <CustomDurationPicker
                        onSelect={handleNewDurationSelect}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl border border-neutral-200 bg-white p-3 shadow-sm">
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-slate-900">
                      Mode Keran
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Kontrol pilihan urutan dan bagaimana keran menyala dalam
                      mode spesial.
                    </p>
                  </div>

                  <div className="mt-4 grid gap-2">
                    <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3">
                      <div className="text-sm font-medium text-slate-700">
                        Bergiliran
                      </div>
                      <Hint
                        label={
                          isAlternate
                            ? "nonaktifkan untuk nyala barengan"
                            : "aktifkan untuk nyala bergantian"
                        }
                      >
                        <Switch
                          checked={isAlternate}
                          onCheckedChange={() => setIsAlternate(!isAlternate)}
                          className={
                            isAlternate ? "bg-font-primary" : "bg-neutral-200"
                          }
                        />
                      </Hint>
                    </div>

                    <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-slate-50 px-4 py-3 mb-3">
                      <div className="text-sm font-medium text-slate-700">
                        Aktifkan semua keran
                      </div>
                      <Switch
                        checked={allBooked}
                        onCheckedChange={onToggleAllKerans}
                        className={
                          allBooked ? "bg-font-primary" : "bg-neutral-200"
                        }
                      />
                    </div>
                  </div>
                  <div className="rounded-xl border border-neutral-200 bg-white p-3 shadow-sm">
                    <div className="mb-4 space-y-1">
                      <p className="text-sm font-semibold text-slate-900">
                        Atur Urutan Nyala
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Seret untuk mengubah prioritas keran dan gunakan switch
                        untuk memilih keran aktif.
                      </p>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="droppable">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="space-y-3"
                          >
                            {listData.map((item, index) => (
                              <Draggable
                                key={item.id}
                                index={index}
                                draggableId={item.id}
                              >
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    style={{
                                      ...provided.draggableProps.style,
                                      zIndex: snapshot.isDragging ? 50 : "auto",
                                    }}
                                    className={cn(
                                      "w-full max-w-full rounded-3xl border border-neutral-200 bg-slate-50 p-3 transition-shadow duration-200 cursor-grab",
                                      snapshot.isDragging &&
                                        "shadow-lg ring-1 ring-font-primary/30 cursor-grabbing",
                                    )}
                                  >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex min-w-0 flex-1 items-center gap-2">
                                        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-font-primary/10 text-font-primary font-semibold">
                                          {index + 1}
                                        </span>
                                        <div className="min-w-0">
                                          <p className="truncate font-semibold text-slate-900">
                                            {item.name}
                                          </p>
                                          <p className="text-sm break-words text-muted-foreground">
                                            {selectedDuration} menit
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex flex-shrink-0 items-center gap-2">
                                        <Hint label="Aktif/Nonaktif">
                                          <Switch
                                            checked={item.isBooked}
                                            onCheckedChange={() =>
                                              onKeranSwitch(index)
                                            }
                                            className={
                                              item.isBooked
                                                ? "bg-font-primary"
                                                : "bg-neutral-200"
                                            }
                                          />
                                        </Hint>
                                      </div>
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
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-200 bg-white px-5 py-4 md:px-6 md:py-5">
            <Button
              onClick={onConfirm}
              size={"lg"}
              variant={"secondary"}
              className="w-full text-white bg-font-primary hover:text-zinc-600"
            >
              Confirm
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
