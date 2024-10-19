
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";


type CustomButtonProps = {
    type? : "submit" | "button"
    disabled: boolean
    className?: string
    size?: "default" | "sm" | "lg" | "icon"
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
    onClick?: () => void
    children: React.ReactNode
}

export const CustomButton = ({
    type="button", 
    disabled=false, 
    className,
    size="lg",
    variant="default",
    onClick,
    children
}: CustomButtonProps) => {
    return ( 
        <Button
            onClick={onClick}
            type={type}
            size={size}
            variant={variant}
            disabled={disabled}
            className={className}
        >
            {
                disabled
                ? <Loader2 className="size-4 animate-spin" /> 
                : children
            }
        </Button>
    );
}