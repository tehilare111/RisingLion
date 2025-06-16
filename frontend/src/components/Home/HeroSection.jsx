import React from "react";
import HeroSectionCard from "./HeroSectionCard";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const HeroSection = () => {
  const homeData = [
    {
      heading: "Explore the sights of the Andaman and Nicobar Islands",
      subheading: "The place called heaven on earth",
      src: "https://musicart.xboxlive.com/7/936d5100-0000-0000-0000-000000000002/504/image.jpg",
    },
    {
      heading: "Discover the beauty of Paris",
      subheading: "City of Love",
      src: "https://funkymbti.com/wp-content/uploads/2023/07/nala.jpg",
    },
    {
      heading: "Experience the wonders of New York City",
      subheading: "The city that never sleeps",
      src: "https://i.ytimg.com/vi/o17MF9vnabg/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCnYHKZSgjeh2k_LQCT1fjLzEbSRQ",
    },
    {
      heading: "Marvel at the grandeur of the Grand Canyon",
      subheading: "Nature's masterpiece",
      src: "https://www.movieshowplus.com/uploads/3/0/9/0/30906545/main-lion-king-3d-01_orig.jpg",
    },
    {
      heading: "Get lost in the charm of Kyoto",
      subheading: "Tradition meets modernity",
      src: "https://vhx.imgix.net/unchainedtv/assets/83fd4bf3-ea6e-426f-b7bf-cd3b45473589.jpg?auto=format%2Ccompress&fit=crop&h=720&q=75&w=1280",
    },
  ];

  return (
    <section className="max-w-[1800px] mx-auto w-full h-[90vh]  mt-6 rounded-[25px] overflow-hidden relative">
      <Swiper
        modules={[Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        loop={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
      >
        {homeData.map((data, index) => (
          <SwiperSlide key={index} className="h-[90vh]">
            <HeroSectionCard
              heading={data.heading}
              subheading={data.subheading}
              src={data.src}
            />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* <HeroSectionCard /> */}
    </section>
  );
};

export default HeroSection;
