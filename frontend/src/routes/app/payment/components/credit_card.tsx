import { Button } from "@/components/ui/button";
import { RefreshCwIcon } from "lucide-react";

export default function CreditCardComponent(){

    function handleReloadPage(  ){
        window.location.reload();
    }

    return (
        <div className="flex align-middle justify-center">
            <div className="sm:w-[80%] w-[100%] text-center">
                <div className="mt-10 text-start mb-14">
                    <h2
                        className="font-bold text-2xl text-primary mb-5"
                    >
                        Seu pagamento via Cartão de Crédito já está quase finalizado!
                    </h2>
                    <p>
                        O seu pagamento já está sendo aprovado pela instituição financeira e assim que for aprovado, você receberá um email de confirmação e já poderá começar a acessar o seu curso normalmente
                    </p>
                    <div className="mt-14 text-center">
                        <Button className="w-[50%] p-6" onClick={handleReloadPage}>
                            <RefreshCwIcon />
                            <span className="ps-3 font-extrabold">Verificar status</span>
                        </Button>
                    </div>
                </div>           
            </div>
        </div>    
    );
}