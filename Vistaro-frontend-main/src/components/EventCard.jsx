// src/components/EventCard.jsx

import React from "react";
import { Box, Image, Text, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const fmtDateOnly = (iso) => {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function EventCard({ event }) {
  const navigate = useNavigate();
  const isAdmin = useSelector((state)=>state.user?.role)=== "ADMIN" ? true : false;

  return (
    <Box
      cursor="pointer"
      px={2}
      transition="0.3s"
      onClick={() => navigate(`/event/${event.eventId}`)}
    >
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
          src={event.thumbnailUrl || "/fallback.jpg"}
          alt={event.title}
          width="100%"
          height="100%"
          objectFit="cover"
        />

        {/* Hover Overlay */}
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
            {event.description || "No description available."}
          </Text>

          <Text mt={2} fontSize="sm" fontWeight="bold">
            {event.category === "SPORT"
              ? `Match: ${fmtDateOnly(event.startTime)} — ${fmtDateOnly(
                  event.endTime
                )}`
              : `In theatres: ${fmtDateOnly(event.startTime)} — ${fmtDateOnly(
                  event.endTime
                )}`}
          </Text>

          <Button
            size="sm"
            mt={3}
            colorScheme="red"
            width="100%"
            onClick={(ev) => {
              ev.stopPropagation();
              navigate(`/event/${event.eventId}`);
            }}
          >
            {isAdmin ? "Manage" : "Book"}
          </Button>
        </Box>
      </Box>

      <Text
        mt={2}
        textAlign="center"
        fontWeight="bold"
        fontSize="lg"
        noOfLines={2}
      >
        {event.title}
      </Text>

      <style>
        {`
          .hover-info { bottom: -100%; }
          .hover-info:hover,
          img:hover + .hover-info { bottom: 0; }
        `}
      </style>
    </Box>
  );
}
