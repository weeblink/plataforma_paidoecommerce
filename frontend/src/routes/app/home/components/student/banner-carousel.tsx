import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import Autoplay from 'embla-carousel-autoplay'
import type { Banner } from '@/types/banner'

interface Props {
  banners: Banner[]
}

export default function BannerCarousel({ banners }: Props) {
  return (
    <div className="absolute inset-0 -z-10 -mx-5 h-full bg-black dark:bg-black/70">
      <Carousel
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem
              className={'h-[600px] bg-black opacity-20 dark:bg-black/70'}
              key={banner.id}
              style={{
                backgroundImage: `url('${banner.image_url}')`,
                backgroundPosition: 'center',
                backgroundSize: 'cover',
              }}
            ></CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
