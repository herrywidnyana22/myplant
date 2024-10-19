import { cn } from "@/lib/utils";

type DotStatusProps = {
    status: "CONNECTED"  | "DISCONNECTED"
}

export const DotStatus = ({status}: DotStatusProps) => {
    return ( 
        <span 
            className={cn(`
                w-4 
                h-4 
                rounded-full`,
                status === "CONNECTED"
                ? 'bg-green-500'
                : 'bg-rose-500'

            )}
        />
    );
}