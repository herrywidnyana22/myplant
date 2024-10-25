import { useEffect, useState } from "react";
import { UseKeranStatus } from "../hooks/use-keran-status";
import { formatCapitalize } from "../utils/format-capitalize";
import { CardItem } from "./card-item";
import { ConnectionStatus } from "./connection-status";

export const Card = () => {
    const data = UseKeranStatus()
    const [keranData, setKeranData] = useState(data)

    useEffect(() => {
        setKeranData(data)
    }, [data])
    
    console.log({keranData})
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
                <ConnectionStatus/>
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
                {
                    keranData.map((item, i) =>(
                        <CardItem
                            key={i}
                            id={i}
                            label={formatCapitalize(item.name)}
                            status={item.status}
                            duration={item.duration}
                            mode={(item.duration > 0 && item.status !== "OFF") ? "TIMER" : "NO TIMER"}
                            time={item.runtime}
                        />
                    ))
                }
            </div>
        </div>
    );
}