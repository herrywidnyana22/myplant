import { toast } from "sonner";
import { useMqtt } from "../context/MqttContex";

type UsePublishProps = {
    topic: string
    msg: string
    msgSuccess: string
    msgError: string
    onDone?: () => void
}

export const usePublish = () => {
    const { client, connectStatus } = useMqtt()

    const publishMessage = ({ 
        topic, 
        msg, 
        msgSuccess, 
        msgError,
        onDone
    }: UsePublishProps) => {

        if (!client) {
            toast.error("MQTT client not connected")
            onDone?.()
            return
        }

        if (connectStatus === "DEVICE DISCONNECTED") {
            toast.error("Device offline...!")
            onDone?.()
            return
        }

        client.publish(topic, msg, (err) => {
        if (err) {
            toast.error(msgError)
            onDone?.()
            return
        }

        // Wait for ACK response
        const confirmationTimeout = setTimeout(() => {
            toast.error("Tidak dapat terhubung ke device...!")
            onDone?.()
        }, 5000)

        client.once("message", (confirmTopic, payload) => {
            if (confirmTopic !== "myplant/confirm") return

                const message = payload.toString()
                toast.success(message === "ok" ? msgSuccess : msgError)

                clearTimeout(confirmationTimeout)
                onDone?.()
            })
        })
    }

    return { publishMessage }
}
