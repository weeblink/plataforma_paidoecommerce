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
import { CalendarIcon, LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { Meeting } from '@/types/meeting'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import moment from 'moment'

const formSchema = z.object({
  group_id: z.string(),
  calendar_time_id: z.string({
    required_error: 'Selecione um horário',
  }),
  title: z.string({
    required_error: 'O título é obrigatório',
  }),
  description: z.string({
    required_error: 'A descrição é obrigatória',
  }),
})

interface Props {
  groupId: string,
  onCreate: () => void,
}

export function ScheduleMentoringModal({ groupId, onCreate }: Props) {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([])
  const [date, setDate] = useState<Date>()
  const [arrayMatcher, setArrayMatcher] = useState<Date[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [open, setOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  async function fetchData() {
    setIsLoading(true)
    setIsError(false)

    try {
      const { data } = await api.get<{ data: Meeting[] }>('/meet/schedule')

      setMeetings(data.data)

      setArrayMatcher(
        data.data.map((meeting) => {
          const [year, month, day] = meeting.date.split('-')
          return new Date(Number(year), Number(month) - 1, Number(day))
        }),
      )

      form.setValue('group_id', groupId)
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao buscar os dados'

      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }

        if (!error.response?.data?.message && error.response?.data?.error) {
          errorMessage = error.response.data.error
        }
      }

      setIsError(true)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      await api.post('/meet/schedule', values)

      toast.success('Reunião agendada com sucesso')
      setOpen(false);
      onCreate();
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao agendar a reunião'

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
      setIsSubmitting(false)
    }
  }

  function handleSelectDate(date: Date | undefined) {
    setDate(date)
    const formattedDate = moment(date).format('YYYY-MM-DD')
    const filtered = meetings.filter(
      (meeting) => meeting.date === formattedDate,
    )
    setFilteredMeetings(filtered)
  }

  const isDateDisabled = (date: Date) => {
    return !arrayMatcher.some(
      (matcherDate) =>
        matcherDate.getFullYear() === date.getFullYear() &&
        matcherDate.getMonth() === date.getMonth() &&
        matcherDate.getDate() === date.getDate(),
    )
  }

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">Agendar reunião</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-poppins">Agendar reunião</DialogTitle>
          <DialogDescription>
            Insira um título e descrição e selecione data e hora para agendar a
            reunião
          </DialogDescription>
        </DialogHeader>

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
          </div>
        )}

        {isError && (
          <div className="flex items-center justify-center py-16">
            <p className="text-sm">
              Ocorreu um erro ao carregar as reuniões disponíveis
            </p>
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
                    <FormLabel>Assunto</FormLabel>
                    <FormControl>
                      <Input placeholder="Assunto da reunião" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Descrição da reunião"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col">
                <Label>Selecione a data para a reunião</Label>
                <Popover modal>
                  <PopoverTrigger asChild>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'mt-2.5 justify-start text-left font-normal',
                        !date && 'text-muted-foreground',
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {date ? (
                        format(date, 'PPP', {
                          locale: ptBR,
                        })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      locale={ptBR}
                      mode="single"
                      selected={date}
                      onSelect={handleSelectDate}
                      disabled={isDateDisabled}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <FormField
                control={form.control}
                name="calendar_time_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecione o horário</FormLabel>
                    <Select
                      disabled={!date}
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={
                              !date
                                ? 'Selecione uma data primeiro'
                                : 'Selecione um horário'
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredMeetings.map((meeting) => (
                          <SelectGroup key={meeting.id}>
                            <SelectLabel>{meeting.user.username}</SelectLabel>
                            {meeting.times.map((time) => (
                              <SelectItem key={time.id} value={time.id}>
                                {time.start_time} - {time.end_time}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin text-white" />
                  ) : (
                    'Agendar'
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
