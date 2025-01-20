import { toast } from "sonner";
import { useMqtt } from "../context/MqttContex";

type UsePublishProps = {
    topic: string
    msg: string
    msgSuccess: string
    msgError: string
};

export const  usePublish = () => {
    const { client } = useMqtt()
    
    const publishMessage = ({ topic, msg, msgSuccess, msgError }: UsePublishProps) => {
        if (client) {
            client.publish(topic, msg, (err) => {
                if (err) {
                    console.error('Failed to publish message:', err);
                    return toast.error(msgError)
                } else {
                    console.log('Message published successfully:', msg);
                    return toast.success(msgSuccess)
                }
            })
        } else {
            console.error('MQTT client not connected')
            return toast.error('MQTT client not connected')
        }
    };

    return { publishMessage }
};
