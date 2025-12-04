import React, { useEffect, useRef } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  IconButton,
  Divider,
  Badge,
} from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

export default function SearchDropdown({ onClose }) {
  const ref = useRef();

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <Box
      ref={ref}
      position="absolute"
      top="70px"
      left="50%"
      transform="translateX(-50%)"
      width="90%"
      maxW="900px"
      bg="gray.900"
      color="gray.200"
      borderRadius="xl"
      boxShadow="0px 8px 40px rgba(0,0,0,0.5)"
      zIndex="999"
      p={6}
      animation="fadeIn 0.2s ease"
    >

      {/* Close Button */}
      <HStack justify="flex-end">
        <IconButton
          icon={<CloseIcon />}
          size="sm"
          bg="gray.700"
          onClick={onClose}
          _hover={{ bg: "gray.600" }}
        />
      </HStack>

      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Trending Searches
      </Text>

      <VStack align="stretch" spacing={3}>
        {[
          "Akhanda 2: Thaandavam",
          "Tere Ishk Mein",
          "Eko",
          "The Devil",
          "Dhurandhar",
          "Businessman",
          "Zootopia 2",
          "Andhra King Taluka",
        ].map((t, i) => (
          <HStack
            key={i}
            justify="space-between"
            p={2}
            borderRadius="md"
            _hover={{ bg: "gray.800", cursor: "pointer" }}
          >
            <Text>{t}</Text>
            <Badge colorScheme="purple">Movie</Badge>
          </HStack>
        ))}
      </VStack>

      <Divider my={5} />

      <Text fontSize="md" color="gray.400">
        Type to search movies, events, plays, sports…
      </Text>
    </Box>
  );
}
