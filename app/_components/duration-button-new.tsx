import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

type NewDurationProps={
    isDurationNewActive: boolean, 
    setIsDurationNewActive: (isDurationNewActive: boolean) => void
}

export const DurationButtonNew = ({isDurationNewActive, setIsDurationNewActive}: NewDurationProps) => {

    const handleButtonClick = () =>{
        setIsDurationNewActive(!isDurationNewActive)
    }

    return ( 
         <div
            onClick={handleButtonClick}
            className={cn(`
                relative
                w-12
                h-12
                flex
                justify-center
                items-center
                rounded-full
                transition-shadow
                cursor-pointer
                text-slate-400
                bg-white`,
                isDurationNewActive 
                ? 'shadow-shadow-button-active'
                : 'shadow-shadow-button'
            )}
        >
            <div 
                className="
                    flex 
                    flex-col 
                    items-center 
                    justify-center
                "
            >
                <Plus className="size-4"/>
            </div>
        </div>
    );
}