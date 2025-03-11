import {Row} from "@tanstack/react-table";
import {Connection} from "@/types/connections";
import {useState} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import {Ellipsis} from "lucide-react";
import {Button} from "@/components/ui/button.tsx";
import {DeleteConnectionModal} from "@/routes/app/manage-connections/components/modal/DeleteConnectionModal.tsx";
import {CreateQRCodeModal} from "@/routes/app/manage-connections/components/modal/CreateQRCodeModal.tsx";

interface DataTableRowActionsProps {
    row: Row<Connection>
    onRefresh: () => void
}

export function DataTableRowActions({
    row,
    onRefresh,
}: DataTableRowActionsProps){

    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const handleTeste = (  ) => {
        alert("TESTE");
    }

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        className="flex h-8 w-8 p-0 focus-visible:ring-0 data-[state=open]:bg-muted"
                    >
                        <Ellipsis className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align={'end'}
                    className={'w-[160px] dark:bg-background'}
                >
                    {row.original.status === 'deactive' && (
                        <DropdownMenuItem onClick={() => setIsQrModalOpen(true)}>
                            QR Code
                        </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={() => setIsDeleteModalOpen(true)}
                        className="text-red-600"
                    >
                        Excluir
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <DeleteConnectionModal
                connection={row.original}
                open={isDeleteModalOpen}
                setOpen={setIsDeleteModalOpen}
                onDelete={onRefresh}
            />

            <CreateQRCodeModal
                connection={row.original}
                open={isQrModalOpen}
                setOpen={setIsQrModalOpen}
                onConnect={onRefresh}
            />
        </>
    )
}