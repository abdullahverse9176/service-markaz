"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import ProviderCard from "@/app/components/ProviderCard";

export default function FeaturedProvidersSlider({ providers }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <div className="relative featured-slider">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={24}
        slidesPerView={1}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
        }}
        navigation={!isMobile}
        pagination={{ clickable: true }}
        autoplay={{ delay: 4500, disableOnInteraction: false, pauseOnMouseEnter: true }}
        loop={providers.length >= 3}
        className="!pb-12"
      >
        {providers.map((provider) => (
          <SwiperSlide key={provider.id} className="h-auto self-stretch">
            <ProviderCard provider={provider} />
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .featured-slider .swiper-button-next,
        .featured-slider .swiper-button-prev {
          color: #2563eb;
          background: white;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .featured-slider .swiper-button-next::after,
        .featured-slider .swiper-button-prev::after {
          font-size: 14px;
          font-weight: 700;
        }
        .featured-slider .swiper-pagination-bullet {
          background: #2563eb;
          opacity: 0.3;
        }
        .featured-slider .swiper-pagination-bullet-active {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
