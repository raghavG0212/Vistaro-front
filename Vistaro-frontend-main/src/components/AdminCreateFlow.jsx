import React, { useState, useEffect } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, Select, Input, Textarea, VStack, HStack, Box, Text, Accordion, AccordionItem,
  AccordionButton, AccordionPanel, AccordionIcon, IconButton, NumberInput, NumberInputField,
  Stack, useToast
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import axios from "axios";
import eventSlotApi from "../apis/eventSlotApi";
import { addEvent } from "../apis/eventApi";    

export default function AdminCreateFlow({ isOpen, onClose, initialType = "", selectedCity = "" }) {
  const toast = useToast();

  // UI state:
  const [type, setType] = useState(initialType); // MOVIE | SPORT | EVENT
  const [stepOpen, setStepOpen] = useState([0]); // accordion default
  const [creating, setCreating] = useState(false);

  // Event basic form
  const [eventForm, setEventForm] = useState({
    title: "", description: "", subCategory: "", bannerUrl: "", thumbnailUrl: "",
    startTime: "", endTime: "", city: selectedCity || ""
  });

  // slots: array of { venueId, startTime, endTime, format, language, basePrice }
  const emptySlot = () => ({ venueId: "", startTime: "", endTime: "", format: "NA", language: "", basePrice: "" });
  const [slots, setSlots] = useState([ emptySlot() ]);

  // type-specific forms
  const [movieDetails, setMovieDetails] = useState({ director: "", genre: "", language: "", releaseDate: "", rating: "", trailerUrl: "" });
  const [sportDetails, setSportDetails] = useState({ sportType: "", team1: "", team2: "", matchFormat: "", venueInfo: "" });
  const [generalDetails, setGeneralDetails] = useState({ artist: "", host: "", genre: "", additionalInfo: "" });

  useEffect(() => {
    if (!isOpen) resetAll();
  }, [isOpen]);

  function resetAll() {
    setType(initialType || "");
    setEventForm({
      title: "", description: "", subCategory: "", bannerUrl: "", thumbnailUrl: "",
      startTime: "", endTime: "", city: selectedCity || ""
    });
    setSlots([ emptySlot() ]);
    setMovieDetails({ director: "", genre: "", language: "", releaseDate: "", rating: "", trailerUrl: "" });
    setSportDetails({ sportType: "", team1: "", team2: "", matchFormat: "", venueInfo: "" });
    setGeneralDetails({ artist: "", host: "", genre: "", additionalInfo: "" });
  }

  const updateEventField = (f, v) => setEventForm(prev => ({ ...prev, [f]: v }));
  const updateMovie = (f,v) => setMovieDetails(prev => ({...prev, [f]: v}));
  const updateSport = (f,v) => setSportDetails(prev => ({...prev, [f]: v}));
  const updateGeneral = (f,v) => setGeneralDetails(prev => ({...prev, [f]: v}));

  const addSlot = () => setSlots(prev => [...prev, emptySlot()]);
  const removeSlot = (i) => setSlots(prev => prev.filter((_, idx) => idx !== i));
  const updateSlot = (i, f, v) => setSlots(prev => prev.map((s, idx) => idx === i ? ({ ...s, [f]: v }) : s));

  // Create flow
  const handleCreate = async () => {
    if (!type) return toast({ status: "error", title: "Pick event type" });
    setCreating(true);
    try {
      // 1) create event
      const payload = {
        title: eventForm.title,
        description: eventForm.description,
        subCategory: eventForm.subCategory,
        bannerUrl: eventForm.bannerUrl,
        thumbnailUrl: eventForm.thumbnailUrl,
        startTime: eventForm.startTime,
        endTime: eventForm.endTime,
        category: type,
        // city is probably part of eventDto in your backend — include it if expected
        city: eventForm.city
      };

      const res = await addEvent(payload); // POST /api/v1/event
      const created = res.data;
      const eventId = created.eventId || (res.data && res.data.eventId) || (res.headers && res.headers.location && Number(res.headers.location.split("/").pop()));

      if (!eventId) {
        throw new Error("Event id not returned by backend");
      }

      // 2) create slots (sequentially)
      const createdSlots = [];
      for (const s of slots) {
        const slotPayload = {
          eventId: Number(eventId),
          venueId: s.venueId ? Number(s.venueId) : null,
          startTime: s.startTime,
          endTime: s.endTime,
          format: s.format || "NA",
          language: s.language,
          basePrice: s.basePrice ? Number(s.basePrice) : null
        };
        const slotRes = await eventSlotApi.addSlot(slotPayload);
        createdSlots.push(slotRes.data);
      }

      toast({ status: "success", title: "Event + slots created" });

      // 3) open food assign modal (parent will handle showing it) — return result
      setCreating(false);

      // We'll call an event to let parent show FoodAssignModal. Using custom event for simplicity:
      const e = new CustomEvent("vistaro:eventCreated", { detail: { eventId, slots: createdSlots }});
      window.dispatchEvent(e);

      onClose(); // close the admin create modal (big one)
    } catch (err) {
      console.error(err);
      toast({ status: "error", title: "Create failed", description: err?.message || "Server error" });
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create {type || "Event"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>

            {/* 1) Type selector */}
            <Box>
              <Text fontWeight="600" mb={2}>Event Type</Text>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option value="">Choose type</option>
                <option value="MOVIE">Movie</option>
                <option value="SPORT">Sport</option>
                <option value="EVENT">Event</option>
              </Select>
            </Box>

            <Accordion defaultIndex={[0]} allowMultiple>
              {/* 1. basic */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">Event - Basic Info</Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel>
                  <VStack spacing={3}>
                    <Input placeholder="Title" value={eventForm.title} onChange={(e)=>updateEventField("title", e.target.value)} />
                    <Textarea placeholder="Description" value={eventForm.description} onChange={(e)=>updateEventField("description", e.target.value)} />
                    <Input placeholder="Sub category" value={eventForm.subCategory} onChange={(e)=>updateEventField("subCategory", e.target.value)} />
                    <Input placeholder="Thumbnail URL" value={eventForm.thumbnailUrl} onChange={(e)=>updateEventField("thumbnailUrl", e.target.value)} />
                    <Input placeholder="Banner URL" value={eventForm.bannerUrl} onChange={(e)=>updateEventField("bannerUrl", e.target.value)} />
                    <HStack w="100%">
                      <Input type="datetime-local" placeholder="Start" value={eventForm.startTime} onChange={(e)=>updateEventField("startTime", e.target.value)} />
                      <Input type="datetime-local" placeholder="End" value={eventForm.endTime} onChange={(e)=>updateEventField("endTime", e.target.value)} />
                    </HStack>
                    <Input placeholder="City" value={eventForm.city} onChange={(e)=>updateEventField("city", e.target.value)} />
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* 2. slots */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">Event Slots</Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel>
                  <VStack spacing={4}>
                    {slots.map((s, i) => (
                      <Box key={i} border="1px solid" borderColor="gray.200" p={3} borderRadius="md" w="100%">
                        <HStack justify="space-between">
                          <Text fontWeight="600">Slot #{i+1}</Text>
                          <IconButton size="sm" icon={<DeleteIcon />} onClick={()=>removeSlot(i)} aria-label="remove" />
                        </HStack>
                        <Stack direction={["column","row"]} spacing={3} mt={3}>
                          <Input placeholder="Venue ID" value={s.venueId} onChange={(e)=>updateSlot(i, "venueId", e.target.value)} />
                          <Input type="datetime-local" placeholder="Start" value={s.startTime} onChange={(e)=>updateSlot(i, "startTime", e.target.value)} />
                          <Input type="datetime-local" placeholder="End" value={s.endTime} onChange={(e)=>updateSlot(i, "endTime", e.target.value)} />
                        </Stack>
                        <HStack mt={3}>
                          <Select value={s.format} onChange={(e)=>updateSlot(i, "format", e.target.value)}>
                            <option value="NA">NA</option>
                            <option value="TWO_D">2D</option>
                            <option value="THREE_D">3D</option>
                            <option value="IMAX">IMAX</option>
                          </Select>
                          <Input placeholder="Language" value={s.language} onChange={(e)=>updateSlot(i, "language", e.target.value)} />
                          <NumberInput min={0} value={s.basePrice} onChange={(v)=>updateSlot(i, "basePrice", v)}>
                            <NumberInputField />
                          </NumberInput>
                        </HStack>
                      </Box>
                    ))}

                    <Button leftIcon={<AddIcon />} onClick={addSlot} size="sm">Add slot</Button>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>

              {/* 3. type specific */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">Type-specific Details</Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel>
                  {type === "MOVIE" && (
                    <VStack spacing={3}>
                      <Input placeholder="Director" value={movieDetails.director} onChange={(e)=>updateMovie("director", e.target.value)} />
                      <Input placeholder="Genre" value={movieDetails.genre} onChange={(e)=>updateMovie("genre", e.target.value)} />
                      <Input placeholder="Language" value={movieDetails.language} onChange={(e)=>updateMovie("language", e.target.value)} />
                      <Input type="date" placeholder="Release Date" value={movieDetails.releaseDate} onChange={(e)=>updateMovie("releaseDate", e.target.value)} />
                      <Input placeholder="Trailer URL" value={movieDetails.trailerUrl} onChange={(e)=>updateMovie("trailerUrl", e.target.value)} />
                    </VStack>
                  )}
                  {type === "SPORT" && (
                    <VStack spacing={3}>
                      <Input placeholder="Sport Type" value={sportDetails.sportType} onChange={(e)=>updateSport("sportType", e.target.value)} />
                      <Input placeholder="Team 1" value={sportDetails.team1} onChange={(e)=>updateSport("team1", e.target.value)} />
                      <Input placeholder="Team 2" value={sportDetails.team2} onChange={(e)=>updateSport("team2", e.target.value)} />
                      <Input placeholder="Match Format" value={sportDetails.matchFormat} onChange={(e)=>updateSport("matchFormat", e.target.value)} />
                    </VStack>
                  )}
                  {type === "EVENT" && (
                    <VStack spacing={3}>
                      <Input placeholder="Artist" value={generalDetails.artist} onChange={(e)=>updateGeneral("artist", e.target.value)} />
                      <Input placeholder="Host" value={generalDetails.host} onChange={(e)=>updateGeneral("host", e.target.value)} />
                      <Input placeholder="Genre" value={generalDetails.genre} onChange={(e)=>updateGeneral("genre", e.target.value)} />
                      <Textarea placeholder="Additional info" value={generalDetails.additionalInfo} onChange={(e)=>updateGeneral("additionalInfo", e.target.value)} />
                    </VStack>
                  )}
                  {!type && <Text color="gray.500">Select event type above to see fields.</Text>}
                </AccordionPanel>
              </AccordionItem>

              {/* 4. review */}
              <AccordionItem>
                <h2>
                  <AccordionButton>
                    <Box flex="1" textAlign="left">Review & Create</Box>
                    <AccordionIcon />
                  </AccordionButton>
                </h2>
                <AccordionPanel>
                  <VStack align="stretch" spacing={3}>
                    <Box>
                      <Text fontWeight="600">Title</Text>
                      <Text>{eventForm.title}</Text>
                    </Box>
                    <Box>
                      <Text fontWeight="600">Slots</Text>
                      {slots.map((s,i)=> <Text key={i}>#{i+1} — Venue: {s.venueId} | {s.startTime} → {s.endTime}</Text>)}
                    </Box>

                    <HStack justify="end">
                      <Button colorScheme="teal" onClick={handleCreate} isLoading={creating}>Create Event & Slots</Button>
                    </HStack>
                  </VStack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
