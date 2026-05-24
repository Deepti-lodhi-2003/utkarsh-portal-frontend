import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Hero() {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const slides = [
    { id: 1, image: 'https://res.cloudinary.com/dc2geexnf/image/upload/v1771574404/Screenshot_2026-02-20_132941_l4qmkt.png', alt: t('home.hero.industrial_growth') },
    { id: 2, image: 'https://res.cloudinary.com/dc2geexnf/image/upload/v1771574404/Screenshot_2026-02-20_132924_tgporx.png', alt: t('home.hero.skill_dev') },
  ];

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="relative w-full bg-gray-100 pt-5">
      {/* Carousel Container - Height determined by image aspect ratio */}
      <div className="relative w-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`transition-opacity duration-1000 ease-in-out w-full ${index === currentSlide ? 'relative opacity-100 z-10' : 'absolute top-0 left-0 opacity-0 z-0'
              }`}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="w-full h-auto block"
            />
          </div>
        ))}

        {/* Navigation Buttons (Commented out as per user preference in previous edits, but keeping structure if needed) */}
        {/* <button onClick={prevSlide}...> </button> */}
        {/* <button onClick={nextSlide}...> </button> */}

        {/* Pagination Dots */}
        <div className="absolute bottom-2 md:bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full cursor-pointer transition-all duration-300 ${index === currentSlide ? 'bg-blue-600 border border-white' : 'bg-white/50 hover:bg-white'
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
