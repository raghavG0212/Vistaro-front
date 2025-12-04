import React, { useEffect, useState, useCallback } from "react";
import {
  Box,
  Text,
  Heading,
  Grid,
  Center,
  Select,
  Skeleton,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import HomeMainSlider from "../components/HomeMainSlider";
import EventCard from "../components/EventCard";
import { searchByCategory } from "../apis/eventApi";

const SLOT_BASE = "/api/v1/eventslot";

const cleanLanguages = (langString) => {
  if (!langString) return "";
  return [...new Set(
    langString.split(",").map((s) => s.trim()).filter(Boolean)
  )].join(", ");
};

export default function Movies() {
  const navigate = useNavigate();
  const city = useSelector((s) => s.city?.selectedCity?.city || "");
  
  const [movies, setMovies] = useState([]);
  const [display, setDisplay] = useState([]);
  const [slotLangMap, setSlotLangMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [languageFilter, setLanguageFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const loadSlotsByCity = useCallback(async (cityName) => {
    try {
      const res = await axios.get(SLOT_BASE, { params: { city: cityName } });
      const slots = Array.isArray(res.data) ? res.data : [];
      const map = {};

      slots.forEach((s) => {
        if (!map[s.eventId]) map[s.eventId] = new Set();
        s.language
          ?.split(",")
          ?.map((x) => x.trim())
          .forEach((x) => map[s.eventId].add(x));
      });

      const final = {};
      Object.keys(map).forEach((id) => {
        final[id] = Array.from(map[id]).join(", ");
      });

      setSlotLangMap(final);
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!city) return;

    const load = async () => {
      setLoading(true);

      const res = await searchByCategory(city, "MOVIE");
      const data = res.data || [];
      setMovies(data);

      await loadSlotsByCity(city);

      let arr = [...data];

      if (genreFilter)
        arr = arr.filter((m) =>
          (m.subCategory || "").toLowerCase().includes(genreFilter.toLowerCase())
        );

      if (languageFilter)
        arr = arr.filter((m) => {
          const slot = slotLangMap[m.eventId] || m.language || "";
          return slot.toLowerCase().includes(languageFilter.toLowerCase());
        });

      setDisplay(arr);
      setLoading(false);
    };

    load();
  }, [city, genreFilter, languageFilter, loadSlotsByCity]);

  return (
    <Box bg="gray.900" color="white" px={6} py={8} minH="100vh">
      <Box minH="320px"><HomeMainSlider /></Box>

      <Heading mb={2}>Movies in {city}</Heading>
      <Text color="gray.400" mb={6}>Now Showing</Text>

      {/* FILTERS */}
      <Box display="flex" gap={4} mb={6}>
        <Select
          placeholder="Filter by Language"
          bg="gray.800"
          color="white"
          w="220px"
          value={languageFilter}
          borderColor="gray.600"
          _hover={{borderColor: "teal.300"}}
          _focus={{borderColor: "teal.300", boxShadow: "0 0 0 1px teal"}}
           sx={{
    option: {
      background: "#1A202C",  // Dark dropdown bg
      color: "white",         // White text
      padding: "10px",
    },
  }}
          onChange={(e) => setLanguageFilter(e.target.value)}
        >
          <option value="Hindi">Hindi</option>
          <option value="English">English</option>
          <option value="Kannada">Kannada</option>
          <option value="Telugu">Telugu</option>
          <option value="Tamil">Tamil</option>
        </Select>

        <Select
          placeholder="Filter by Genre"
          bg="gray.800"
          color="white"
          w="220px"
          value={genreFilter}
          borderColor="gray.600"
          _hover={{borderColor: "teal.300"}}
          _focus={{borderColor: "teal.300", boxShadow: "0 0 0 1px teal"}}
           sx={{
    option: {
      background: "#1A202C",  // Dark dropdown bg
      color: "white",         // White text
      padding: "10px",
    },
  }}
          onChange={(e) => setGenreFilter(e.target.value)}
        >
          <option value="Action">Action</option>
          <option value="Comedy">Comedy</option>
          <option value="Thriller">Thriller</option>
          <option value="Romance">Romance</option>
          <option value="Drama">Drama</option>
          <option value="Animation">Animation</option>
          <option value="Sci-fi">Sci-fi</option>
        </Select>

        <VStack align="start">
          <Text
            color="gray.300"
            cursor="pointer"
            onClick={() => {
              setLanguageFilter("");
              setGenreFilter("");
            }}
          >
            Clear Filters
          </Text>
          <Text fontSize="xs" color="gray.500">
            {display.length} results
          </Text>
        </VStack>
      </Box>

      {loading ? (
        <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap={6}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} height="360px" borderRadius="lg" />
          ))}
        </Grid>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap={6}>
          {display.map((m) => (
            <EventCard key={m.eventId} event={m} />
          ))}
        </Grid>
      )}
    </Box>
  );
}
