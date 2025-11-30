// src/components/HomeMovies.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Image,
  Text,
  Skeleton,
  Button,
  Center,
} from "@chakra-ui/react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useSelector } from "react-redux";
import { searchByCategory } from "../apis/eventApi";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import HeadingComponent from "./HeadingComponent";

const fmtDateOnly = (iso) => {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function HomeMovies({ category = "MOVIE" }) {
  const navigate = useNavigate();
  const selectedCity = useSelector((s) => s.city?.selectedCity);
  const cityName = selectedCity?.city || "";

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!cityName) return;

    setLoading(true);

    searchByCategory(cityName, category)
      .then((res) => {
        setEvents(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [cityName, category]);

  if (loading) {
    return (
     <Loader/>
    );
  }

  if (!events.length) {
    return (
      <Box px={4} py={6}>
         <HeadingComponent heading={`Trending Movies`}/>
        <Center py={8}>
          <Text color="white">No movies found.</Text>
        </Center>
      </Box>
    );
  }

  // CONFIG: Always show 4 items
  const responsive = {
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 600 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 600, min: 0 },
      items: 1,
    },
  };

  return (
    <Box px={4} py={6}>
      <HeadingComponent heading={`Trending Movies`}/>

      <Carousel
        responsive={responsive}
        draggable
        swipeable
        autoPlay={false}
        keyBoardControl
        showDots={false}
        customTransition="all 0.8s ease"
        transitionDuration={800}
        ssr
        // centerMode
        // autoPlay
        // autoPlaySpeed={3000}
        arrows={true}
        containerClass="carousel-container"
        itemClass="carousel-item-padding-40-px"
      >
        {events.map((e) => (
          <Box
            key={e.eventId}
            px={2}
            cursor="pointer"
            onClick={() => navigate(`/event/${e.eventId}`)}
          >
            {/* POSTER */}
            <Box
              position="relative"
              overflow="hidden"
              borderRadius="lg"
              height="360px"
              _hover={{ transform: "scale(1.04)" }}
              transition="0.3s"
              boxShadow="dark-lg"
            >
              <Image
                src={e.thumbnailUrl}
                alt={e.title}
                width="100%"
                height="100%"
                objectFit="cover"
                objectPosition="center"
                borderRadius="lg"
              />

              {/* HOVER OVERLAY */}
              <Box
                className="hover-info"
                position="absolute"
                bottom="-100%"
                left="0"
                width="100%"
                p={4}
                color="white"
                bg="rgba(0,0,0,0.75)"
                transition="0.3s ease"
              >
                <Text fontSize="sm" noOfLines={3}>
                  {e.description}
                </Text>

                <Text mt={2} fontSize="sm" fontWeight="bold">
                  In theatres: {fmtDateOnly(e.startTime)} —{" "}
                  {fmtDateOnly(e.endTime)}
                </Text>

                <Button
                  size="sm"
                  mt={3}
                  colorScheme="red"
                  width="100%"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    navigate(`/event/${e.eventId}`);
                  }}
                >
                  Book
                </Button>
              </Box>
            </Box>

            {/* TITLE */}
            <Text
              mt={2}
              textAlign="center"
              color="white"
              fontWeight="bold"
              fontSize="lg"
              noOfLines={1}
            >
              {e.title}
            </Text>
          </Box>
        ))}
      </Carousel>

      {/* CSS fix for hover */}
      <style>
        {`
          .carousel-container {
            padding-bottom: 20px;
          }

          .hover-info {
            position: absolute;
            bottom: -100%;
          }

          .hover-info:hover,
          img:hover + .hover-info {
            bottom: 0;
          }
        `}
      </style>
    </Box>
  );
}
