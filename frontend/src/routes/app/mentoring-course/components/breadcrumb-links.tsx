import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface Props {
  courseName: string
  isMentoring?: boolean
}

export default function BreadcrumbLinks({ courseName, isMentoring }: Props) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          {isMentoring ? (
            <BreadcrumbLink href="/mentoring">Mentorias</BreadcrumbLink>
          ) : (
            <BreadcrumbLink href="/courses">Cursos</BreadcrumbLink>
          )}
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{courseName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
