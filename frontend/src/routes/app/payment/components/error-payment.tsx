import { Button } from "@/components/ui/button";
import { Ban, Home } from "lucide-react";

export default function ErrorPayment(  ){

    return (
        <div className="flex justify-center">
            <div className="w-[80%]">
                <div className="flex flex-col items-center py-14">
                    <Ban className="h-[100px] w-[100px] text-red-600" />
                    <div className="mt-10 text-center">
                        <h2 className="font-extrabold text-2xl mb-4">
                            Ops! Parece que o seu pagamento foi recusado
                        </h2>
                        <p>
                            Infelizmente o seu pagamento foi recusado pela nossa provedora de pagamentos por um motivo desconhecido. Por favor, realize novamente o pagamento ou entre em contato com o suporte da plataforma
                        </p>
                        <div className="text-center mt-12">
                            <a href="/">
                                <Button className="w-[50%] p-6">
                                    <Home />
                                    <span className="ps-3">Home</span>
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>            
        </div>        
    )
}