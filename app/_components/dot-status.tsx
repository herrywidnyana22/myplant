import { cn } from "@/lib/utils";
import { MqttStatusProps } from "../types/MqttStatustype";
import { KeranStatusProps } from "../types/KeranStatusType";
import { Hint } from "./hint";

// Define the props type
type DotStatusProps = {
  connectStatus: MqttStatusProps["status"] | KeranStatusProps["status"];
}

export const DotStatus = ({ connectStatus }: DotStatusProps) => {
  return (
    <Hint label={connectStatus}>
      <span
        className={cn(
          `w-4 h-4 rounded-full`,
          (connectStatus === "OFF" || connectStatus === "DEVICE DISCONNECTED") && 'bg-rose-500',
          (connectStatus === "DEVICE CONNECTED" || connectStatus === "MQTT CONNECTED" || connectStatus === "RUNNING") && 'bg-green-500',
          (connectStatus === "CONNECTING") && 'bg-blue-500',
          (connectStatus === "PAUSED") && 'bg-orange-500',
        )}
      />
    </Hint>
  );
};
