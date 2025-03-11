import { Calendar, DollarSign, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { MentoringGroup } from '@/types/mentoring-management'
import { AccordionContent, AccordionTrigger } from '@/components/ui/accordion'
import moment from 'moment'
import { UpdateMentoringGroupModal } from './groups/update-modal'
import { DeleteMentoringGroupModal } from './groups/delete-modal'
import { Badge } from '@/components/ui/badge'

interface Props {
  group: MentoringGroup
  onRefresh: () => Promise<void>
}

export default function GroupCard({ group, onRefresh }: Props) {
  return (
    <Card key={group.id} className="group">
      <AccordionTrigger className="py-0 pl-2 pr-4">
        <CardHeader className="px-2 py-4">
          <CardTitle>{group.title}</CardTitle>
        </CardHeader>
      </AccordionTrigger>
      <AccordionContent className="pb-0">
        <CardContent className="space-y-2 px-4">
          <div className="flex w-full items-center justify-between gap-2">
            <div>
              <Badge>{group.type === 'group' ? 'Grupo' : 'Individual'}</Badge>
            </div>

            <div className="space-x-2">
              <UpdateMentoringGroupModal group={group} onUpdate={onRefresh} />

              <DeleteMentoringGroupModal group={group} onDelete={onRefresh} />
            </div>
          </div>

          <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
                <Users className="size-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold leading-none text-primary">
                Quantidade de alunos:
              </span>
            </div>
            <span className="truncate text-sm">{group.qnt_students}</span>
          </div>

          <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
                <DollarSign className="size-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold leading-none text-primary">
                Preço:
              </span>
            </div>
            <span className="truncate text-sm">R$ {group.price}</span>
          </div>

          <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
                <DollarSign className="size-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold leading-none text-primary">
                Preço promocional:
              </span>
            </div>
            <span className="truncate text-sm">
              R$ {group.price_promotional}
            </span>
          </div>

          <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
                <Calendar className="size-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold leading-none text-primary">
                Data limite de compra:
              </span>
            </div>
            <span className="truncate text-sm">
              {moment(group.purchase_deadline).format('DD/MM/YYYY')}
            </span>
          </div>

          <div className="flex flex-col gap-x-2 gap-y-1 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full bg-primary/40 p-1">
                <Calendar className="size-3.5 text-primary" />
              </div>
              <span className="text-sm font-semibold leading-none text-primary">
                Data de expiração:
              </span>
            </div>
            <span className="truncate text-sm">
              {moment(group.expiration_date).format('DD/MM/YYYY')}
            </span>
          </div>
        </CardContent>
      </AccordionContent>
    </Card>
  )
}
