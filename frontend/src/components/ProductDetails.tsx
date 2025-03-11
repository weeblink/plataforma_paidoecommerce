import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from '@/components/ui/dialog'
import {useState} from "react";
import {Button} from "@/components/ui/button.tsx";

interface Props{
    title: string,
    price: number|undefined,
    promotional_price: number|undefined,
    image_url: string|undefined,
    linkBuy: string
}

export default function ProductDetails({
   title,
   price,
   promotional_price,
   image_url,
   linkBuy
} : Props){

    const [open, setOpen] = useState<boolean>(false);

    function onOpenChange(status:boolean){
        setOpen(status)
    }

    return (
        <Dialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <DialogTrigger asChild>
                <Button size={'sm'}>
                    Compre agora!
                </Button>
            </DialogTrigger>
            <DialogContent className={'max-w-2xl'}>
                <div className="grid gap-1 md:grid-cols-[30%_1fr] lg:grid-cols-[30%_1fr]">
                    <div>
                        <img
                            src={image_url}
                        />
                    </div>
                    <div className={'p-5'}>
                        <h3 className={'text-3xl font-bold'}>
                            {title}
                        </h3>
                        <div className={'flex justify-between flex-col min-h-[80%]'}>
                            { ( price && promotional_price ) && (
                                <div className="mb-5 mt-5">
                                    {promotional_price && promotional_price !== 0 ? (
                                        <p>
                                    <span className="font-extralight line-through">
                                      R$ {price}
                                    </span>
                                            <span className="text-xl font-bold text-primary">
                                      {'  R$ ' + promotional_price}
                                    </span>
                                        </p>
                                    ) : (
                                        <p>
                                   <span className="text-xl font-bold text-primary">
                                      {'  R$ ' + price}
                                    </span>
                                        </p>
                                    )}
                                </div>
                            )}
                            <div className={'mt-5'}>
                                <a href={linkBuy}>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="mt-4 bg-primary w-[100%]"
                                    >
                                        Compre agora!
                                    </Button>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}