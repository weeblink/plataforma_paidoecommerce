import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
  } from '@/components/ui/table'
import { useEffect, useState } from "react";

interface Props{
    contacts: Contact[],
    actions: Action[]
}

interface Contact{
    name: string,
    email: string
}

interface Action{
    type: string,
    callback: any,
    className: string
}

export default function TableContacts({
    contacts,
    actions
}: Props ){

    const [listContacts, setListContacts] = useState<Contact[]>([]);

    useEffect(() => {
        console.log(contacts);
        setListContacts(contacts)
    }, [contacts]);

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableRow key={0}>
                        <TableHead key={0}>
                            Nome
                        </TableHead>
                        <TableHead key={1}>
                            Email
                        </TableHead>
                        <TableHead key={2}>
                            Ações
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {listContacts.map((contact, key) => (
                        <TableRow key={key + 1}>
                            <TableCell key={0}>{contact.name}</TableCell>
                            <TableCell key={1}>{contact.email}</TableCell>
                            <TableCell key={2}>
                                {actions.map((action, key) => (                                
                                        <Button key={key} className={action.className} onClick={action.callback}>
                                            {action.type === "add" ? "Adicionar" : "Remover"}
                                        </Button>                                
                                ))}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}