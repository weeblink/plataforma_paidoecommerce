import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { Home, LoaderCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useAuth } from '@/hooks/auth'
import { DocumentValidator } from '@/lib/document-validator'
import { CardValidator } from '@/lib/card-validator'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export enum TypeUrl {
  Course = 'course',
  Mentoring = 'mentoring',
  Extra = 'extra',
}

export interface PaymentProductInfo {
  id: string
  title: string
  price: number
  promotional_price: number
  image_url: string
}

// Schema de validação melhorado
const formSchema = z
  .object({
    first_name: z
      .string({ required_error: 'O primeiro nome é obrigatório' })
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(50, 'Nome muito longo'),
    last_name: z
      .string({ required_error: 'O sobrenome é obrigatório' })
      .min(2, 'Sobrenome deve ter pelo menos 2 caracteres')
      .max(50, 'Sobrenome muito longo'),
    phone: z
      .string({ required_error: 'O telefone é obrigatório' })
      .regex(/^\(\d{2}\) \d{5}-\d{4}$/, 'Telefone inválido'),
    email: z
      .string({ required_error: 'O email é obrigatório' })
      .email('Email inválido'),
    document_type: z.enum(['cpf', 'cnpj'], {
      required_error: 'Selecione o tipo de documento',
    }),
    document_number: z.string({
      required_error: 'O número do documento é obrigatório',
    }),
    postcode: z
      .string({ required_error: 'O CEP é obrigatório' })
      .regex(/^\d{5}-\d{3}$/, 'CEP inválido'),
    street: z.string({ required_error: 'A rua é obrigatória' }).min(3),
    number: z.string({ required_error: 'O número é obrigatório' }).min(1),
    complement: z.string().optional(),
    district: z.string({ required_error: 'O bairro é obrigatório' }).min(2),
    city: z.string({ required_error: 'A cidade é obrigatória' }).min(2),
    state: z.string({ required_error: 'O estado é obrigatório' }).length(2),
    type_payment: z.enum(['credit_card', 'invoice', 'pix'], {
      required_error: 'Selecione o tipo de pagamento',
    }),
    holder_name: z.string().optional(),
    card_number: z.string().optional(),
    card_cvv: z.string().optional(),
    card_expiration_month: z.string().optional(),
    card_expiration_year: z.string().optional(),
    card_holder_document_number: z.string().optional(),
    card_installments: z.string().optional(),
    accept_terms: z.boolean().refine((val) => val === true, {
      message: 'Você deve aceitar os termos',
    }),
  })
  .refine(
    (data) => {
      // Valida documento
      if (!data.document_number || !data.document_type) return false
      const validation = DocumentValidator.validate(
        data.document_number,
        data.document_type
      )
      return validation.isValid
    },
    {
      message: 'Documento inválido',
      path: ['document_number'],
    }
  )
  .superRefine((data, ctx) => {
    // Validações específicas para cartão de crédito
    if (data.type_payment === 'credit_card') {
      // Validar nome do titular
      if (!data.holder_name || data.holder_name.trim().length < 3) {
        ctx.addIssue({
          path: ['holder_name'],
          message: 'Nome do titular é obrigatório',
          code: 'custom',
        })
      }

      // Validar número do cartão
      if (!data.card_number) {
        ctx.addIssue({
          path: ['card_number'],
          message: 'Número do cartão é obrigatório',
          code: 'custom',
        })
      } else {
        const cardValidation = CardValidator.validateCardNumber(data.card_number)
        if (!cardValidation.isValid) {
          ctx.addIssue({
            path: ['card_number'],
            message: cardValidation.error || 'Número do cartão inválido',
            code: 'custom',
          })
        }
      }

      // Validar CVV
      if (!data.card_cvv) {
        ctx.addIssue({
          path: ['card_cvv'],
          message: 'CVV é obrigatório',
          code: 'custom',
        })
      } else {
        const cardType = data.card_number
          ? CardValidator.getCardType(data.card_number)
          : undefined
        const cvvValidation = CardValidator.validateCVV(
          data.card_cvv,
          cardType || undefined
        )
        if (!cvvValidation.isValid) {
          ctx.addIssue({
            path: ['card_cvv'],
            message: cvvValidation.error || 'CVV inválido',
            code: 'custom',
          })
        }
      }

      // Validar data de expiração
      if (!data.card_expiration_month || !data.card_expiration_year) {
        if (!data.card_expiration_month) {
          ctx.addIssue({
            path: ['card_expiration_month'],
            message: 'Mês de expiração é obrigatório',
            code: 'custom',
          })
        }
        if (!data.card_expiration_year) {
          ctx.addIssue({
            path: ['card_expiration_year'],
            message: 'Ano de expiração é obrigatório',
            code: 'custom',
          })
        }
      } else {
        const expirationValidation = CardValidator.validateExpiration(
          data.card_expiration_month,
          data.card_expiration_year
        )
        if (!expirationValidation.isValid) {
          ctx.addIssue({
            path: ['card_expiration_month'],
            message: expirationValidation.error || 'Data de expiração inválida',
            code: 'custom',
          })
        }
      }

      // Validar CPF do titular
      if (!data.card_holder_document_number) {
        ctx.addIssue({
          path: ['card_holder_document_number'],
          message: 'CPF do titular é obrigatório',
          code: 'custom',
        })
      } else {
        const docValidation = DocumentValidator.validate(
          data.card_holder_document_number,
          'cpf'
        )
        if (!docValidation.isValid) {
          ctx.addIssue({
            path: ['card_holder_document_number'],
            message: docValidation.error || 'CPF do titular inválido',
            code: 'custom',
          })
        }
      }

      // Validar parcelas
      if (!data.card_installments) {
        ctx.addIssue({
          path: ['card_installments'],
          message: 'Selecione o número de parcelas',
          code: 'custom',
        })
      }
    }
  })

export default function PaymentPage() {
  const { type, id } = useParams<{ type: TypeUrl; id: string }>()
  const { user } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isError, setIsError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const [productInfo, setProductInfo] = useState<PaymentProductInfo | null>(
    null
  )

  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email || '',
      accept_terms: false,
    },
  })

  const watchCep = form.watch('postcode')
  const documentType = form.watch('document_type')
  const paymentType = form.watch('type_payment')

  const prevCepRef = useRef<string | null>(null)

  // Buscar CEP automaticamente
  useEffect(() => {
    if (watchCep && watchCep.length === 9 && watchCep !== prevCepRef.current) {
      prevCepRef.current = watchCep
      searchCepData(watchCep)
    }
  }, [watchCep])

  // Buscar dados do produto
  async function fetchData() {
    setIsLoading(true)
    setIsError(false)
    setErrorMessage('')

    try {
      let info: PaymentProductInfo = {} as PaymentProductInfo

      const endpoints = {
        [TypeUrl.Course]: `/courses/${id}/payment`,
        [TypeUrl.Mentoring]: `/mentorings/${id}/payment`,
        [TypeUrl.Extra]: `/extras/${id}/payment`,
      }

      const endpoint = endpoints[type as TypeUrl]

      if (!endpoint) {
        throw new Error('Tipo de produto inválido')
      }

      const { data } = await api.get<{ data: PaymentProductInfo }>(endpoint)
      info = data.data

      if (!info || Object.keys(info).length === 0) {
        throw new Error('Produto não encontrado')
      }

      setProductInfo(info)
    } catch (error: any) {
      console.error('[PaymentPage] Error fetching product:', error)

      let message = 'Erro ao carregar informações do produto'

      if (error.response?.status === 404) {
        message = 'Produto não encontrado'
      } else if (error.response?.status === 403) {
        message = 'Você não tem permissão para acessar este produto'
      } else if (!navigator.onLine) {
        message = 'Sem conexão com a internet. Verifique sua conexão e tente novamente.'
      }

      setErrorMessage(message)
      setIsError(true)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar dados do CEP
  async function searchCepData(cep: string) {
    setIsLoadingCep(true)

    try {
      const cleanCep = cep.replace(/\D/g, '')

      if (cleanCep.length !== 8) {
        throw new Error('CEP inválido')
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout

      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`, {
        headers: { Accept: 'application/json' },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`Erro ao buscar CEP: ${res.status}`)
      }

      const response = await res.json()

      if (response.erro) {
        throw new Error('CEP não encontrado')
      }

      // Preencher campos
      form.setValue('street', response.logradouro || '')
      form.setValue('district', response.bairro || '')
      form.setValue('city', response.localidade || '')
      form.setValue('state', response.uf || '')

      // Limpar erros anteriores
      form.clearErrors(['street', 'district', 'city', 'state'])
    } catch (error: any) {
      console.error('[PaymentPage] Error fetching CEP:', error)

      let message = 'Não foi possível localizar o endereço do CEP informado'

      if (error.name === 'AbortError') {
        message = 'Tempo esgotado ao buscar CEP. Tente novamente.'
      } else if (!navigator.onLine) {
        message = 'Sem conexão com a internet'
      }

      toast.error(message)
    } finally {
      setIsLoadingCep(false)
    }
  }

  // Enviar pagamento
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Validação final antes de enviar
    if (!productInfo) {
      toast.error('Informações do produto não carregadas')
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar dados do pagamento
      const dataPayment = {
        first_name: values.first_name.trim(),
        last_name: values.last_name.trim(),
        phone: values.phone.replace(/\D/g, ''),
        email: values.email.trim().toLowerCase(),
        document_type: values.document_type,
        document_number: DocumentValidator.cleanDocument(values.document_number),
        order: {
          type_product: getTypeProductPayment(),
          product_id: productInfo.id,
          discount_value: 0,
          shipping_value: 0,
          type_payment: values.type_payment,
        },
        card:
          values.type_payment !== 'credit_card'
            ? null
            : {
                number: CardValidator.cleanCardNumber(values.card_number || ''),
                cvv: values.card_cvv?.replace(/\D/g, ''),
                expiration_month: values.card_expiration_month,
                expiration_year: values.card_expiration_year,
                holder_document_number: DocumentValidator.cleanDocument(
                  values.card_holder_document_number || ''
                ),
                holder_name: values.holder_name?.trim(),
                installments: values.card_installments
                  ? parseInt(values.card_installments)
                  : 1,
              },
        address: {
          postcode: values.postcode.replace(/\D/g, ''),
          street: values.street.trim(),
          number: values.number.trim(),
          complement: values.complement?.trim() || '',
          district: values.district.trim(),
          city: values.city.trim(),
          state: values.state,
        },
      }

      // Timeout para a requisição
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s

      const { data } = await api.post('/payments/create', dataPayment, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Sucesso
      toast.success('Pagamento processado com sucesso!')
      navigate(`/payment/info/${data.payment_id}`)
    } catch (error: any) {
      console.error('[PaymentPage] Error submitting payment:', error)

      let message = 'Erro ao processar pagamento. Tente novamente.'

      if (error.name === 'AbortError') {
        message = 'Tempo esgotado. Verifique sua conexão e tente novamente.'
      } else if (!navigator.onLine) {
        message = 'Sem conexão com a internet'
      } else if (error.response?.status === 400) {
        message = error.response.data?.error || 'Dados inválidos'
      } else if (error.response?.status === 403) {
        message = 'Você já possui este produto'
      } else if (error.response?.status === 422) {
        message = 'Verifique os dados do cartão e tente novamente'
      } else if (error.response?.status >= 500) {
        message = 'Erro no servidor. Tente novamente em alguns instantes.'
      }

      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  function getTypeProductPayment() {
    const typeMap = {
      [TypeUrl.Course]: 'course',
      [TypeUrl.Mentoring]: 'mentorship',
      [TypeUrl.Extra]: 'extra',
    }
    return typeMap[type as TypeUrl] || 'course'
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="p-14">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="px-10 sm:w-[70%]">
            <div>
              <h2 className="mb-5 font-poppins text-2xl font-medium">
                Informações pessoais
              </h2>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row">
                <div className="sm:w-[50%]">
                  <Skeleton className="h-[20px]" />
                </div>
                <div className="sm:w-[50%]">
                  <Skeleton className="h-[20px]" />
                </div>
              </div>
              <div className="mb-5">
                <Skeleton className="h-[20px]" />
              </div>
              <div className="mb-5">
                <Skeleton className="h-[20px]" />
              </div>
              <div className="mb-5">
                <Skeleton className="h-[20px]" />
              </div>
              <div className="mb-5">
                <Skeleton className="h-[20px]" />
              </div>
              <div>
                <div className="my-4 w-full border-t border-gray-200" />
              </div>
            </div>
            <div>
              <h2 className="mb-5 font-poppins text-2xl font-medium">
                Endereço
              </h2>
              <div>
                <div className="mb-5">
                  <Skeleton className="h-[20px]" />
                </div>
                <div className="mb-5 flex flex-col gap-4 sm:flex-row">
                  <div className="sm:w-[80%]">
                    <Skeleton className="h-[20px]" />
                  </div>
                  <div className="sm:w-[20%]">
                    <Skeleton className="h-[20px]" />
                  </div>
                </div>
                <div className="mb-5 flex flex-col gap-4 sm:flex-row">
                  <div className="sm:w-[50%]">
                    <Skeleton className="h-[20px]" />
                  </div>
                  <div className="sm:w-[50%]">
                    <Skeleton className="h-[20px]" />
                  </div>
                </div>
                <div className="mb-5 flex flex-col gap-4 sm:flex-row">
                  <div className="sm:w-[50%]">
                    <Skeleton className="h-[20px]" />
                  </div>
                  <div className="sm:w-[50%]">
                    <Skeleton className="h-[20px]" />
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="mb-5 font-poppins text-2xl font-medium">
                Pagamento
              </h2>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row">
                <div className="sm:w-[33%]">
                  <Skeleton className="h-[100px]" />
                </div>
                <div className="sm:w-[33%]">
                  <Skeleton className="h-[100px]" />
                </div>
                <div className="sm:w-[33%]">
                  <Skeleton className="h-[100px]" />
                </div>
              </div>
              <div className="mb-5">
                <Skeleton className="h-[20px]" />
              </div>
              <div className="mb-5">
                <Skeleton className="h-[20px]" />
              </div>
              <div className="mb-5 flex flex-col gap-4 sm:flex-row">
                <div className="sm:w-[25%]">
                  <Skeleton className="h-[20px]" />
                </div>
                <div className="sm:w-[25%]">
                  <Skeleton className="h-[20px]" />
                </div>
                <div className="sm:w-[25%]">
                  <Skeleton className="h-[20px]" />
                </div>
                <div className="sm:w-[25%]">
                  <Skeleton className="h-[20px]" />
                </div>
              </div>
            </div>
          </div>
          <div className="sm:w-[30%]">
            <div className="flex h-[100%] flex-col justify-between rounded-lg bg-foreground p-5">
              <div>
                <div className="mb-5">
                  <Skeleton className="h-[200px]" />
                </div>
                <div className="mb-5">
                  <Skeleton className="h-[20px]" />
                </div>
                <div className="mb-5 sm:w-[60%]">
                  <Skeleton className="h-[20px]" />
                </div>
                <div className="mb-5 sm:w-[30%]">
                  <Skeleton className="h-[20px]" />
                </div>
              </div>
              <div>
                <div className="mb-5">
                  <Skeleton className="h-[20px]" />
                </div>
                <div>
                  <div className="my-4 w-full border-t border-gray-200" />
                </div>
                <div className="mb-5">
                  <Skeleton className="h-[50px]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mt-4 p-14 text-center">
        <p className="mb-4 text-lg text-destructive">{errorMessage}</p>
        <Button
          variant="secondary"
          size="sm"
          className="bg-primary"
          onClick={() => window.location.href = '/'}
        >
          <Home className="mr-2" />
          <span>Voltar para Home</span>
        </Button>
      </div>
    )
  }

  return (
    <div className="sm:p-14 mb-16">
      <Form {...form}>
        <form id="makePayment" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Resto do formulário mantém igual ao original, apenas adicione disabled quando isSubmitting */}
          <div className="flex flex-col gap-4 sm:flex-row">
             <div className="sm:pe-12 sm:w-[70%]">
              <div>
                <h2 className="mb-5 font-poppins text-2xl font-medium">
                  Informações pessoais
                </h2>
                <div className="mb-5 flex flex-col gap-4 sm:flex-row">
                  <div className="sm:w-[50%]">
                    <FormField
                      control={form.control}
                      name="first_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="sm:w-[50%]">
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sobrenome</FormLabel>
                          <FormControl>
                            <Input placeholder="" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="(XX) XXXXX-XXXX"
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '')
                              value = value.replace(
                                /^(\d{2})(\d{5})(\d{4}).*/,
                                '($1) $2-$3',
                              )
                              field.onChange(value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mb-5">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            readOnly
                            placeholder="exemplo@gmail.com"
                            {...field}
                            value={user?.email}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="mb-5">
                  <FormField
                    control={form.control}
                    name="document_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de documento</FormLabel>
                        <FormControl>
                          <select
                            value={field.value || ""}
                            onChange={field.onChange}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="">Selecione o tipo de documento</option>
                            <option value="cpf">CPF</option>
                            <option value="cnpj">CNPJ</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {documentType && (
                  <FormField
                    control={form.control}
                    name="document_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {documentType === 'cpf' ? 'CPF' : 'CNPJ'}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={
                              documentType === 'cpf'
                                ? '000.000.000-00'
                                : '00.000.000/0000-00'
                            }
                            onChange={(e) => {
                              let value = e.target.value.replace(/\D/g, '')
                              if (documentType === 'cpf') {
                                value = value.replace(
                                  /(\d{3})(\d{3})(\d{3})(\d{2})/,
                                  '$1.$2.$3-$4',
                                )
                              } else {
                                value = value.replace(
                                  /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
                                  '$1.$2.$3/$4-$5',
                                )
                              }
                              field.onChange(value)
                            }}
                            maxLength={documentType === 'cpf' ? 14 : 18}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <div>
                  <div className="my-14 w-full border-t border-gray-200" />
                </div>
              </div>
              <div>
                <h2 className="mb-5 font-poppins text-2xl font-medium">
                  Endereço
                </h2>
                <div>
                  <div className="mb-5">
                    <FormField
                      control={form.control}
                      name="postcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="XX.XXX-XX"
                              onChange={(e) => {
                                let value = e.target.value.replace(/\D/g, '')
                                value = value.replace(
                                  /^(\d{5})(\d{3})/,
                                  '$1-$2',
                                )
                                field.onChange(value)
                              }}
                              maxLength={9}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {isLoadingCep ? (
                    <div className="mb-5 flex justify-center align-middle">
                      <LoaderCircle className="mr-2 size-16 animate-spin text-primary" />
                    </div>
                  ) : (
                    watchCep &&
                    watchCep.length === 9 && (
                      <>
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row">
                          <div className="sm:w-[80%]">
                            <FormField
                              control={form.control}
                              name="street"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Rua</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="sm:w-[20%]">
                            <FormField
                              control={form.control}
                              name="number"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Número</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row">
                          <div className="sm:w-[50%]">
                            <FormField
                              control={form.control}
                              name="district"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Bairro</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="sm:w-[50%]">
                            <FormField
                              control={form.control}
                              name="complement"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Complemento</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                        <div className="mb-5 flex flex-col gap-4 sm:flex-row">
                          <div className="sm:w-[50%]">
                            <FormField
                              control={form.control}
                              name="city"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cidade</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="sm:w-[50%]">
                            <FormField
                              control={form.control}
                              name="state"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Estado</FormLabel>
                                  <FormControl>
                                    <select
                                      value={field.value || ""}
                                      onChange={field.onChange}
                                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                      <option value="">Selecione o estado</option>
                                      <option value="AC">Acre</option>
                                      <option value="AL">Alagoas</option>
                                      <option value="AP">Amapá</option>
                                      <option value="AM">Amazonas</option>
                                      <option value="BA">Bahia</option>
                                      <option value="CE">Ceará</option>
                                      <option value="DF">Distrito Federal</option>
                                      <option value="ES">Espírito Santo</option>
                                      <option value="GO">Goiás</option>
                                      <option value="MA">Maranhão</option>
                                      <option value="MT">Mato Grosso</option>
                                      <option value="MS">Mato Grosso do Sul</option>
                                      <option value="MG">Minas Gerais</option>
                                      <option value="PA">Pará</option>
                                      <option value="PB">Paraíba</option>
                                      <option value="PR">Paraná</option>
                                      <option value="PE">Pernambuco</option>
                                      <option value="PI">Piauí</option>
                                      <option value="RJ">Rio de Janeiro</option>
                                      <option value="RN">Rio Grande do Norte</option>
                                      <option value="RS">Rio Grande do Sul</option>
                                      <option value="RO">Rondônia</option>
                                      <option value="RR">Roraima</option>
                                      <option value="SC">Santa Catarina</option>
                                      <option value="SP">São Paulo</option>
                                      <option value="SE">Sergipe</option>
                                      <option value="TO">Tocantins</option>
                                    </select>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </>
                    )
                  )}
                </div>
                <div>
                  <div className="my-14 w-full border-t border-gray-200" />
                </div>
              </div>
              <div>
                <h2 className="mb-5 font-poppins text-2xl font-medium">
                  Pagamento
                </h2>
                <div className="mb-12">
                  <FormField
                    control={form.control}
                    name="type_payment"
                    render={({ field }) => (
                      <FormItem>
                        <RadioGroup
                          value={field.value}
                          onValueChange={field.onChange}
                          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                        >
                          <div className="...">
                            <RadioGroupItem value="credit_card" id="credit_card" />
                            <label htmlFor="credit_card" className="font-extrabold text-primary ps-2">Cartão de crédito</label>
                            <p className="text-sm">Pague com cartão de crédito</p>
                          </div>
                          <div className="...">
                            <RadioGroupItem value="invoice" id="invoice" />
                            <label htmlFor="invoice" className="font-extrabold text-primary ps-2">Boleto</label>
                            <p className="text-sm">Pagamento via boleto bancário</p>
                          </div>
                          <div className="...">
                            <RadioGroupItem value="pix" id="pix" />
                            <label htmlFor="pix" className="font-extrabold text-primary ps-2">PIX</label>
                            <p className="text-sm">Pagamento instantâneo com pix</p>
                          </div>
                        </RadioGroup>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {paymentType && paymentType === 'credit_card' && (
                  <>
                    <div className="mb-5">
                      <FormField
                        control={form.control}
                        name="holder_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome no cartão</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="mb-5">
                      <FormField
                        control={form.control}
                        name="card_holder_document_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CPF do titular</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="mb-5">
                      <FormField
                        control={form.control}
                        name="card_number"
                        defaultValue=""
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número do cartão</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value}
                                onChange={(e) => {
                                  let value = e.target.value
                                  value = value.replace(/\D/g, '')
                                  value = value
                                    .replace(/(\d{4})/g, '$1 ')
                                    .trim()
                                  field.onChange(value)
                                }}
                                placeholder="0000 0000 0000 0000"
                                maxLength={19}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="mb-5 flex flex-col gap-4 sm:flex-row">
                      <div className="sm:w-[33%]">
                        <FormField
                          control={form.control}
                          name="card_cvv"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CVV</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="sm:w-[33%]">
                        <FormField
                          control={form.control}
                          name="card_expiration_month"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mẽs do vencimento</FormLabel>
                              <FormControl>
                                <Input maxLength={2} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="sm:w-[33%]">
                        <FormField
                          control={form.control}
                          name="card_expiration_year"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ano do vencimento</FormLabel>
                              <FormControl>
                                <Input maxLength={2} {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    <div>
                      <FormField
                        control={form.control}
                        name="card_installments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade de parcelas</FormLabel>
                            <FormControl>
                              <select
                                value={field.value || ""}
                                onChange={field.onChange}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <option value="">Selecione o número de parcelas</option>
                                <option value="1">1 Parcela</option>
                                <option value="2">2 Parcelas</option>
                                <option value="3">3 Parcelas</option>
                                <option value="4">4 Parcelas</option>
                                <option value="5">5 Parcelas</option>
                                <option value="6">6 Parcelas</option>
                                <option value="7">7 Parcelas</option>
                                <option value="8">8 Parcelas</option>
                                <option value="9">9 Parcelas</option>
                                <option value="10">10 Parcelas</option>
                                <option value="11">11 Parcelas</option>
                                <option value="12">12 Parcelas</option>
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
            
            <div className="sm:w-[30%]">
              <div className="border-1 flex flex-col justify-between rounded-lg border bg-card p-5 text-card-foreground">
                {/* Informações do produto */}
                <div>
                  <div className="mb-5">
                    <div
                      className="h-[400px] rounded-lg"
                      style={{
                        backgroundPosition: 'center',
                        backgroundImage: `url(${productInfo?.image_url})`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        position: 'relative',
                      }}
                    />
                  </div>
                  <div className="mb-5">
                    <h5 className="text-2xl font-extrabold text-primary">
                      {productInfo?.title}
                    </h5>
                  </div>
                  <div className="mb-5">
                    {productInfo?.promotional_price &&
                    productInfo.promotional_price > 0 ? (
                      <p>
                        <span className="font-extralight line-through">
                          R$ {productInfo.price}
                        </span>
                        <span className="text-xl font-bold">
                          {' R$ ' + productInfo.promotional_price}
                        </span>
                      </p>
                    ) : (
                      <span className="text-xl font-bold">
                        {'R$ ' + productInfo?.price}
                      </span>
                    )}
                  </div>
                </div>

                {/* Termos e botão */}
                <div className="mt-14">
                  <div className="mb-5">
                    <FormField
                      control={form.control}
                      name="accept_terms"
                      render={({ field }) => (
                        <div className="flex flex-row items-start space-x-3 rounded-md border p-4">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                            disabled={isSubmitting}
                            className="mt-1"
                          />
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">
                              Li e concordo com os{' '}
                              <a
                                href="/payment/terms-and-conditions"
                                className="text-blue-600 underline hover:text-blue-800"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                termos de compra
                              </a>{' '}
                              e{' '}
                              <a
                                href="/payment/privacy-politcs"
                                className="text-blue-600 underline hover:text-blue-800"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                política de privacidade
                              </a>
                              .
                            </p>
                          </div>
                        </div>
                      )}
                    />
                    {form.formState.errors.accept_terms && (
                      <p className="mt-2 text-sm text-destructive">
                        {form.formState.errors.accept_terms.message}
                      </p>
                    )}
                  </div>
                  <div className="my-4 w-full border-t border-gray-200" />
                  <div className="mb-5">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !form.formState.isValid}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        'Finalizar compra'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  )
}