
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
  } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input';
import { api } from '@/services/api';
import { Plus } from 'lucide-react';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import TableContacts from '../table-contacts';

interface Contact{
    name: string,
    email: string
}

interface Action{
    type: string,
    callback: any,
    className: string
}

interface SearchContactsProps {
    addContact: (contact: Contact) => void;
  }

export default function SearchContacts({
    addContact
}: SearchContactsProps){

    const [open, setIsOpen] = useState(false);
    const [ search, setSearch ] = useState<string>("");
    const [isSearching, setIsSearching] = useState(false);
    const [listContacts, setListContacts] = useState<Contact[]>([]);
    const debounceTimeout = useRef<number | undefined>(undefined);

    const actions: Action[] = [
        { type: "add", callback: addNewContact, className: "" },
    ]

    function handleOpenChange( value: boolean ){


        setListContacts([]);
        setIsOpen(value);
    }

    async function handleSearchContact( event : ChangeEvent<HTMLInputElement> ){
        setSearch(event.target.value);     
    }

    function addNewContact( contact : Contact ){

        setIsOpen(false);
        addContact( contact );
    }

    useEffect(() => {
        if(debounceTimeout.current){
            clearTimeout(debounceTimeout.current);
        }

        if( search.trim() === "" )
            return;

        debounceTimeout.current = window.setTimeout(async () => {

            setIsSearching(true);

            try {
                const {data: response} = await api.get(`/leads/search/?q=${search}`);
                
                console.log(response.data);
                setListContacts(response.data);

              } catch {
                toast.error("Ocorreu um erro inesperado ao tentar buscar pelo contato");
              } finally {
                setIsSearching(false);
              }
        }, 500);
    }, [search]);

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Adicionar contato
                </Button>                
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogTitle className="font-poppins">Adicionar contato</DialogTitle>
                <DialogDescription>
                    Busque pelo contato que deseja adicionar
                </DialogDescription>
                <div className='mt-3'>
                    <Input disabled={isSearching} onChange={handleSearchContact} placeholder='Busque pelo contato desejado'/>
                    <div className='mt-3'>
                        <TableContacts
                            contacts={listContacts}
                            actions={actions}
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}