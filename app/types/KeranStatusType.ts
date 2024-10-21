export type KeranStatusProps={
    switchStatus: "ON" | "OFF"
    runningStatus?: "START" | "PAUSE" | "STOP" | null
    progressStatus?: "RUNNING" | "DELAYED" | "PAUSED" | "OFF"
}