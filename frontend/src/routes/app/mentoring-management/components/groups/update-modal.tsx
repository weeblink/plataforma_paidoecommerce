import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Pencil,
  LoaderCircle,
  CalendarIcon,
  Check,
  ChevronsUpDown,
} from 'lucide-react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import type { MentoringGroup } from '@/types/mentoring-management'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import type { CourseManagement } from '@/types/course-management'

const formSchema = z.object({
  title: z.string({
    required_error: 'O nome do grupo é obrigatório.',
  }),
  course_id: z.string({
    required_error: 'O curso é obrigatório.',
  }),
  price: z.coerce.number().min(1, {
    message: 'O preço deve ser maior que 0',
  }),
  price_promotional: z.coerce.number().nullish(),
  purchase_deadline: z.date({
    required_error: 'A data limite de compra é obrigatória.',
  }),
  expiration_date: z.date({
    required_error: 'A data de expiração é obrigatória.',
  }),
  type: z.enum(['group', 'single'], {
    required_error: 'O tipo do grupo é obrigatório.',
  }),
})

interface Props {
  group: MentoringGroup
  onUpdate: () => void
}

export function UpdateMentoringGroupModal({ group, onUpdate }: Props) {
  const [courses, setCourses] = useState<CourseManagement[]>([])
  const [open, setOpen] = useState(false)
  const [isSubmiting, setIsSubmiting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function fetchCourses() {
    setIsLoading(true)

    try {
      const { data } = await api.get<{ data: CourseManagement[] }>(
        '/courses-management',
      )

      setCourses(data.data)
    } catch {
      setIsError(true)
      toast.error('Ocorreu um erro ao carregar os cursos')
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmiting(true)

    try {
      const formatedValues = {
        ...values,
        mentorship_id: group.mentorship_id,
        expiration_date: new Date(values.expiration_date).toISOString(),
        purchase_deadline: new Date(values.purchase_deadline).toISOString(),
      }

      await api.post(`/mentoring/group-management/${group.id}`, formatedValues)

      toast.success('Grupo de mentoria atualizado com sucesso')
      onUpdate()
      setOpen(false)
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao atualizar o grupo de mentoria'

      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }

        if (!error.response?.data?.message && error.response?.data?.error) {
          errorMessage = error.response.data.error
        }
      }

      toast.error(errorMessage)
    } finally {
      setIsSubmiting(false)
    }
  }

  useEffect(() => {
    form.reset({
      title: group.title,
      price: group.price,
      course_id: group.course_id,
      price_promotional: group.price_promotional,
      purchase_deadline: new Date(group.purchase_deadline),
      expiration_date: new Date(group.expiration_date),
      type: group.type,
    })
  }, [form, group])

  useEffect(() => {
    if (open) {
      fetchCourses()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-poppins">
            Editar grupo de mentoria
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para editar o grupo de mentoria
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center">
            <p className="text-sm">Ocorreu um erro ao carregar os cursos</p>
          </div>
        )}

        {!isLoading && !isError && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome de grupo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="course_id"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Curso</FormLabel>
                    <Popover modal>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              'justify-between',
                              !field.value && 'text-muted-foreground',
                            )}
                          >
                            {field.value
                              ? courses.find(
                                  (course) => course.id === field.value,
                                )?.title
                              : 'Selecione o curso'}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0">
                        <Command>
                          <CommandInput placeholder="Pesquisa..." />
                          <CommandList>
                            <CommandEmpty>Nenhum resultado</CommandEmpty>
                            <CommandGroup>
                              {courses.map((course) => (
                                <CommandItem
                                  value={course.id}
                                  key={course.id}
                                  onSelect={() => {
                                    form.setValue('course_id', course.id)
                                  }}
                                >
                                  {course.title}
                                  <Check
                                    className={cn(
                                      'ml-auto',
                                      course.id === field.value
                                        ? 'opacity-100'
                                        : 'opacity-0',
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço</FormLabel>
                      <FormControl>
                        <Input placeholder="XXX" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price_promotional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço promocional</FormLabel>
                      <FormControl>
                        <Input placeholder="XXX" type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-2 grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="purchase_deadline"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1.5">
                      <FormLabel>Data limite de compra</FormLabel>
                      <Popover modal={true}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiration_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col gap-1.5">
                      <FormLabel>Data de expiração</FormLabel>
                      <Popover modal={true}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={'outline'}
                              className={cn(
                                'pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP', { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date < form.getValues('purchase_deadline')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="group" />
                          </FormControl>
                          <FormLabel className="font-normal">Grupo</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="single" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Individual
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isSubmiting}>
                  {isSubmiting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    'Editar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  )
}
