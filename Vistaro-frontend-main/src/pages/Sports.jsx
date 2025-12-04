import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Heading,
  Grid,
  Select,
  Center,
  Skeleton,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import HomeMainSlider from "../components/HomeMainSlider";
import { searchByCategory, searchBySubCategory } from "../apis/eventApi";
import EventCard from "../components/EventCard";

export default function Sports() {
  const city = useSelector((s) => s.city?.selectedCity?.city || "");
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const fetchSports = () => {
    setLoading(true);
    const apiCall = type
      ? searchBySubCategory(city, type)
      : searchByCategory(city, "SPORT");

    apiCall
      .then((res) => setSports(res.data || []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!city) return;
    fetchSports();
  }, [city, type]);

  return (
    <Box bg="gray.900" color="white" px={6} py={8} minH="100vh">
      <Box minH="320px"><HomeMainSlider /></Box>

      <Heading mb={2}>Sports in {city}</Heading>
      <Text color="gray.400" mb={6}>Watch your favorite sports live.</Text>

      {/* FILTER */}
      <Box w="260px" mb={6}>
        <Select
          placeholder="Filter by Type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          bg="gray.800"
          color="white"
           w="220px"
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
        >
          <option value="Cricket">Cricket</option>
          <option value="Football">Football</option>
          <option value="Tennis">Tennis</option>
          <option value="Basketball">Basketball</option>
        </Select>
      </Box>

      {loading ? (
        <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap={6}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} height="360px" borderRadius="lg" />
          ))}
        </Grid>
      ) : sports.length === 0 ? (
        <Center py={20}><Text>No sports events available.</Text></Center>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap={6}>
          {sports.map((s) => (
            <EventCard key={s.eventId} event={s} />
          ))}
        </Grid>
      )}
    </Box>
  );
}
