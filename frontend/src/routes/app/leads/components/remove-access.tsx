import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { TagLead } from "@/types/leads";
import { TrashIcon } from "lucide-react";
import DeleteAccessConfirmation from "./delete-access-confirmation";
import { useState } from "react";

interface Props {
    open: boolean,
    setOpen: (value:boolean) => void,
    leadId: string,
    access: TagLead[];
    onCreate: () => void;
}

export default function RemoveAccess({
    open,
    setOpen,
    access,
    leadId,
    onCreate
}: Props){
    const [selectedAccess, setSelectedAccess] = useState<TagLead>();
    const [isOpenAlert, setIsOpenAlert] = useState(false);

    // This function handles the inner dialog's open state
    // and prevents the parent dialog from closing
    const handleAlertOpenChange = (newOpen: boolean) => {
        setIsOpenAlert(newOpen);
    };

    // This prevents the parent dialog from closing when 
    // the inner dialog is open
    const handleOpenChange = (newOpen: boolean) => {
        if (isOpenAlert) {
            // If alert is open, prevent parent dialog from closing
            return;
        }
        setOpen(newOpen);
    };

    return (
        <>
            <DeleteAccessConfirmation
                tag={selectedAccess}
                leadId={leadId}
                open={isOpenAlert}
                setOpen={handleAlertOpenChange}
                onDelete={onCreate}
            />

            <Dialog
                open={open}
                onOpenChange={handleOpenChange}
            >
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="font-poppins">Remover acessos</DialogTitle>
                        <DialogDescription>
                            Gerencie os acessos desse lead
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 max-h-[500px] overflow-y-auto">
                        {access.map((item, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span>
                                    {item.title}
                                </span>
                                <Button
                                    variant={'outline'}
                                    className="bg-red-700 text-white"
                                    onClick={() => {
                                        setSelectedAccess(item);
                                        setIsOpenAlert(true);
                                    }}
                                >
                                    <TrashIcon className="size-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </>        
    )
}