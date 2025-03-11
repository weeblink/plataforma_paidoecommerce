import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { api } from '@/services/api'
import { zodResolver } from '@hookform/resolvers/zod'
import { Home, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/auth'

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

const formSchema = z
  .object({
    first_name: z.string({
      required_error: 'O primeiro nome é obrigatório',
    }),
    last_name: z.string({
      required_error: 'O segundo nome é necessário',
    }),
    phone: z.string({
      required_error: 'O campo de telefone é obrigatório para prosseguir',
    }),
    email: z.string({
      required_error: 'O campo de email é necessário para prosseguir',
    }),
    document_type: z.string({
      required_error:
        'O campo de tipo de documento é necessário para prosseguir',
    }),
    document_number: z.string({
      required_error:
        'O campo de número do documento é necessário para prosseguir',
    }),
    postcode: z.string({
      required_error: 'O campo de CEP é necessário pra prosseguir',
    }),
    street: z.string({
      required_error: 'O campo de rua é necessário pra prosseguir',
    }),
    number: z.string({
      required_error: 'O campo de número é necessário para prosseguir',
    }),
    complement: z.string().optional(),
    district: z.string({
      required_error: 'O campo de Bairro é necessário para prosseguir',
    }),
    city: z.string({
      required_error: 'O campo de Cidade é necessário para prosseguir',
    }),
    state: z.string({
      required_error: 'O campo de Estado é necessário para prosseguir',
    }),
    type_payment: z.string({
      required_error:
        'O campo de tipo de pagamento é necessário para prosseguir',
    }),
    holder_name: z.string().optional(),
    card_number: z.string().optional(),
    card_cvv: z.string().optional(),
    card_expiration_month: z.string().optional(),
    card_expiration_year: z.string().optional(),
    card_holder_document_number: z.string().optional(),
    card_installments: z.string().optional(),
    accept_terms: z.boolean({
      required_error:
        'O campo de aceitação dos termos é necessário para prosseguir',
    }),
  })
  .superRefine((data, ctx) => {
    if (data.type_payment === 'credit_card') {
      if (data.holder_name === undefined) {
        ctx.addIssue({
          path: ['holder_name'],
          message: 'O nome do dono do cartão é necessário para prosseguir',
          code: 'custom',
        })
      }

      if (data.card_number === undefined) {
        ctx.addIssue({
          path: ['card_number'],
          message: 'O número do cartão é necessário para prosseguir',
          code: 'custom',
        })
      }

      if (data.card_cvv === undefined) {
        ctx.addIssue({
          path: ['card_cvv'],
          message: 'O código de segurança é necessário para prosseguir',
          code: 'custom',
        })
      }

      if (data.card_cvv === undefined) {
        ctx.addIssue({
          path: ['card_cvv'],
          message: 'O código de segurança é necessário para prosseguir',
          code: 'custom',
        })
      }

      if (data.card_expiration_month === undefined) {
        ctx.addIssue({
          path: ['card_expiration_month'],
          message: 'O mês de expiração do cartão é necessário para prosseguir',
          code: 'custom',
        })
      }

      if (data.card_holder_document_number === undefined) {
        ctx.addIssue({
          path: ['card_holder_document_number'],
          message:
            'O número do documento do dono do cartão é necessário para prosseguir',
          code: 'custom',
        })
      }

      if (data.card_installments === undefined) {
        ctx.addIssue({
          path: ['card_installments'],
          message:
            'É necessário informar a quantidade de parcelas para prosseguir',
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

  const [isError, setIsError] = useState(false)

  const [productInfo, setProductInfo] = useState<PaymentProductInfo | null>(
    null,
  )
  const [documentType, setIsDocumentType] = useState<string | null>(null)
  const [paymentType, setPaymentType] = useState<string | null>(null)

  const navigate = useNavigate()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  form.setValue('email', user?.email as string)

  const watchDocumentType = form.watch('document_type')
  const watchCep = form.watch('postcode')
  const watchPaymentType = form.watch('type_payment')

  async function fetchData() {
    setIsLoading(true)
    try {
      let info: PaymentProductInfo = {} as PaymentProductInfo

      if (type === TypeUrl.Course) {
        const { data } = await api.get<{ data: PaymentProductInfo }>(
          `/courses/${id}/payment`,
        )

        info = data.data
      }

      if (type === TypeUrl.Mentoring) {
        const { data } = await api.get<{ data: PaymentProductInfo }>(
          `/mentorings/${id}/payment`,
        )

        info = data.data
      }

      if (type === TypeUrl.Extra) {
        const { data } = await api.get<{ data: PaymentProductInfo }>(
          `/extras/${id}/payment`,
        )

        info = data.data
      }

      if (Object.keys(info).length === 0) {
        toast.error('Ocorreu um erro ao carregar os detalhes de pagamento')
        setIsError(true)
        return
      }

      setProductInfo(info)
    } catch {
      let typeText = ''
      if (type === TypeUrl.Course) typeText = 'do curso'
      if (type === TypeUrl.Mentoring) typeText = 'da mentoria'
      if (type === TypeUrl.Extra) typeText = 'do produto'

      toast.error(`Ocorreu um erro ao carregar os detalhes ${typeText}`)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  async function searchCepData(cep: string) {
    setIsLoadingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const response = await res.json()

      form.setValue('street', response.logradouro)
      form.setValue('district', response.bairro)
      form.setValue('city', response.localidade)
      form.setValue('state', response.uf)
    } catch {
      toast.error('Não foi possível localizar o endereço do CEP informado')
    } finally {
      setIsLoadingCep(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    const dataPayment = {
      first_name: values.first_name,
      last_name: values.last_name,
      phone: values.phone.trim(),
      email: values.email,
      document_type: values.document_type,
      document_number: values.document_number,
      order: {
        type_product: getTypeProductPayment(),
        product_id: productInfo?.id,
        discount_value: 0,
        shipping_value: 0,
        type_payment: values.type_payment,
      },
      card:
        values.type_payment !== 'credit_card'
          ? null
          : {
              number: values.card_number?.replace(/ /g, ''),
              cvv: values.card_cvv,
              expiration_month: values.card_expiration_month,
              expiration_year: values.card_expiration_year,
              holder_document_number: values.card_holder_document_number,
              holder_name: values.holder_name,
              installments:
                values.card_installments === undefined
                  ? 0
                  : parseInt(values.card_installments),
            },
      address: {
        postcode: values.postcode.trim().replace(/\D/g, ''),
        street: values.street,
        number: values.number,
        complement: values.complement,
        district: values.district,
        city: values.city,
        state: values.state,
      },
    }

    try {
      const { data } = await api.post('/payments/create', dataPayment)
      navigate(`/payment/info/${data.payment_id}`)
    } catch(error) {

      toast.error(
        error.status === 400
          ? error.response.data.error
          :'Não foi possível realizar o pagamento devido a um erro inesperado. Por favor, tente novamente mais tarde',
      )
    } finally {
      setIsLoading(false)
    }
  }

  function getTypeProductPayment() {
    if (type === TypeUrl.Course) return 'course'
    if (type === TypeUrl.Mentoring) return 'mentorship'
    if (type === TypeUrl.Extra) return 'extra'
  }

  useEffect(() => {
    if (watchCep && watchCep.length === 9) searchCepData(watchCep)
  }, [watchCep])

  useEffect(() => {
    setIsDocumentType(watchDocumentType)
  }, [watchDocumentType])

  useEffect(() => {
    setPaymentType(watchPaymentType)
  }, [watchPaymentType])

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

  return (
    <div className="sm:p-14 mb-16">
      <Form {...form}>
        <form id="makePayment" onSubmit={form.handleSubmit(onSubmit)}>
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
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de documento" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cpf">CPF</SelectItem>
                            <SelectItem value="cnpj">CNPJ</SelectItem>
                          </SelectContent>
                        </Select>
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
                                  <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                  >
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Selecione o estado" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      <SelectItem value="AC">Acre</SelectItem>
                                      <SelectItem value="AL">
                                        Alagoas
                                      </SelectItem>
                                      <SelectItem value="AP">Amapá</SelectItem>
                                      <SelectItem value="AM">
                                        Amazonas
                                      </SelectItem>
                                      <SelectItem value="BA">Bahia</SelectItem>
                                      <SelectItem value="CE">Ceará</SelectItem>
                                      <SelectItem value="DF">
                                        Distrito Federal
                                      </SelectItem>
                                      <SelectItem value="ES">
                                        Espírito Santo
                                      </SelectItem>
                                      <SelectItem value="GO">Goiás</SelectItem>
                                      <SelectItem value="MA">
                                        Maranhão
                                      </SelectItem>
                                      <SelectItem value="MT">
                                        Mato Grosso
                                      </SelectItem>
                                      <SelectItem value="MS">
                                        Mato Grosso do Sul
                                      </SelectItem>
                                      <SelectItem value="MG">
                                        Minas Gerais
                                      </SelectItem>
                                      <SelectItem value="PA">Pará</SelectItem>
                                      <SelectItem value="PB">
                                        Paraíba
                                      </SelectItem>
                                      <SelectItem value="PR">Paraná</SelectItem>
                                      <SelectItem value="PE">
                                        Pernambuco
                                      </SelectItem>
                                      <SelectItem value="PI">Piauí</SelectItem>
                                      <SelectItem value="RJ">
                                        Rio de Janeiro
                                      </SelectItem>
                                      <SelectItem value="RN">
                                        Rio Grande do Norte
                                      </SelectItem>
                                      <SelectItem value="RS">
                                        Rio Grande do Sul
                                      </SelectItem>
                                      <SelectItem value="RO">
                                        Rondônia
                                      </SelectItem>
                                      <SelectItem value="RR">
                                        Roraima
                                      </SelectItem>
                                      <SelectItem value="SC">
                                        Santa Catarina
                                      </SelectItem>
                                      <SelectItem value="SP">
                                        São Paulo
                                      </SelectItem>
                                      <SelectItem value="SE">
                                        Sergipe
                                      </SelectItem>
                                      <SelectItem value="TO">
                                        Tocantins
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
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
                      <FormItem className="space-y-3">
                        <FormControl>
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="border-1 relative flex items-center rounded-lg border bg-card p-4 text-card-foreground">
                              <input
                                type="radio"
                                id="credit_card"
                                value="credit_card"
                                className="mr-4"
                                checked={field.value === 'credit_card'}
                                onChange={() => field.onChange('credit_card')}
                              />
                              <div>
                                <label
                                  htmlFor="credit_card"
                                  className="font-extrabold text-primary"
                                >
                                  Cartão de crédito
                                </label>
                                <p className="text-sm">
                                  Pague com cartão de crédito
                                </p>
                              </div>
                            </div>

                            <div className="border-1 relative flex items-center rounded-lg border bg-card p-4 text-card-foreground">
                              <input
                                type="radio"
                                id="invoice"
                                value="invoice"
                                className="mr-4"
                                checked={field.value === 'invoice'}
                                onChange={() => field.onChange('invoice')}
                              />
                              <div>
                                <label
                                  htmlFor="invoice"
                                  className="font-extrabold text-primary"
                                >
                                  Boleto
                                </label>
                                <p className="text-sm">
                                  Pagamento via boleto bancário
                                </p>
                              </div>
                            </div>

                            <div className="border-1 relative flex items-center rounded-lg border bg-card p-4 text-card-foreground">
                              <input
                                type="radio"
                                id="pix"
                                value="pix"
                                className="mr-4"
                                checked={field.value === 'pix'}
                                onChange={() => field.onChange('pix')}
                              />
                              <div>
                                <label
                                  htmlFor="pix"
                                  className="font-extrabold text-primary"
                                >
                                  PIX
                                </label>
                                <p className="text-sm">
                                  Pagamento instantâneo com pix
                                </p>
                              </div>
                            </div>
                          </div>
                        </FormControl>
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
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value?.toString()}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o número de parcelas" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="1">1 Parcela</SelectItem>
                                <SelectItem value="2">2 Parcelas</SelectItem>
                                <SelectItem value="3">3 Parcelas</SelectItem>
                                <SelectItem value="4">4 Parcelas</SelectItem>
                                <SelectItem value="5">5 Parcelas</SelectItem>
                                <SelectItem value="6">6 Parcelas</SelectItem>
                                <SelectItem value="7">7 Parcelas</SelectItem>
                                <SelectItem value="8">8 Parcelas</SelectItem>
                                <SelectItem value="9">9 Parcelas</SelectItem>
                                <SelectItem value="10">10 Parcelas</SelectItem>
                                <SelectItem value="11">11 Parcelas</SelectItem>
                                <SelectItem value="12">12 Parcelas</SelectItem>
                              </SelectContent>
                            </Select>
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
                <div>
                  <div className="mb-5">
                    <div
                      className="h-[400px] rounded-lg"
                      style={{
                        backgroundPosition: 'center',
                        backgroundImage: `url( ${productInfo?.image_url} )`,
                        backgroundSize: 'contain',
                        position: 'relative',
                      }}
                    ></div>
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
                          {'  R$ ' + productInfo.promotional_price}
                        </span>
                      </p>
                    ) : (
                        <span className="text-xl font-bold">
                          {'  R$ ' + productInfo.price}
                        </span>
                    )}
                  </div>
                </div>
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
                            onChange={(e) => {
                              field.onChange(e.target.checked)
                            }}
                            className="mt-1"
                          />
                          <div className="space-y-1">
                            <p className="text-sm text-gray-500">
                              Li e concordo com os{' '}
                              <a
                                href="/payment/terms-and-conditions"
                                className="text-blue-600 underline hover:text-blue-800"
                              >
                                termos de compra
                              </a>{' '}
                              e{' '}
                              <a
                                href="/payment/privacy-politcs"
                                className="text-blue-600 underline hover:text-blue-800"
                              >
                                política de privacidade
                              </a>
                              .
                            </p>
                          </div>
                        </div>
                      )}
                    />
                  </div>
                  <div>
                    <div className="my-4 w-full border-t border-gray-200" />
                  </div>
                  <div className="mb-5">
                    <Button
                      onClick={form.handleSubmit(onSubmit)}
                      form="makePayment"
                      type="submit"
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <LoaderCircle className="h-4 w-4 animate-spin text-white" />
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
