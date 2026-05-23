"use client";

import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, A11y } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import CityCard from "./CityCard";

const GRADIENTS = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-orange-500 to-rose-500",
  "from-violet-500 to-purple-600",
  "from-sky-500 to-cyan-600",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-fuchsia-600",
  "from-green-500 to-emerald-700",
];

export default function CitiesSlider({ cities }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <Swiper
      modules={[Navigation, Pagination, A11y]}
      navigation={!isMobile}
      pagination={{ clickable: true }}
      spaceBetween={16}
      breakpoints={{
        0:    { slidesPerView: 1.2 },
        480:  { slidesPerView: 2.1 },
        768:  { slidesPerView: 3.1 },
        1024: { slidesPerView: 4 },
      }}
      className="!pb-10"
    >
      {cities.map((city, i) => (
        <SwiperSlide key={city.slug}>
          <CityCard city={city} gradient={GRADIENTS[i % GRADIENTS.length]} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
