import { toast } from "sonner";
import { useConfirm } from "../hooks/use-confirm";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CustomButton } from "./custom-button";

type SetupDialogProps = {
    label: string
    isChecked: boolean
    setIsChecked:  (isChecked: boolean)=>void
    isOpen: boolean
    setIsOpen: (isOpen: boolean) => void
}
export const SetupDialog = ({
    isOpen,
    setIsOpen,
    setIsChecked,
    label
}: SetupDialogProps) => {
    const [Confirmation, confirm] = useConfirm(
        "Are you sure?",
        "This action can't undo"
    )

    const onSave = async() =>{
        const isOk = await confirm()

        if(!isOk) return

        setIsChecked(true)
        setIsOpen(false)

        toast.success("okkeee")
    }

    return ( 
        <>
            <Confirmation/> 
            <Dialog
                open={isOpen}
                onOpenChange={setIsOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            { label }
                        </DialogTitle>
                    </DialogHeader>
                    <DialogFooter>
                        <CustomButton
                            type="button"
                            onClick={onSave}
                            disabled={false}
                        >
                            Simpan
                        </CustomButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}