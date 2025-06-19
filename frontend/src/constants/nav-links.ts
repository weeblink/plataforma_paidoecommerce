import {
  Home,
  LucideIcon,
  Users,
  GraduationCap,
  PhoneIcon,
  Mail,
  Presentation,
  Package,
  Image,
  Headset,
  MessageCircle,
  DollarSign,
  Calculator,
} from 'lucide-react'

export interface NavLinks {
  title: string
  icon: LucideIcon
  route: string
  role: 'STUDENT' | 'ADMIN'
}

export const NAV_LINKS: NavLinks[] = [
  {
    title: 'Início',
    icon: Home as LucideIcon,
    route: '/',
    role: 'STUDENT',
  },
  {
    title: 'Início',
    icon: Home as LucideIcon,
    route: '/',
    role: 'ADMIN',
  },
  {
    title: 'Cursos',
    icon: GraduationCap as LucideIcon,
    route: '/courses',
    role: 'STUDENT',
  },
  {
    title: 'Mentorias',
    icon: Presentation as LucideIcon,
    route: '/mentoring',
    role: 'STUDENT',
  },
  {
    title: 'Produtos',
    icon: Package as LucideIcon,
    route: '/extra',
    role: 'STUDENT',
  },
  {
    title: 'Calculadora',
    icon: Calculator as LucideIcon,
    route: '/calculator',
    role: 'STUDENT',
  },
  {
    title: 'Suporte',
    icon: PhoneIcon as LucideIcon,
    route:
      'https://wa.me/5531972532421?text=Ol%C3%A1!%20Vim%20pela%20plataforma%20e%20estou%20precisando%20de%20ajuda%20do%20suporte.',
    role: 'STUDENT',
  },
  {
    title: 'Gerenciar cursos',
    icon: GraduationCap as LucideIcon,
    route: '/courses-management',
    role: 'ADMIN',
  },
  {
    title: 'Gerenciar mentorias',
    icon: Presentation as LucideIcon,
    route: '/mentoring-management',
    role: 'ADMIN',
  },
  {
    title: 'Gerenciar produtos',
    icon: Package as LucideIcon,
    route: '/extra-management',
    role: 'ADMIN',
  },
  {
    title: 'Minhas reuniões',
    icon: Headset as LucideIcon,
    route: '/admin-mentoring-meetings',
    role: 'ADMIN',
  },
  {
    title: 'Banners',
    icon: Image as LucideIcon,
    route: '/banners',
    role: 'ADMIN',
  },
  {
    title: 'Leads',
    icon: Users as LucideIcon,
    route: '/leads',
    role: 'ADMIN',
  },
  {
    title: 'Email marketing',
    icon: Mail as LucideIcon,
    route: '/email-marketing',
    role: 'ADMIN',
  },
  {
    title: 'Whatsapp',
    icon: MessageCircle as LucideIcon,
    route: '/whatsapp-connections',
    role: 'ADMIN',
  },
  {
    title: 'Checkouts',
    icon: DollarSign as LucideIcon,
    route: '/payment-platforms',
    role: 'ADMIN',
  },
]
