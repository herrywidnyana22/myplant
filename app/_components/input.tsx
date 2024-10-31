import { cn } from "@/lib/utils"

interface InputProps{
    name?: string
    value?: string
    label?: string
    disabled?: boolean
    placeholder?: string
    type?: "text" | "password" | "number" | "hidden" | "radio" | "checkbox"
    readOnly?: boolean
    className?: string
    onChange?: () => void | void
    editMode?: boolean
    required?: boolean
}

export const Input = ({
    name,
    value,
    type,
    label,
    placeholder,
    disabled,
    readOnly,
    className, 
    onChange,
    required,
    editMode= false,
}: InputProps) => {
    return ( 
    <>
        <input
            name={name}
            required={required}
            type={type}
            value={value}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder ? placeholder : "  "}
            onChange={onChange}
            className={cn(`
                text-sm
                w-full
                truncate
                peer
                p-1
                px-3
                pt-2
                font-light
                rounded-md
                border-2
                outline-none
                transition
                bg-white
                disabled:opacity-70
                disabled:cursor-not-allowed
                focus:text-sm`,
                className,
                disabled && "opacity-80 cursor-not-allowed",
                readOnly 
                ? "px-0 ring-0 shadow-none border-transparent bg-transparent font-semibold"
                : "shadow-sm",
                
            )}
        />
        {   !readOnly && editMode && ( 
            <label className={cn(`
                absolute
                top-2
                left-1
                px-1
                text-xs
                origin-[0]
                z-10
                duration-150
                text-font-primary
                transform`,
                !readOnly 
                && `
                    left-2
                    -translate-y-4
                    bg-white
                    pointer-events-none
                    peer-placeholder-shown:scale-100
                    peer-placeholder-shown:translate-y-0
                    peer-focus:scale-90
                    peer-focus:-translate-y-4
                `,
            )}>
                { label }
            </label>
        )}
    </>
    );
}