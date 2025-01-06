type DynamicIslandProps = {
    children: React.ReactNode
}

export const DynamicIsland = ({children}: DynamicIslandProps) => {
    return ( 
        <div
            className="
                max-w-[50%]
                flex 
                flex-col
                px-6
                py-1
                rounded-full
                text-sm
                font-semibold
                text-zinc-500
            "
        >
            {children}
        </div>
    );
}