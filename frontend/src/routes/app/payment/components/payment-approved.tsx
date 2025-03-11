import { Button } from "@/components/ui/button";
import { BadgeCheck, Video } from "lucide-react";

export default function PaymentApproved(){
    return (
        <div className="flex justify-center">
            <div className="w-[80%]">
                <div className="flex flex-col items-center py-14">
                    <BadgeCheck className="h-[100px] w-[100px] text-green-500" />
                    <div className="mt-10 text-center">
                        <h2 className="font-extrabold text-2xl mb-4">
                            Pagamento Aprovado!
                        </h2>
                        <p>
                            Seu pagamento foi aprovado com sucesso! Agora você já pode conferir o seu novo curso comprado na sua aba de curso em "Meus cursos". Não perca tempo! Clique no botão abaixo e comece a aproveitar o seu novo curso!
                        </p>
                        <div className="text-center mt-12">
                            <a href="/courses">
                                <Button className="w-[50%] p-6">
                                    <Video />
                                    <span className="ps-3">Cursos</span>
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>            
        </div>
    )
}