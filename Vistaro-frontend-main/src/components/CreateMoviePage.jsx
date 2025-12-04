// src/pages/CreateMovie.jsx
import React, { useState, useEffect } from "react";
import {
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Box, Text, Input, HStack, VStack, Button, Divider,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Tag, Menu, MenuButton, MenuList, MenuItem, Badge, Icon
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";

import axios from "axios";
import { addEvent } from "../apis/eventApi";
import { addSlot } from "../apis/eventSlotApi";

// format options mapped to backend enum values
const FORMAT_OPTIONS = [
  { label: "2D", value: "_2D" },
  { label: "3D", value: "_3D" },
  { label: "4DX", value: "_4DX" },
  { label: "NA", value: "NA" }
];

export default function CreateMoviePage({ onClose }) {
  // step control for controlled accordion
  const [activeIndex, setActiveIndex] = useState(0);
  const [stepPills] = useState(["1. Basic", "2. Specific", "3. Slot & Food", "4. Finish"]);

  // Basic event fields
  const [basic, setBasic] = useState({
    title: "",
    description: "",
    subCategory: "",
    bannerUrl: "",
    thumbnailUrl: "",
    city: ""
  });

  // movie-specific fields
  const [movieSpecific, setMovieSpecific] = useState({
    director: "",
    genre: "",
    language: "",
    releaseDate: ""
  });

  // slot/food
  const [slot, setSlot] = useState({
    venueId: "",
    format: "NA", // backend mapping will be applied
    startTime: "",
    endTime: "",
    basePrice: ""
  });
  const [venueList, setVenueList] = useState([]);
  const [foodRows, setFoodRows] = useState([]); // { name, price }

  // load venues (so user can pick venue id)
  useEffect(() => {
    const load = async () => {
      try {
        const res = await axios.get("/api/v1/venue/all");
        setVenueList(res.data || []);
      } catch (e) {
        setVenueList([]);
      }
    };
    load();
  }, []);

  // helpers
  const setBasicField = (k, v) => setBasic((p) => ({ ...p, [k]: v }));
  const setMovieField = (k, v) => setMovieSpecific((p) => ({ ...p, [k]: v }));
  const setSlotField = (k, v) => setSlot((p) => ({ ...p, [k]: v }));

  const addFoodRow = () => setFoodRows((r) => [...r, { name: "", price: "" }]);
  const updateFood = (i, k, v) => setFoodRows((r) => r.map((f, idx) => idx === i ? { ...f, [k]: v } : f));
  const removeFood = (i) => setFoodRows((r) => r.filter((_, idx) => idx !== i));

  // NEXT/BACK behavior: change activeIndex (0..3)
  const next = () => setActiveIndex((i) => Math.min(3, i + 1));
  const back = () => setActiveIndex((i) => Math.max(0, i - 1));

  // Create flow: 1) create event, 2) create slot, 3) add foods for slot
  const handleCreate = async () => {
    try {
      // 1) create event (category = MOVIE)
      const eventPayload = {
        title: basic.title,
        description: basic.description,
        category: "MOVIE",
        subCategory: basic.subCategory,
        bannerUrl: basic.bannerUrl,
        thumbnailUrl: basic.thumbnailUrl,
        startTime: slot.startTime,
        endTime: slot.endTime
      };

      const evRes = await addEvent(eventPayload);
      const createdEvent = evRes.data || evRes; // sometimes axios returns data
      const eventId = createdEvent.eventId || createdEvent.eventId || (createdEvent && createdEvent.eventId);

      // 2) create slot
      const formatBackend = FORMAT_OPTIONS.find((o) => o.label === (slot.format === "NA" ? "NA" : slot.format))?.value || slot.format;
      const slotPayload = {
        eventId: eventId,
        venueId: parseInt(slot.venueId, 10),
        startTime: slot.startTime,
        endTime: slot.endTime,
        format: formatBackend,
        language: movieSpecific.language,
        basePrice: slot.basePrice ? parseFloat(slot.basePrice) : 0
      };

      const slotRes = await addSlot(slotPayload);
      const createdSlot = slotRes.data || slotRes;
      const slotId = createdSlot.slotId || createdSlot.slotId;

      // 3) add foods for this slot
      for (const f of foodRows) {
        if (!f.name) continue;
        const foodPayload = {
          slotId: slotId,
          name: f.name,
          price: f.price ? parseFloat(f.price) : 0
        };
        // POST to food endpoint
        await axios.post("/api/v1/food", foodPayload);
      }

      // success
      setActiveIndex(3);
      // optionally show message then close
      onClose();
    } catch (err) {
      console.error("Create movie failed:", err);
      alert("Something went wrong while creating movie");
    }
  };

  return (
    <>
      <ModalHeader>Create Movie</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {/* Step pills */}
        <HStack spacing={3} mb={4}>
          {stepPills.map((s, idx) => (
            <Tag key={s} size="sm" bg={idx === activeIndex ? "green.300" : "gray.700"} color={idx === activeIndex ? "black" : "white"}>
              {s}
            </Tag>
          ))}
        </HStack>

        <Divider mb={4} />

        <Accordion index={activeIndex} allowToggle>
          {/* Basic */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">Basic Event Details</Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={3} align="stretch">
                <Input placeholder="Title" bg="gray.700" value={basic.title} onChange={(e) => setBasicField("title", e.target.value)} />
                <Input placeholder="Sub Category" bg="gray.700" value={basic.subCategory} onChange={(e) => setBasicField("subCategory", e.target.value)} />
                <Input placeholder="City (e.g. Bengaluru)" bg="gray.700" value={basic.city} onChange={(e) => setBasicField("city", e.target.value)} />
                <Input placeholder="Thumbnail URL" bg="gray.700" value={basic.thumbnailUrl} onChange={(e) => setBasicField("thumbnailUrl", e.target.value)} />
                <Input placeholder="Banner URL" bg="gray.700" value={basic.bannerUrl} onChange={(e) => setBasicField("bannerUrl", e.target.value)} />
                <Input placeholder="Description" bg="gray.700" value={basic.description} onChange={(e) => setBasicField("description", e.target.value)} />
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Specific */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">Event Specific Details</Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={3} align="stretch">
                <Input placeholder="Director" bg="gray.700" value={movieSpecific.director} onChange={(e) => setMovieField("director", e.target.value)} />
                <Input placeholder="Genre" bg="gray.700" value={movieSpecific.genre} onChange={(e) => setMovieField("genre", e.target.value)} />
                <Input placeholder="Language" bg="gray.700" value={movieSpecific.language} onChange={(e) => setMovieField("language", e.target.value)} />
                <Input placeholder="Release date (YYYY-MM-DD)" bg="gray.700" value={movieSpecific.releaseDate} onChange={(e) => setMovieField("releaseDate", e.target.value)} />
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Slot & Food */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">Slot & Food</Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <HStack spacing={4}>
                  {/* Venue selection using Menu so dropdown is dark */}
                  <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="gray.700" color="white">
                      {slot.venueId ? `Venue ${slot.venueId}` : "Venue ID"}
                    </MenuButton>
                    <MenuList bg="gray.800" color="white" maxH="220px" overflowY="auto">
                      {venueList.map((v) => (
                        <MenuItem key={v.venueId} _hover={{ bg: "gray.700" }} onClick={() => setSlotField("venueId", v.venueId.toString())}>
                          {v.venueId} — {v.name} ({v.city})
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>

                  {/* Format selection */}
                  <Menu>
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} bg="gray.700" color="white">
                      {FORMAT_OPTIONS.find(o => o.value === slot.format)?.label || slot.format || "Format (NA)"}
                    </MenuButton>
                    <MenuList bg="gray.800" color="white">
                      {FORMAT_OPTIONS.map((f) => (
                        <MenuItem key={f.value} _hover={{ bg: "gray.700" }} onClick={() => setSlotField("format", f.value)}>
                          {f.label}
                        </MenuItem>
                      ))}
                    </MenuList>
                  </Menu>
                </HStack>

                <HStack spacing={4}>
                  <Input type="datetime-local" bg="gray.700" value={slot.startTime} onChange={(e) => setSlotField("startTime", e.target.value)} />
                  <Input type="datetime-local" bg="gray.700" value={slot.endTime} onChange={(e) => setSlotField("endTime", e.target.value)} />
                </HStack>

                <HStack spacing={4}>
                  <Input placeholder="Base Price" bg="gray.700" value={slot.basePrice} onChange={(e) => setSlotField("basePrice", e.target.value)} />
                  <Button onClick={addFoodRow} colorScheme="purple">Add Food</Button>
                </HStack>

                {/* food rows */}
                <VStack align="stretch">
                  {foodRows.map((f, idx) => (
                    <HStack key={idx}>
                      <Input placeholder="Food name" bg="gray.700" value={f.name} onChange={(e) => updateFood(idx, "name", e.target.value)} />
                      <Input placeholder="Price" bg="gray.700" value={f.price} onChange={(e) => updateFood(idx, "price", e.target.value)} />
                      <Button colorScheme="red" className="remove-food-btn" onClick={() => removeFood(idx)}>Remove</Button>
                    </HStack>
                  ))}
                </VStack>
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          {/* Review & Finish */}
          <AccordionItem>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">Review & Finish</Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              <Box bg="gray.700" p={4} borderRadius="md">
                <Text fontWeight="600">Quick review</Text>
                <Text>Title: {basic.title}</Text>
                <Text>City: {basic.city}</Text>
                <Text>Category: MOVIE</Text>
                <Text>Slot Venue ID: {slot.venueId}</Text>
                <HStack mt={2}>
                  {foodRows.map((f, i) => <Badge key={i} colorScheme="gray" variant="subtle">{f.name} — {f.price}</Badge>)}
                </HStack>
              </Box>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
      </ModalBody>

      <ModalFooter>
        <HStack spacing={3} w="full" justify="space-between">
          <HStack>
            <Button onClick={back} bg="gray.700">Back</Button>
            <Button onClick={next} bg="gray.700">Next</Button>
          </HStack>
          <HStack>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button colorScheme="purple" onClick={handleCreate}>Create</Button>
          </HStack>
        </HStack>
      </ModalFooter>
    </>
  );
}
