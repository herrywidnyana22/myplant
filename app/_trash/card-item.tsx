'use client'

import { cn } from "@/lib/utils";
import { useConfirm } from "../hooks/use-confirm";
import { toast } from "sonner";
import { useState } from "react";
import { SetupDialog } from "./setup-dialog";

type CardItemProps={
    status: "ON" | "OFF",
    mode?: "AUTO" | "MANUAL"
    runStatus?: "Running" | "Delayed" | "OFF"
    label: string
}

export const CardItem = ({
    status,
    mode= "MANUAL",
    runStatus="OFF",
    label

}: CardItemProps) => {

    const [isCentang, setIsCentang] = useState(false)
    const [setupOpen, setSetupOpen] = useState(false)

    // const onChekboxChange = async() =>{
    //     setSetupOpen(true)
    // }


    return ( 
    <>
        <SetupDialog
            label={`Atur ${label}`}
            isChecked={isCentang}
            setIsChecked={setIsCentang}
            isOpen={setupOpen}
            setIsOpen={setSetupOpen}
        />
        <label
            className={cn(`
                peer
                relative
                bg-primary-1`,
                status === "OFF"
                ? 'cursor-not-allowed opacity-50 pointer-events-none'
                : 'cursor-pointer'
            )}
        >
            <input 
                type="checkbox"
                onChange={() => setSetupOpen(true)}
                checked={isCentang}
                className="
                    peer
                    absolute
                    opacity-0
                    cursor-pointer
                "
            />
            <div
                className="
                    size-64
                    flex
                    flex-col
                    justify-between
                    p-6
                    list-none
                    rounded-3xl
                    transition-shadow
                    shadow-card-shadow 
                    peer-checked:shadow-card-shadow-inner
                    peer-checked:scale-95
                "
            >
                <div
                    className="
                        flex
                        justify-between
                    "
                >
                    <span 
                        className={cn(`
                            w-4 
                            h-4 
                            rounded-full`,
                            status === "ON" 
                            ? 'bg-green-500'
                            : 'bg-rose-500'

                        )}
                    />
                    <span className="text-muted-foreground">{mode}</span>
                </div>
                <div
                    className="
                        flex
                        items-center
                        justify-center
                        text-font-primary
                    "
                >

                    <h1
                        className="
                            text-3xl
                            font-bold
                        "
                    >
                        { label }
                    </h1>
                </div>
                <div
                    className="
                        flex
                        justify-between
                    "
                >
                    <span className="text-muted-foreground">{runStatus}</span>
                    <span>00:00:00</span>
                </div>
            </div>
        </label>
    </>
    );
}