
'use client'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

import { CustomButton } from "../_components/custom-button"
import { useState } from "react"
import { Loader2 } from "lucide-react"


export const useConfirm = (
    title: string,
    msg: string,
    isLoading: boolean,
    setIsLoading: (val: boolean) => void
): [() => JSX.Element, () => Promise<unknown>] => {
   
    const [promise, setPromise,] = useState<{ resolve: (value:boolean) => void  } | null>(null)

    const confirm = () => new Promise((resolve) => {
        setPromise({resolve})
    })

    const onClose = () =>{
        setPromise(null)
    }

    const onCancel = () =>{
        setIsLoading(false)
        promise?.resolve(false)
        onClose()
    }

    const onConfirm = () =>{
        if(!isLoading){
            promise?.resolve(true)
            onClose()

        }
    }

    const ConfirmDialog = () =>(
        <Dialog
            open={promise !== null}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        { title }
                    </DialogTitle>
                    <DialogDescription>
                        { msg }
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter 
                    className="
                        pt-2 
                        gap-2 
                        md:items-center 
                        md:gap-0
                    "
                >
                    <Button
                        disabled={isLoading}
                        variant={"outline"}
                        onClick={onCancel}
                    >
                        Cancel
                    </Button>
                    <CustomButton
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-font-primary"
                    >
                        {
                            isLoading
                            ? <Loader2 className="size-4 animate-spin" />
                            : "Confirm"
                        }
                    </CustomButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )

    return [ConfirmDialog, confirm]
}