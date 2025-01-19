export type KeranStatusProps={
    status: "RUNNING" | "PAUSED" | "OFF"
}

export type DeviceModeProps={
    mode: "MANUAL" | "SCHEDULE"
    startDate: string
    startTime: string
    booked: string[]
}