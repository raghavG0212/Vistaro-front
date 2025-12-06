// src/pages/Events.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Text,
  Heading,
  Grid,
  Center,
  Select,
  Skeleton,
} from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import HomeMainSlider from "../components/HomeMainSlider";
import EventCard from "../components/EventCard";
import { searchByCategory } from "../apis/eventApi";
import HeadingComponent from "../components/HeadingComponent";

export default function Events() {
  const navigate = useNavigate();
  const city = useSelector((s) => s.city?.selectedCity?.city || "");

  const [events, setEvents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!city) return;

    setLoading(true);
    searchByCategory(city, "EVENT")
      .then((res) => {
        setEvents(res.data || []);
        setFiltered(res.data || []);
      })
      .finally(() => setLoading(false));
  }, [city]);

  useEffect(() => {
    let arr = [...events];
    if (typeFilter)
      arr = arr.filter((e) =>
        (e.subCategory || "").toLowerCase().includes(typeFilter.toLowerCase())
      );
    setFiltered(arr);
  }, [typeFilter, events]);

  return (
    <Box bg="gray.900" color="white" px={6} py={8} minH="100vh">
      <Box minH="320px"><HomeMainSlider /></Box>

      <HeadingComponent mb={2}>Events in {city}</HeadingComponent>
      {/* //--  change done to make the heading look like home page 👆*/}
      <Text color="gray.400" mb={6}>Concerts, Standup Comedy & More</Text>

      {/* FILTER */}
      <Box w="220px" mb={6}>
        <Select
          placeholder="Filter by Type"
          bg="gray.800"
          color="white"
          value={typeFilter}
          w="220px"
          borderColor="gray.600"
          _hover={{ borderColor: "teal.300" }}
          _focus={{ borderColor: "teal.300", boxShadow: "0 0 0 1px teal" }}
          sx={{
            option: {
              background: "#1A202C",  // Dark dropdown bg
              color: "white",         // White text
              padding: "10px",
            },
          }}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="Concert">Concert</option>
          <option value="Stand up comedy">Standup Comedy</option>
          <option value="Fashion">Fashion</option>
          <option value="Food Fest">Food Fest</option>
          <option value="Exhibition">Exhibition</option>
          <option value="Cultural">Cultural</option>

        </Select>
      </Box>

      {loading ? (
        <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap={6}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} height="360px" borderRadius="lg" />
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <Center py={20}><Text>No events available.</Text></Center>
      ) : (
        <Grid templateColumns="repeat(auto-fill, minmax(260px, 1fr))" gap={2}>
          {/* change this to update the gap in the cards on the page 👆 */}
          {filtered.map((e) => (
            <EventCard key={e.eventId} event={e} />
          ))}
        </Grid>
      )}
    </Box>
  );
}
