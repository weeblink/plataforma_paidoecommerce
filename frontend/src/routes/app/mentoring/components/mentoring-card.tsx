import { Card, CardContent } from '@/components/ui/card'
import { CarouselItem } from '@/components/ui/carousel'
import { Link } from 'react-router-dom'

interface MentoringProps {
  id: string
  image_url: string
}

interface Props {
  mentoring: MentoringProps
}

export default function MentoringCard({ mentoring }: Props) {
  return (
    <CarouselItem
      key={mentoring.id}
      className="max-w-xs md:basis-1/2 lg:basis-1/3"
    >
      <Card className="border-none">
        <CardContent className="p-0">
          <div className="relative">
            <Link to={`/mentoring/groups/${mentoring.id}`}>
              {mentoring.image_url ? (
                <img
                  src={mentoring.image_url}
                  className="h-100 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="h-48 w-full rounded-lg rounded-b-none bg-secondary/20"></div>
              )}
            </Link>
          </div>
        </CardContent>
      </Card>
    </CarouselItem>
  )
}
