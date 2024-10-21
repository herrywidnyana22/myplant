import { cn } from "@/lib/utils";
import { MqttStatusProps } from "../types/MqttStatustype";

// Define the props type
type DotStatusProps = {
  connectStatus: MqttStatusProps["status"];
};

export const DotStatus = ({ connectStatus }: DotStatusProps) => {
  return (
    <span
      className={cn(
        `w-4 h-4 rounded-full`,
        connectStatus === "OFF" && 'bg-rose-500',
        connectStatus === "CONNECTED" && 'bg-green-500',
        connectStatus === "RECONNECTING" ||  connectStatus === "CONNECTING" && 'bg-blue-500',
      )}
    />
  );
};
