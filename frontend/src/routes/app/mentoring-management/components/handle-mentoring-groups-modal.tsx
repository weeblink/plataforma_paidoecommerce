import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Accordion, AccordionItem } from '@/components/ui/accordion'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Label } from '@/components/ui/label'
import { LoaderCircle } from 'lucide-react'
import { toast } from 'sonner'
import { AxiosError } from 'axios'
import type {
  MentoringGroup,
  MentoringManagement,
} from '@/types/mentoring-management'
import GroupCard from './group-card'
import { CreateMentoringGroupModal } from './groups/create-modal'
import { api } from '@/services/api'

interface Props {
  mentoring: MentoringManagement
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

export function HandleMentoringGroupsModal({
  mentoring,
  open,
  setOpen,
}: Props) {
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)
  const [groups, setGroups] = useState<MentoringGroup[]>([])
  const [value, setAccordionValue] = useState<string | undefined>(undefined)

  async function fetchData() {
    setIsLoading(true)

    try {
      const { data } = await api.get<{ data: MentoringGroup[] }>(
        `/mentoring/group-management/${mentoring.id}`,
      )

      setGroups(data.data)
    } catch (error) {
      let errorMessage = 'Ocorreu um erro ao buscar os grupos da mentoria'

      if (error instanceof AxiosError) {
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message
        }

        if (!error.response?.data?.message && error.response?.data?.error) {
          errorMessage = error.response.data.error
        }
      }

      toast.error(errorMessage)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!open) return

    fetchData()
  }, [open])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="pretty-scroll max-h-[85vh] w-full max-w-xl overflow-y-scroll">
        <DialogHeader>
          <DialogTitle className="font-poppins">
            Gerenciar grupos da mentoria
          </DialogTitle>
          <DialogDescription>
            Gerencie os grupos da mentoria <strong>{mentoring.title}</strong>.
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
              Ocorreu um erro ao carregar os grupos da mentoria
            </p>
          </div>
        )}

        {!isLoading && !isError && (
          <div className="mt-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Grupos</Label>
                <p className="text-xs text-gray-400">
                  Clique no card para ver informações do grupo
                </p>
              </div>

              <CreateMentoringGroupModal
                mentoringId={mentoring.id}
                onCreate={fetchData}
              />
            </div>

            {isLoading && (
              <div className="flex items-center justify-center">
                <LoaderCircle className="h-4 w-4 animate-spin text-primary" />
              </div>
            )}

            <Accordion
              type="single"
              collapsible
              onValueChange={setAccordionValue}
              value={value}
            >
              <div className="space-y-4">
                {groups.map((group) => (
                  <AccordionItem
                    value={group.id}
                    key={group.id}
                    className="group border-b-0"
                  >
                    <GroupCard group={group} onRefresh={fetchData} />
                  </AccordionItem>
                ))}
              </div>
            </Accordion>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
