import { Card, CardContent } from '@/components/ui/card'
import { CarouselItem } from '@/components/ui/carousel'
import type { Course } from '@/types/course'
import { LockIcon } from 'lucide-react'
import { Link } from 'react-router-dom'
import { TypeUrl } from '../../payment'
import ProductDetails from '@/components/ProductDetails.tsx'

interface Props {
  course: Course
}

export default function CourseCard({ course }: Props) {
  return (
    <CarouselItem
      key={course.id}
      className="max-w-xs md:basis-1/2 lg:basis-1/3"
    >
      <Card className="border-none">
        <CardContent className="p-0">
          <div className="relative">
            {course.image_url ? (
              <Link to={`/courses/${course.id}`}>
                <img
                  src={course.image_url}
                  alt={course.title}
                  className="h-100 w-full rounded-xl object-cover"
                />
              </Link>
            ) : (
              <div className="h-48 w-full rounded-lg rounded-b-none bg-secondary/20"></div>
            )}
            {course.is_pay && course.is_locked && (
              <div className="absolute inset-0 flex flex-col items-center justify-center rounded-xl rounded-b-none bg-black bg-opacity-50">
                <LockIcon className="h-12 w-12 text-white" />
                <div className={'mt-3'}>
                  <ProductDetails
                    title={course.title}
                    price={undefined}
                    promotional_price={undefined}
                    image_url={course.image_url}
                    linkBuy={`/payment/${TypeUrl.Course}/${course.id}`}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </CarouselItem>
  )
}
