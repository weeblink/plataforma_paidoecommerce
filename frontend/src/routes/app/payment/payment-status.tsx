import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/api'
import { Home } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'sonner'
import PixComponent from './components/pix'
import CreditCardComponent from './components/credit_card'
import InvoiceComponent from './components/invoice'
import ErrorPayment from './components/error-payment'
import PaymentApproved from './components/payment-approved'

interface PaymentData {
  status: string
  type: string
  pix_code: string
  pix_qrcode: string
  pix_expiration: string
  invoice_digitable: string
  invoice_code: string
  invoice_link: string
  invoice_expiration: string
}

export default function PaymentStatusPage() {
  const { payment_id } = useParams()

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const [payment, setPayment] = useState<PaymentData | null>(null)

  async function fetchData() {
    setIsLoading(true)
    try {
      const { data } = await api.get(`/payments/${payment_id}`)
      setPayment(data.data)
    } catch {
      toast.error(
        'Um erro inesperado aconteceu ao tentar obter os dados do pagamento',
      )
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [payment_id])

  if (isError) {
    return (
      <div className="mt-4">
        <p>Ocorreu um erro ao carregar os detalhes do curso</p>
        <a href="/">
          <Button variant="secondary" size="sm" className="mt-4 bg-primary">
            <Home />
            <span className="ps-2">Home</span>
          </Button>
        </a>
      </div>
    )
  }

  return isLoading ? (
    <div className="mt-14 flex justify-center">
      <div className="w-[80%]">
        <div className="mb-8">
          <Skeleton className="h-[300px]" />
        </div>
        <div className="mb-14">
          <Skeleton className="mb-2 h-[20px]" />
          <Skeleton className="mb-2 h-[20px] w-[80%]" />
          <Skeleton className="mb-2 h-[20px] w-[60%]" />
          <Skeleton className="mb-2 h-[20px] w-[40%]" />
        </div>
        <div className="mb-14 flex justify-center align-middle">
          <Skeleton className="mb-2 h-[50px] w-[40%]" />
        </div>
      </div>
    </div>
  ) : (
    <div className="mt-14 flex justify-center">
      <div className="w-[80%]">
        {payment !== null &&
          (payment.status === 'PAGO' ? (
            <PaymentApproved />
          ) : payment.status === 'PENDENTE' ? (
            payment?.type === 'pix' ? (
              <PixComponent paymentData={payment} />
            ) : payment?.type === 'credit_card' ? (
              <CreditCardComponent />
            ) : (
              <InvoiceComponent paymentData={payment} />
            )
          ) : (
            <ErrorPayment />
          ))}
      </div>
    </div>
  )
}
