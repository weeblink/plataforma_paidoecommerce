import { Button } from "@/components/ui/button";
import { CheckCheck, Copy, FileText } from "lucide-react";
import { useState } from "react";

interface Props{
    paymentData: PaymentData
}

interface PaymentData{
    status: string,
    type: string,
    pix_code: string,
    pix_qrcode: string,
    pix_expiration: string,
    invoice_digitable: string,
    invoice_code: string,
    invoice_link: string,
    invoice_expiration: string
}

export default function InvoiceComponent({
    paymentData
}: Props){

    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
          await navigator.clipboard.writeText(paymentData.invoice_digitable);
          setCopied(true);
          
          setTimeout(() => {
            setCopied(false);
          }, 2000);
        } catch (err) {
          console.error('Failed to copy text:', err);
        }
    };

    return (
        <div className="flex align-middle justify-center">
            <div className="sm:w-[80%] w-[100%] text-center">
                <div className="mt-10 text-start mb-14">
                    <h2
                        className="font-bold text-2xl text-primary mb-5"
                    >
                        Seu pagamento via BOLETO já está quase finalizado!
                    </h2>
                    <p>
                        O seu acesso ao treinamento ficará disponível assim que for reconhecido o pagamento da sua compra pela instituição financeira. Basta realizar o pagamento do Boleto com o código digitável abaixo e aguardar o nosso email de confirmação
                    </p>
                </div>
                <div className="flex items-stretch gap-8 sm:flex-row flex-col">
                    <div className="border border-1 p-2 sm:w-[50%] mt-8 rounded-lg flex items-center gap-2">
                        <input
                            type="text"
                            value={paymentData.invoice_digitable}
                            disabled
                            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={handleCopy}
                            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Copy to clipboard"
                        >
                            {copied ? (
                            <CheckCheck className="w-5 h-5 text-green-500" />
                            ) : (
                            <Copy className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                    <div className="sm:w-[50%] mt-8 rounded-lg flex items-center gap-2">
                        <a className="block w-[100%] h-[100%]" href={paymentData.invoice_link}>
                            <Button className="w-[100%] h-[100%]">
                                <FileText />
                                Ver boleto
                            </Button>
                        </a>
                    </div>
                </div>            
            </div>
        </div>    
    );
}