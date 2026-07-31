"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useMqtt } from "../context/MqttContex";
import { ConnectionStatus } from "./connection-status";
import { CardItem } from "./card-item";
import { formatCapitalize } from "../utils/format-capitalize";
import { useKeranStatus } from "../hooks/use-keran-status";
import {
  RefreshCw,
  CalendarClock,
  Clock,
  Layers,
  Play,
  Settings,
  SquareStack,
} from "lucide-react";
import { Hint } from "./hint";
import { PopoverSpecialMode } from "./popover-special-mode";
import { cn } from "@/lib/utils";
import { DynamicIsland } from "./dynamic-island";
import { useConfirm } from "../hooks/use-confirm";
import { usePublish } from "../hooks/use-publish";
import { KeranStatusProps } from "../types/KeranStatusType";

export const Card = () => {
  const { combineStatus, deviceModeMsg } = useKeranStatus();
  const { client, connectStatus, setConnectStatus } = useMqtt();

  const [keranData, setKeranData] = useState(combineStatus);
  const [isCollapse, setIsCollapse] = useState(false);
  const [isSpesialMode, setIsSpesialMode] = useState(false);
  const [dateLabel, setDateLabel] = useState<string | null>(null);
  const [durationLabel, setDurationLabel] = useState<string | null>(null);
  const [runningNames, setRunningNames] = useState<string>("");
  const [numOfRunning, setNumOfRunning] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsloading] = useState(false);

  const { publishMessage } = usePublish();

  const [ConfirmSwitched, confirm] = useConfirm(
    `Yakin ingin mengubah mode?`,
    "Ini akan mematikan semua keran terlebih dahulu",
    isLoading,
    setIsloading,
  );

  useEffect(() => {
    setKeranData(combineStatus);

    if (!combineStatus || combineStatus.length === 0) {
      setConnectStatus("DEVICE DISCONNECTED");
    } else {
      setConnectStatus("DEVICE CONNECTED");
    }

    const runningKeran = combineStatus
      .filter((item) => item.status === "RUNNING")
      .map((item) => item.name)
      .join(", ");

    const runningKeranCount = combineStatus.filter(
      (item) => item.status === "RUNNING",
    ).length;

    setRunningNames(runningKeran);
    setNumOfRunning(runningKeranCount);
  }, [combineStatus, setConnectStatus]);

  useEffect(() => {
    if (!deviceModeMsg || deviceModeMsg.length === 0) {
      setDateLabel(null);
      setDurationLabel(null);
      return;
    }

    const { startDate, startTime, duration } = deviceModeMsg[0];

    // Check if startDate and startTime are "now"
    const label = () => {
      if (!startDate) return null;

      if (startDate === "now" && startTime === "now") {
        return "now";
      } else {
        return `${startDate} ${startTime}`;
      }
    };

    const durasiLabel = duration === 0 ? null : `${duration} minute`;

    setDateLabel(label);
    setDurationLabel(durasiLabel);
  }, [deviceModeMsg]);

  const handleSettingsClick = async () => {
    // Get active keran data
    const activeKeran = keranData
      .filter((keran) => keran.status === "RUNNING")
      .map((keran) => {
        const match = keran.id.match(/\d+/);
        return match ? Number(match[0]) : null;
      });
    if (activeKeran.length === 0 || activeKeran === null) {
      setIsSpesialMode(true);
    } else {
      // Show confirmation dialog
      const isOk = await confirm();
      if (isOk) {
        // turn off all active keran
        controlKeran("OFF", activeKeran, 0);

        // Show popover
        setIsSpesialMode(true);
      }
    }
  };

  const controlKeran = (
    action: KeranStatusProps["status"],
    data: (number | null)[],
    duration: number,
  ) => {
    setIsloading(true);

    const topic = "myplant/bulkcontrol";

    const msgSuccess = `Semua keran berhasil di-OFF kan...`;
    const msgError = `Semua keran GAGAL di-OFF kan...`;

    const msg = JSON.stringify({
      listKeran: data,
      status: action,
      duration,
    });

    publishMessage({
      topic,
      msg,
      msgSuccess,
      msgError,
      onDone: () => setIsloading(false),
    });
  };

  const handleSync = () => {
    if (!client) {
      toast.error("MQTT client not connected");
      return;
    }

    setIsSyncing(true);

    client.publish(
      "myplant/web/connected",
      "online",
      { qos: 1, retain: false },
      (err) => {
        setIsSyncing(false);

        if (err) {
          toast.error("Gagal mengirim sync");
          return;
        }

        const now = new Date();
        const weekday = now.toLocaleDateString("id-ID", { weekday: "long" });
        const day = String(now.getDate()).padStart(2, "0");
        const month = now.toLocaleDateString("id-ID", { month: "short" });
        const year = now.getFullYear();
        const hour = String(now.getHours()).padStart(2, "0");
        const minute = String(now.getMinutes()).padStart(2, "0");
        setLastSync(`${weekday}, ${day} ${month} ${year} ${hour}:${minute}`);
        toast.success("Sync request terkirim");
      },
    );
  };

  return (
    <>
      <div
        className="
                relative
                w-full
                max-w-md
                rounded-3xl
                m-auto
                p-5
                shadow-card-shadow
            "
      >
        <div
          className="
                    flex
                    justify-between
                    items-center
                    mb-8
                "
        >
          <div className="flex flex-col gap-2">
            <div
              className="
                            flex
                            items-center
                            gap-4
                        "
            >
              <ConnectionStatus />
              <p
                className="
                                text-xl 
                                font-semibold 
                                text-font-primary
                            "
              >
                Noid 1
              </p>
            </div>
          </div>
          {connectStatus === "DEVICE CONNECTED" && (
            <>
              <DynamicIsland>
                {(dateLabel || durationLabel) && (
                  <>
                    <span className="flex gap-2 items-center">
                      <CalendarClock className="size-4" />
                      <p>{dateLabel}</p>
                    </span>
                    <span className="flex gap-2 items-center">
                      <Clock className="size-4" />
                      <p>{durationLabel}</p>
                    </span>
                  </>
                )}
                {runningNames !== "" && (
                  <Hint label={`${numOfRunning} ON: ${runningNames}`}>
                    <span className="flex gap-2">
                      <Play className="size-4 flex-shrink-0" />
                      <p className="truncate">{runningNames}</p>
                    </span>
                  </Hint>
                )}
              </DynamicIsland>
              <div
                className="
                                flex
                                justify-end
                                items-center
                                gap-4
                            "
              >
                {connectStatus === "DEVICE CONNECTED" && (
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={handleSync}
                  >
                    <RefreshCw
                      className={`size-4 transition-transform duration-500 text-slate-500 cursor-pointer ${
                        isSyncing ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                )}
                {keranData.length > 0 && (
                  <div
                    className="
                                    text-slate-500
                                    cursor-pointer 
                                "
                  >
                    {!isCollapse ? (
                      <Hint label="Collapse">
                        <div onClick={() => setIsCollapse(true)}>
                          <Layers className="size-4" />
                        </div>
                      </Hint>
                    ) : (
                      <Hint label="Expand">
                        <div onClick={() => setIsCollapse(false)}>
                          <SquareStack className="size-4" />
                        </div>
                      </Hint>
                    )}
                  </div>
                )}
                {connectStatus === "DEVICE CONNECTED" && (
                  <PopoverSpecialMode
                    data={keranData}
                    open={isSpesialMode}
                    onOpenChange={(open) => setIsSpesialMode(open)}
                  >
                    <Settings
                      onClick={handleSettingsClick}
                      className="
                                        size-5 
                                        cursor-pointer 
                                        text-font-primary
                                    "
                    />
                  </PopoverSpecialMode>
                )}
              </div>
            </>
          )}
        </div>
        {connectStatus === "DEVICE CONNECTED" ? (
          <div
            className={
              cn(` 
                            h-[600px]
                            relative
                            flex
                            flex-col
                            gap-5
                            p-2
                            overflow-y-auto
                            scroll-smooth`)
              // isCollapse && "overflow-hidden"
            }
          >
            {keranData.map((item, i) => (
              <CardItem
                key={i}
                id={i}
                label={formatCapitalize(item.name)}
                status={item.status}
                duration={item.duration}
                durationMode={item.duration > 0 ? "TIMER" : "NO TIMER"}
                time={item.runtime}
                collapse={isCollapse}
                dateLabel={dateLabel}
                durationLabel={durationLabel}
                disabled={deviceModeMsg[0]?.booked.includes(i)}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-slate-400 italic">
            Device tidak terhubung, silahkan cek device
          </p>
        )}
        <p className="text-xs text-slate-400 text-center mt-2">
          Last sync: {lastSync ?? "belum ada"}
        </p>
      </div>

      <ConfirmSwitched />
    </>
  );
};
