import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box,
  Text,
  Grid,
  Select,
  Skeleton,
  VStack,
  Spinner,
} from "@chakra-ui/react";
import axios from "axios";
import { useSelector } from "react-redux";
import HomeMainSlider from "../components/HomeMainSlider";
import EventCard from "../components/EventCard";
import { searchByCategory } from "../apis/eventApi";
import HeadingComponent from "../components/HeadingComponent";

const SLOT_BASE = "/api/v1/eventslot/search/city"; // uses ?city=...

export default function Movies() {
  const city = useSelector((s) => s.city?.selectedCity?.city || "");

  const [movies, setMovies] = useState([]);
  const [display, setDisplay] = useState([]);
  const [slotLangMap, setSlotLangMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [languageFilter, setLanguageFilter] = useState("");
  const [genreFilter, setGenreFilter] = useState("");

  // dynamic language list built from slotLangMap
  const languagesAvailable = useMemo(() => {
    const set = new Set();
    Object.values(slotLangMap || {}).forEach((s) => {
      (s || "").split(",").map(x => x.trim()).filter(Boolean).forEach(x => set.add(x));
    });
    return Array.from(set).sort();
  }, [slotLangMap]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // helper to normalise language tokens
  const normalizeTokens = (raw) =>
    (raw || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => t.toLowerCase());

  // fetch movies and slots in parallel for better determinism
  const loadData = useCallback(async (cityName) => {
    setLoading(true);
    setError(null);
    setSlotLangMap({});
    setMovies([]);
    setDisplay([]);

    try {
      // parallel fetch
      const [moviesRes, slotsRes] = await Promise.all([
        searchByCategory(cityName, "MOVIE"),
        axios.get(`${SLOT_BASE}`, { params: { city: cityName } })
      ]);

      const moviesData = Array.isArray(moviesRes.data) ? moviesRes.data : [];
      const slotsData = Array.isArray(slotsRes.data) ? slotsRes.data : [];

      // build eventId -> set of languages (lowercase, trimmed, deduped)
      const map = {};
      slotsData.forEach((s) => {
        if (!s || s.eventId == null) return;
        if (!map[s.eventId]) map[s.eventId] = new Set();

        // normalize each token and store canonical form (capitalized for UI later)
        (s.language || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
          .forEach((t) => map[s.eventId].add(t));
      });

      // final map: eventId -> "Hindi, English" (title-cased preserve original case)
      const final = {};
      Object.keys(map).forEach((id) => {
        // preserve token original capitalization as appeared in slots
        final[id] = Array.from(map[id]).join(", ");
      });

      // also produce a lowercase version for reliable filtering
      const finalLower = {};
      Object.keys(map).forEach((id) => {
        finalLower[id] = Array.from(map[id]).map(x => x.toLowerCase()).join(", ");
      });


      // store lowercased map in state for filtering and full map for UI if needed
      setSlotLangMap(finalLower);

      // store movies (filter duplicates and invalid)
      const filteredMovies = moviesData.filter(m => m && m.eventId != null);
      setMovies(filteredMovies);

      // compute initial display removing events w/o slots in this city
      const onlyWithSlots = filteredMovies.filter(m => finalLower[m.eventId]);

      setDisplay(onlyWithSlots);
    } catch (err) {
      setError(err?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  // load whenever city changes
  useEffect(() => {
    if (!city) {
      setMovies([]);
      setSlotLangMap({});
      setDisplay([]);
      return;
    }
    loadData(city);
  }, [city, loadData]);

  // filtering effect — runs whenever filters or slot map or movies change
  useEffect(() => {
    if (!movies.length) {
      setDisplay([]);
      return;
    }

    // must have slot map ready (we set it when slots loaded)
    const hasSlotMap = Object.keys(slotLangMap).length > 0;

    // start from movies but keep ONLY those that have slots in this city
    let arr = movies.filter(m => slotLangMap[m.eventId]);

    // genre filter
    if (genreFilter) {
      arr = arr.filter(m =>
        (m.subCategory || "").toLowerCase().includes(genreFilter.toLowerCase())
      );
    }

    // language filter (only if user selected and slot map ready)
    if (languageFilter) {
      if (!hasSlotMap) {
        // debug - shouldn't happen due to our load sequence, but be defensive
        console.warn("Language filter applied before slot map ready");
        arr = [];
      } else {
        const target = languageFilter.toLowerCase();
        arr = arr.filter(m => {
          const langs = (slotLangMap[m.eventId] || "");
          return langs.split(",").map(t => t.trim()).some(t => t === target);
        });
      }
    }

    setDisplay(arr);
  }, [movies, slotLangMap, genreFilter, languageFilter]);

  // quick UI helpers
  if (loading) {
    return (
      <Box bg="gray.900" color="white" px={6} py={8} minH="100vh">
        <Box minH="320px"><HomeMainSlider /></Box>
        <HeadingComponent mb={2}>{`Movies in ${city}`}</HeadingComponent>
        <CenterFallback />
      </Box>
    );
  }

  if (error) {
    return (
      <Box bg="gray.900" color="white" px={6} py={8} minH="100vh">
        <Box minH="320px"><HomeMainSlider /></Box>
        <HeadingComponent mb={2}>{`Movies in ${city}`}</HeadingComponent>
        <Box color="red.300" p={4}>Error loading movies: {error}</Box>
      </Box>
    );
  }

  return (
    <Box bg="gray.900" color="white" px={6} py={8} minH="100vh">
      <Box minH="320px"><HomeMainSlider /></Box>

      <HeadingComponent mb={2}>{`Movies in ${city}`}</HeadingComponent>
      <Text color="gray.400" mb={6}>Now Showing</Text>

      {/* FILTERS */}
      <Box display="flex" gap={4} mb={6}>
        {/* language dropdown: dynamic */}
        <Select
          placeholder="Filter by Language"
          bg="gray.800"
          color="white"
          w="220px"
          value={languageFilter}
          onChange={(e) => setLanguageFilter(e.target.value)}
          borderColor="gray.600"
          _hover={{ borderColor: "teal.300" }}
          _focus={{ borderColor: "teal.300", boxShadow: "0 0 0 1px teal" }}
          sx={{
            option: {
              background: "#1A202C",    // dark dropdown
              color: "white",           // white text
              padding: "10px",
              textTransform: "capitalize",
              _hover: {
                background: "#2D3748"   // darker hover
              }
            }
          }}
        >
          <option value="">All</option>

          {languagesAvailable.map((lng) => (
            <option key={lng} value={lng.toLowerCase()}>
              {lng.charAt(0).toUpperCase() + lng.slice(1).toLowerCase()}
            </option>
          ))}
        </Select>


        {/* genre */}
        <Select
          placeholder="Filter by Genre"
          bg="gray.800"
          color="white"
          w="220px"
          value={genreFilter}
          onChange={(e) => setGenreFilter(e.target.value)}
          borderColor="gray.600"
          _hover={{ borderColor: "teal.300" }}
          _focus={{ borderColor: "teal.300", boxShadow: "0 0 0 1px teal" }}
          sx={{
            option: {
              background: "#1A202C",    // dark dropdown
              color: "white",           // white text
              padding: "10px",
              textTransform: "capitalize",
              _hover: {
                background: "#2D3748"   // darker hover
              }
            }
          }}
        >
          <option value="">All</option>
          <option value="Action">Action</option>
          <option value="Comedy">Comedy</option>
          <option value="Thriller">Thriller</option>
          <option value="Romance">Romance</option>
          <option value="Drama">Drama</option>
          <option value="Animation">Animation</option>
          <option value="Horror">Horror</option>
          <option value="Sci-Fi">Sci-Fi</option>
          <option value="Superhero">Superhero</option>
          <option value="Other">Other</option>
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

      {/* GRID */}
      {display.length === 0 ? (
        <Box>
          <Text color="gray.400" mt={6}>No results.</Text>
        </Box>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap={2}>
          {display.map((m) => (
            <EventCard key={m.eventId} event={m} />
          ))}
        </Grid>
      )}
    </Box>
  );
}

// small helper component used during loading
function CenterFallback() {
  return (
    <Box py={12} textAlign="center">
      <Spinner color="teal.300" size="lg" />
      <Text mt={3} color="gray.300">Loading movies...</Text>
    </Box>
  );
}


