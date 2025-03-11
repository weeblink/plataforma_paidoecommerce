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
import {useState, type Dispatch, type SetStateAction, useEffect} from 'react'
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
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { hoursList } from '@/constants/hour-list'

interface ScheduleType {
  title: string
  description: string
  group_id: string
  date: string
  start_time: string
  end_time: string
}

interface Props {
  onCreate: () => void
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export function CreateMentoringModal({ onCreate, open, setOpen }: Props) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [selectedSchedules, setSelectedSchedules] = useState<ScheduleType[]>([])
  const [selectedStartHour, setSelectedStartHour] = useState<string>('')
  const [selectedEndHour, setSelectedEndHour] = useState<string>('')
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [date, setDate] = useState<Date>()
  const [groups, setGroups] = useState<MinimalSelectOption[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  async function onSchedule() {
    setIsSubmitting(true)

    try {
      const formatedSchedules = selectedSchedules.map((schedule) => ({
        ...schedule,
        date: moment(schedule.date).format('DD/MM/YYYY'),
      }))

      await api.post('/mentoring/schedule/create/groups', formatedSchedules)

      toast.success('Reunião agendada com sucesso')
      setOpen(false)
      onCreate()
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

  function onOpenChange(value: boolean) {
    if (!value) {
      fetchGroups()

      setDate(undefined)
      setTitle('')
      setDescription('')
      setSelectedGroup('')
      setSelectedStartHour('')
      setSelectedEndHour('')
      setSelectedSchedules([])
    }

    setOpen(value)
  }

  function handleAddSchedules() {
    if (title.trim() === '') {
      toast.warning('Digite um título para a reunião')
      return
    }

    if (description.trim() === '') {
      toast.warning('Digite uma descrição para a reunião')
      return
    }

    if (selectedGroup === '') {
      toast.warning('Selecione um grupo para a reunião')
      return
    }

    if (!date) {
      toast.warning('Selecione uma data para a reunião')
      return
    }

    if (selectedStartHour === '') {
      toast.warning('Selecione um horário de início para a reunião')
      return
    }

    if (selectedEndHour === '') {
      toast.warning('Selecione um horário de término para a reunião')
      return
    }

    setSelectedSchedules((prev) => [
      ...prev,
      {
        title,
        description,
        group_id: selectedGroup,
        date: date.toISOString(),
        start_time: selectedStartHour,
        end_time: selectedEndHour,
      },
    ])

    setTitle('')
    setDescription('')
    setDate(undefined)
    setSelectedGroup('')
    setSelectedStartHour('')
    setSelectedEndHour('')
  }

  function handleDeleteSchedule(index: number) {
    setSelectedSchedules((prev) => prev.filter((_, i) => i !== index))
  }

  async function fetchGroups() {
    setIsLoading(true)
    setIsError(false)

    try {
      const { data } = await api.get<{ data: MinimalSelectOption[] }>(
        '/mentoring/schedule/groups',
      )

      setGroups(data.data)
    } catch {
      setIsError(true)
      toast.error('Ocorreu um erro ao carregar os grupos')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  const arrayMatcher: Matcher = [new Date(2024, 11, 12), new Date(2024, 11, 13)]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="pretty-scroll max-h-[85vh] max-w-xl overflow-y-scroll">
        <DialogHeader>
          <DialogTitle className="font-poppins">
            Criar reunião em grupo
          </DialogTitle>
          <DialogDescription>
            Selecione a data e hora para criar uma reunião em grupo
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
              Ocorreu um erro ao carregar as informações
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            <Label>Título</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da reunião"
            />

            <Label className="mt-2">Descrição</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite a descrição da reunião"
            />

            <div className="mt-2 grid gap-4 lg:grid-cols-2">
              <div className="flex flex-col">
                <Label className="mb-1">Selecione o grupo</Label>
                <Popover modal>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="justify-between"
                    >
                      {selectedGroup !== ''
                        ? groups.find((group) => group.id === selectedGroup)
                            ?.title
                        : 'Selecione o grupo'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                    <Command>
                      <CommandInput placeholder="Pesquisa..." />
                      <CommandList>
                        <CommandEmpty>Nenhum resultado.</CommandEmpty>
                        <CommandGroup className="pretty-scroll max-h-[200px] overflow-y-scroll">
                          {groups.map((group) => (
                            <CommandItem
                              key={group.id}
                              value={group.id}
                              onSelect={(currentValue) => {
                                setSelectedGroup(
                                  currentValue === selectedGroup
                                    ? ''
                                    : currentValue,
                                )
                              }}
                            >
                              <Check
                                className={cn(
                                  'mr-2 h-4 w-4',
                                  selectedGroup === group.id
                                    ? 'opacity-100'
                                    : 'opacity-0',
                                )}
                              />
                              {group.title}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="flex flex-col">
                <Label className="mb-1">Selecione a data para a reunião</Label>
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
              </div>
            </div>

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
                        ? hoursList.find(
                            (hour) => hour.value === selectedStartHour,
                          )?.label
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
                        ? hoursList.find(
                            (hour) => hour.value === selectedEndHour,
                          )?.label
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
              Adicionar reunião
              <Plus className="ml-2 size-4" />
            </Button>

            <div className="mt-2">
              <h2 className="text-lg font-bold">Reuniões agendadas</h2>

              <div className="mt-2 space-y-2">
                {selectedSchedules.length === 0 && (
                  <p className="text-sm">Nenhuma reunião agendada</p>
                )}

                {selectedSchedules.map((schedule, index) => (
                  <Card className="px-4 py-2" key={index}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">{schedule.title}</h3>
                        <p className="text-sm">{schedule.description}</p>
                        <p className="text-sm">
                          <span>Grupo:</span> {schedule.group_id}
                        </p>
                        <p className="text-sm">
                          <span>Data:</span>{' '}
                          {moment(schedule.date).format('DD/MM/YYYY')}
                        </p>
                        <p className="text-sm">
                          <span>Horário:</span> {schedule.start_time} -{' '}
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

            <DialogFooter className="sticky bottom-0 mt-4">
              <Button
                onClick={onSchedule}
                type="button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoaderCircle className="h-4 w-4 animate-spin text-white" />
                ) : (
                  'Criar'
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
