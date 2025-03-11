import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Check, ChevronsUpDown, LoaderCircle, Plus, Trash } from 'lucide-react'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { api } from '@/services/api'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import moment from 'moment'
import { Card } from '@/components/ui/card'
import type { Meeting, ScheduleType } from '@/types/meeting'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { hoursList } from '@/constants/hour-list'

interface Props {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  meeting: Meeting
  onUpdate: () => void
}

export function UpdateScheduleModal({
  onUpdate,
  meeting,
  open,
  setOpen,
}: Props) {
  const [selectedSchedules, setSelectedSchedules] = useState<ScheduleType[]>([])
  const [selectedStartHour, setSelectedStartHour] = useState<string>('')
  const [selectedEndHour, setSelectedEndHour] = useState<string>('')

  const [isLoading, setIsLoading] = useState(false)

  async function onSchedule() {
    setIsLoading(true)

    const result = selectedSchedules.reduce(
      (acc, item) => {
        let dateGroup = acc.find((group) => group.date === item.date)

        if (!dateGroup) {
          dateGroup = { date: item.date, times: [] }
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
      await api.post(`/mentoring/schedule/${meeting.id}`, result[0])

      toast.success('Horários atualizados com sucesso')
      setOpen(false)
      onUpdate()
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

  function handleAddSchedules() {
    if (selectedStartHour === '') {
      toast.warning('Selecione um horário de início para a mentoria')
      return
    }

    if (selectedEndHour === '') {
      toast.warning('Selecione um horário de término para a mentoria')
      return
    }

    setSelectedSchedules((prev) => [
      ...prev,
      {
        date: meeting.date,
        start_time: selectedStartHour,
        end_time: selectedEndHour,
      },
    ])

    setSelectedStartHour('')
    setSelectedEndHour('')
  }

  function handleDeleteSchedule(index: number) {
    setSelectedSchedules((prev) => prev.filter((_, i) => i !== index))
  }

  function setFirstInfo() {
    const schedules = meeting.times.map((time) => ({
      date: meeting.date,
      start_time: time.start_time,
      end_time: time.end_time,
    }))

    setSelectedSchedules(schedules)
    setSelectedStartHour('')
    setSelectedEndHour('')
  }

  useEffect(() => {
    if (open) setFirstInfo()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="pretty-scroll max-h-[85vh] max-w-xl overflow-y-scroll">
        <DialogHeader>
          <DialogTitle className="font-poppins">
            Atualizar horários do dia{' '}
            <span className="text-primary">
              {moment(meeting.date).format('DD/MM/YYYY')}
            </span>
          </DialogTitle>
          <DialogDescription>Atualize os horários da reunião</DialogDescription>
        </DialogHeader>

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
                    <h3 className="font-bold">{schedule.date}</h3>
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
              'Salvar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
