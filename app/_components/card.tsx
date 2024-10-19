import {MQTTClient} from "../_db/mqttClient";
import { CardItem } from "./card-item";

export const Card = () => {
    return ( 
        <div
            className="
                relative 
                w-full
                rounded-3xl
                m-24
                p-5
                shadow-card-shadow
            "
        >
            <div
                className="
                    flex
                    justify-between
                "
            >

                <h1 
                    className="
                        text-xl 
                        font-semibold 
                        mb-10
                        text-font-primary
                    "
                >
                    Device 1
                </h1>
                <MQTTClient/>
            </div>
            <div 
                className="
                    flex 
                    flex-wrap 
                    gap-6
                    justify-center 
                    items-center 
                "
            >
                <CardItem
                    label="Keran 1"
                    status={"ON"}
                />
                <CardItem
                    label="Keran 2"
                    status={"ON"}
                />
                <CardItem
                    label="Keran 3"
                    status={"ON"}
                />
                <CardItem
                    label="Keran 4"
                    status={"OFF"}
                />
                
            </div>
        </div>
    );
}