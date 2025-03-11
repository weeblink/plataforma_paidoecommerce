import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  LoaderCircle,
  Plus,
  Trash,
} from 'lucide-react'
import { useState, type Dispatch, type SetStateAction } from 'react'
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
import type { Matcher } from 'react-day-picker'
import moment from 'moment'
import { Card } from '@/components/ui/card'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { hoursList } from '@/constants/hour-list'
import type { ScheduleType } from '@/types/meeting'

interface Props {
  onCreate: () => void
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export function CreateScheduleModal({ onCreate, open, setOpen }: Props) {
  const [selectedSchedules, setSelectedSchedules] = useState<ScheduleType[]>([])
  const [selectedStartHour, setSelectedStartHour] = useState<string>('')
  const [selectedEndHour, setSelectedEndHour] = useState<string>('')

  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>()

  async function onSchedule() {
    setIsLoading(true)

    const result = selectedSchedules.reduce(
      (acc, item) => {
        const formattedDate = moment(item.date).format('DD/MM/YYYY')

        let dateGroup = acc.find((group) => group.date === formattedDate)

        if (!dateGroup) {
          dateGroup = { date: formattedDate, times: [] }
          acc.push(dateGroup)
        }

        dateGroup.times.push({
          start_time: item.start_time,
          end_time: item.end_time,
        })

        return acc
      },
      [] as {
        date: string
        times: { start_time: string; end_time: string }[]
      }[],
    )

    try {
      await api.post('/mentoring/schedule', { dates: result })

      toast.success('Horários agendadados com sucesso')

      setSelectedSchedules([]);
      setOpen(false)
      onCreate();


    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao agendar os horários'

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
      setIsLoading(false)
    }
  }

  function onOpenChange(value: boolean) {
    if (!value) {
      setDate(undefined)
      setSelectedStartHour('')
      setSelectedEndHour('')
      setSelectedSchedules([])
    }

    setOpen(value)
  }

  function handleAddSchedules() {
    if (!date) {
      toast.warning('Selecione uma data para o agendamento')
      return
    }

    if (selectedStartHour === '') {
      toast.warning('Selecione um horário de início para o agendamento')
      return
    }

    if (selectedEndHour === '') {
      toast.warning('Selecione um horário de término para o agendamento')
      return
    }

    setSelectedSchedules((prev) => [
      ...prev,
      {
        date: date.toISOString(),
        start_time: selectedStartHour,
        end_time: selectedEndHour,
      },
    ])
    setDate(undefined)
    setSelectedStartHour('')
    setSelectedEndHour('')
  }

  function handleDeleteSchedule(index: number) {
    setSelectedSchedules((prev) => prev.filter((_, i) => i !== index))
  }

  const arrayMatcher: Matcher = [new Date(2024, 11, 12), new Date(2024, 11, 13)]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pretty-scroll max-h-[85vh] max-w-xl overflow-y-scroll">
        <DialogHeader>
          <DialogTitle className="font-poppins">
            Criar um horários para reuniões
          </DialogTitle>
          <DialogDescription>
            Selecione a data e hora para criar um horário de reunião
          </DialogDescription>
        </DialogHeader>

        <Label>Selecione a data para a reunião</Label>
        <Popover modal>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'justify-start text-left font-normal',
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
              onSelect={setDate}
              disabled={arrayMatcher}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <div className="mt-2 grid gap-4 lg:grid-cols-2">
          <div className="flex flex-col">
            <Label className="mb-2">Selecione a hora de início</Label>
            <Popover modal>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="justify-between"
                >
                  {selectedStartHour !== ''
                    ? hoursList.find((hour) => hour.value === selectedStartHour)
                        ?.label
                    : 'Selecione a hora de início'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Pesquisa..." />
                  <CommandList>
                    <CommandEmpty>Nenhum resultado.</CommandEmpty>
                    <CommandGroup className="pretty-scroll max-h-[200px] overflow-y-scroll">
                      {hoursList.map((hour) => (
                        <CommandItem
                          key={hour.value}
                          value={hour.value}
                          onSelect={(currentValue) => {
                            setSelectedStartHour(
                              currentValue === selectedStartHour
                                ? ''
                                : currentValue,
                            )
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedStartHour === hour.value
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {hour.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col">
            <Label className="mb-2">Selecione a hora de término</Label>
            <Popover modal>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="justify-between"
                >
                  {selectedEndHour !== ''
                    ? hoursList.find((hour) => hour.value === selectedEndHour)
                        ?.label
                    : 'Selecione a hora de término'}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Pesquisa..." />
                  <CommandList>
                    <CommandEmpty>Nenhum resultado.</CommandEmpty>
                    <CommandGroup className="pretty-scroll max-h-[200px] overflow-y-scroll">
                      {hoursList.map((hour) => (
                        <CommandItem
                          key={hour.value}
                          value={hour.value}
                          onSelect={(currentValue) => {
                            setSelectedEndHour(
                              currentValue === selectedEndHour
                                ? ''
                                : currentValue,
                            )
                          }}
                        >
                          <Check
                            className={cn(
                              'mr-2 h-4 w-4',
                              selectedEndHour === hour.value
                                ? 'opacity-100'
                                : 'opacity-0',
                            )}
                          />
                          {hour.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <Button
          onClick={handleAddSchedules}
          className="mt-2"
          variant="secondary"
        >
          Adicionar mentoria
          <Plus className="ml-2 size-4" />
        </Button>

        <div className="mt-2">
          <h2 className="text-lg font-bold">Mentorias agendadas</h2>

          <div className="mt-2 space-y-2">
            {selectedSchedules.length === 0 && (
              <p className="text-sm">Nenhuma mentoria agendada</p>
            )}

            {selectedSchedules.map((schedule, index) => (
              <Card className="px-4 py-2" key={index}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">
                      {moment(schedule.date).format('DD/MM/YYYY')}
                    </h3>
                    <p className="text-sm">
                      <span>Horários:</span> {schedule.start_time} -{' '}
                      {schedule.end_time}
                    </p>
                  </div>

                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDeleteSchedule(index)}
                  >
                    <Trash className="size-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onSchedule} type="button" disabled={isLoading}>
            {isLoading ? (
              <LoaderCircle className="h-4 w-4 animate-spin text-white" />
            ) : (
              'Criar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
