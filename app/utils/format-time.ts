// Format runtime into HH:MM:SS
    export const formatTime = (milliseconds: number): string => {
        const seconds = Math.floor(milliseconds / 1000) // Convert milliseconds to seconds
        const hours = String(Math.floor(seconds / 3600)).padStart(2, '0') // Total hours
        const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0') // Minutes
        const secs = String(Math.floor(seconds % 60)).padStart(2, '0') // Seconds
        return `${hours}:${minutes}:${secs}`
    }

    export function milisToMinutes(ms: number): number {
        return Math.floor(ms / 60000)
    }