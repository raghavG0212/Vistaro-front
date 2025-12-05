import React, { useEffect, useState, useMemo } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  IconButton,
  Divider,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import { useSelector } from "react-redux";
import axios from "axios";

// ---- APIs you already have ----
// Event: POST /api/v1/event
// Movie: POST /api/v1/movie
// Sport: POST /api/v1/sport
// General: POST /api/v1/generaleventdetails (I'm assuming this as base; adjust path)
// Slot: POST /api/v1/eventslot
// Food: POST /api/v1/food
// Venue: /api/v1/venue/search/city, /search/name, /search/type, /search/screen

const EVENT_API = "/api/v1/event";
const MOVIE_API = "/api/v1/movie";
const SPORT_API = "/api/v1/sport";
const GENERAL_API = "/api/v1/event-details";
const SLOT_API = "/api/v1/eventslot";
const FOOD_API = "/api/v1/food";
const VENUE_API = "/api/v1/venue";

const emptySlot = () => ({
  venueId: "",
  venueName: "",
  startTime: "",
  endTime: "",
  format: "NA", // NA | _2D | _3D | _4DX
  language: "",
  basePrice: "",
  foods: [], // [{ name, price }]
});

export default function AdminEventCreateModal({ isOpen, onClose }) {
  const toast = useToast();
  const selectedCity = useSelector(
    (state) => state.city?.selectedCity?.city || ""
  );

  // ------------ Global state ------------
  const [activeStep, setActiveStep] = useState(0); // 0: basic, 1: slots, 2: type, 3: review
  const [creating, setCreating] = useState(false);

  // Event type: MOVIE | SPORT | EVENT
  const [eventType, setEventType] = useState("");

  // Basic event form (matches Event table)
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    subCategory: "",
    bannerUrl: "",
    thumbnailUrl: "",
    startTime: "",
    endTime: "",
  });

  // Slots with inline foods
  const [slots, setSlots] = useState([emptySlot()]);

  // Type-specific forms
  const [movieDetails, setMovieDetails] = useState({
    director: "",
    genre: "",
    language: "",
    releaseDate: "",
    trailerUrl: "",
    castInput: "", // "Actor1, Actor2"
  });

  const [sportDetails, setSportDetails] = useState({
    sportType: "",
    team1: "",
    team2: "",
    matchFormat: "",
    venueInfo: "",
  });

  const [generalDetails, setGeneralDetails] = useState({
    artist: "",
    host: "",
    genre: "",
    additionalInfo: "",
  });

  // Venues
  const [venues, setVenues] = useState([]);
  const [venueNameFilter, setVenueNameFilter] = useState("");
  const [venueTypeFilter, setVenueTypeFilter] = useState("");
  const [venueScreenFilter, setVenueScreenFilter] = useState("");

  // ------------ Reset when modal closes ------------
  useEffect(() => {
    if (!isOpen) {
      resetAll();
    } else {
      // when opened, fetch venues for current city
      fetchVenues();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const resetAll = () => {
    setActiveStep(0);
    setCreating(false);
    setEventType("");
    setEventForm({
      title: "",
      description: "",
      subCategory: "",
      bannerUrl: "",
      thumbnailUrl: "",
      startTime: "",
      endTime: "",
    });
    setSlots([emptySlot()]);
    setMovieDetails({
      director: "",
      genre: "",
      language: "",
      releaseDate: "",
      trailerUrl: "",
      castInput: "",
    });
    setSportDetails({
      sportType: "",
      team1: "",
      team2: "",
      matchFormat: "",
      venueInfo: "",
    });
    setGeneralDetails({
      artist: "",
      host: "",
      genre: "",
      additionalInfo: "",
    });
    setVenueNameFilter("");
    setVenueTypeFilter("");
    setVenueScreenFilter("");
  };

  // ------------ Venues (using your venue APIs) ------------
  const fetchVenues = async () => {
    try {
      let res;
      if (selectedCity) {
        res = await axios.get(`${VENUE_API}/search/city`, {
          params: { city: selectedCity },
        });
      } else {
        res = await axios.get(`${VENUE_API}/all`);
      }
      setVenues(res.data || []);
    } catch (err) {
      console.error(err);
      toast({
        status: "error",
        title: "Failed to load venues",
        description: "Please try again.",
      });
    }
  };

  const filteredVenues = useMemo(() => {
    return (venues || []).filter((v) => {
      let ok = true;

      if (venueNameFilter) {
        ok =
          ok &&
          (v.name || "")
            .toLowerCase()
            .includes(venueNameFilter.toLowerCase());
      }
      if (venueTypeFilter) {
        ok = ok && v.venueType === venueTypeFilter;
      }
      if (venueScreenFilter) {
        ok =
          ok &&
          (v.screenName || "")
            .toLowerCase()
            .includes(venueScreenFilter.toLowerCase());
      }
      return ok;
    });
  }, [venues, venueNameFilter, venueTypeFilter, venueScreenFilter]);

  // ------------ Helpers for form updates ------------
  const updateEventField = (field, value) =>
    setEventForm((prev) => ({ ...prev, [field]: value }));

  const updateMovieField = (field, value) =>
    setMovieDetails((prev) => ({ ...prev, [field]: value }));

  const updateSportField = (field, value) =>
    setSportDetails((prev) => ({ ...prev, [field]: value }));

  const updateGeneralField = (field, value) =>
    setGeneralDetails((prev) => ({ ...prev, [field]: value }));

  const addSlot = () => setSlots((prev) => [...prev, emptySlot()]);
  const removeSlot = (index) =>
    setSlots((prev) => prev.filter((_, i) => i !== index));

  const updateSlotField = (index, field, value) =>
    setSlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );

  // Food within slot
  const addFoodToSlot = (slotIndex, name, price) => {
    if (!name.trim() || !price) return;
    setSlots((prev) =>
      prev.map((s, i) =>
        i === slotIndex
          ? { ...s, foods: [...(s.foods || []), { name: name.trim(), price }] }
          : s
      )
    );
  };

  const removeFoodFromSlot = (slotIndex, foodIndex) => {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === slotIndex
          ? {
            ...s,
            foods: (s.foods || []).filter((_, fi) => fi !== foodIndex),
          }
          : s
      )
    );
  };

  // ------------ Validation & step navigation ------------
  const validateBasicInfo = () => {
    if (!eventType) {
      toast({ status: "error", title: "Select event type (Movie/Sport/Event)" });
      return false;
    }
    if (!eventForm.title.trim()) {
      toast({ status: "error", title: "Title is required" });
      return false;
    }
    if (!eventForm.startTime || !eventForm.endTime) {
      toast({ status: "error", title: "Start and end time are required" });
      return false;
    }
    if (new Date(eventForm.startTime) >= new Date(eventForm.endTime)) {
      toast({
        status: "error",
        title: "Event start time must be before end time",
      });
      return false;
    }
    return true;
  };

  const validateSlots = () => {
    if (!slots.length) {
      toast({ status: "error", title: "Add at least one slot" });
      return false;
    }
    for (const [idx, s] of slots.entries()) {
      if (!s.venueId) {
        toast({
          status: "error",
          title: `Select a venue for Slot #${idx + 1}`,
        });
        return false;
      }
      if (!s.startTime || !s.endTime) {
        toast({
          status: "error",
          title: `Start & end time are required for Slot #${idx + 1}`,
        });
        return false;
      }
      if (new Date(s.startTime) >= new Date(s.endTime)) {
        toast({
          status: "error",
          title: `Start time must be before end time for Slot #${idx + 1}`,
        });
        return false;
      }
      if (!s.language.trim()) {
        toast({
          status: "error",
          title: `Language is required for Slot #${idx + 1}`,
        });
        return false;
      }
      if (!s.basePrice || Number(s.basePrice) <= 0) {
        toast({
          status: "error",
          title: `Base price must be > 0 for Slot #${idx + 1}`,
        });
        return false;
      }
    }
    return true;
  };

  const validateTypeDetails = () => {
    if (eventType === "MOVIE") {
      if (
        !movieDetails.director.trim() ||
        !movieDetails.genre.trim() ||
        !movieDetails.language.trim()
      ) {
        toast({
          status: "error",
          title: "Director, genre and language are required for Movie",
        });
        return false;
      }
    } else if (eventType === "SPORT") {
      if (
        !sportDetails.sportType.trim() ||
        !sportDetails.team1.trim() ||
        !sportDetails.team2.trim()
      ) {
        toast({
          status: "error",
          title: "Sport type, team 1 and team 2 are required",
        });
        return false;
      }
    } else if (eventType === "EVENT") {
      if (!generalDetails.artist.trim() || !generalDetails.genre.trim()) {
        toast({
          status: "error",
          title: "Artist and genre are required for Event",
        });
        return false;
      }
    }
    return true;
  };

  const goToNext = (step) => setActiveStep(step);
  const goToStep = (index) => {
    // lock going to next steps if previous invalid
    if (index === 0) {
      setActiveStep(0);
    } else if (index === 1) {
      if (validateBasicInfo()) setActiveStep(1);
    } else if (index === 2) {
      if (validateBasicInfo() && validateSlots()) setActiveStep(2);
    } else if (index === 3) {
      if (validateBasicInfo() && validateSlots() && validateTypeDetails())
        setActiveStep(3);
    }
  };

  // ------------ Create Event Flow ------------
  const handleCreate = async () => {
    if (
      !validateBasicInfo() ||
      !validateSlots() ||
      !validateTypeDetails()
    ) {
      return;
    }

    try {
      setCreating(true);

      // 1) Create Event
      const eventPayload = {
        title: eventForm.title.trim(),
        description: eventForm.description || null,
        category: eventType,
        subCategory: eventForm.subCategory || null,
        bannerUrl: eventForm.bannerUrl || null,
        thumbnailUrl: eventForm.thumbnailUrl || null,
        startTime: eventForm.startTime,
        endTime: eventForm.endTime,
      };

      const eventRes = await axios.post(EVENT_API, eventPayload);
      const createdEvent = eventRes.data;
      const eventId = createdEvent?.eventId;

      if (!eventId) {
        throw new Error("Event ID not returned from backend");
      }

      // 2) Create Slots
      const createdSlots = [];
      for (const s of slots) {
        const slotPayload = {
          eventId,
          venueId: Number(s.venueId),
          startTime: s.startTime,
          endTime: s.endTime,
          format: s.format || "NA", // NA, _2D, _3D, _4DX
          language: s.language,
          basePrice: Number(s.basePrice),
        };
        const slotRes = await axios.post(SLOT_API, slotPayload);
        createdSlots.push(slotRes.data);
      }

      // 3) Create Type-specific Details
      if (eventType === "MOVIE") {
        const castArray = movieDetails.castInput
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean);

        const moviePayload = {
          eventId,
          castJson: castArray, // backend has Object; this is fine
          director: movieDetails.director,
          genre: movieDetails.genre,
          language: movieDetails.language,
          trailerUrl: movieDetails.trailerUrl || null,
          releaseDate: movieDetails.releaseDate || null,
        };
        await axios.post(MOVIE_API, moviePayload);
      } else if (eventType === "SPORT") {
        const sportPayload = {
          eventId,
          sportType: sportDetails.sportType,
          team1: sportDetails.team1,
          team2: sportDetails.team2,
          matchFormat: sportDetails.matchFormat || null,
          venueInfo: sportDetails.venueInfo || null,
          startTime: eventForm.startTime,
          endTime: eventForm.endTime,
        };
        await axios.post(SPORT_API, sportPayload);
      } else if (eventType === "EVENT") {
        const generalPayload = {
          eventId,
          artist: generalDetails.artist,
          host: generalDetails.host || null,
          genre: generalDetails.genre,
          additionalInfo: generalDetails.additionalInfo || null,
          startTime: eventForm.startTime,
          endTime: eventForm.endTime,
        };
        await axios.post(GENERAL_API, generalPayload);
      }

      // 4) Create food per slot
      for (let i = 0; i < slots.length; i++) {
        const slotDef = slots[i];
        const slotCreated = createdSlots[i];
        if (!slotCreated || !slotDef.foods || !slotDef.foods.length) continue;

        for (const f of slotDef.foods) {
          const foodPayload = {
            slotId: slotCreated.slotId,
            name: f.name,
            price: Number(f.price),
          };
          await axios.post(FOOD_API, foodPayload);
        }
      }

      toast({
        status: "success",
        title: "Event created successfully",
        description: "Event, slots, details & food saved.",
      });
      onClose();
    } catch (err) {
      console.error(err);
      toast({
        status: "error",
        title: "Create failed",
        description:
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Server error",
      });
    } finally {
      setCreating(false);
    }
  };

  // ------------ UI helpers ------------
  const formatLabel = (f) => {
    if (!f || f === "NA") return "NA";
    if (f === "_2D") return "2D";
    if (f === "_3D") return "3D";
    if (f === "_4DX") return "4DX";
    return f;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      isCentered
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent bg="#020617" color="gray.100" borderRadius="2xl">
        <ModalHeader borderBottom="1px solid" borderColor="gray.700">
          <HStack justify="space-between">
            <Box>
              <Text fontSize="lg" fontWeight="bold">
                Create New Event
              </Text>
              <Text fontSize="xs" color="gray.400">
                Add base event, slots, food & type-specific details
              </Text>
            </Box>
            {eventType && (
              <Badge
                colorScheme={
                  eventType === "MOVIE"
                    ? "purple"
                    : eventType === "SPORT"
                      ? "orange"
                      : "teal"
                }
                fontSize="0.8rem"
                px={3}
                py={1}
                borderRadius="full"
              >
                {eventType}
              </Badge>
            )}
          </HStack>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody py={4}>
          <Accordion index={activeStep} onChange={goToStep} allowToggle={false}>
            {/* STEP 0: BASIC INFO */}
            <AccordionItem border="none">
              <h2>
                <AccordionButton
                  _expanded={{ bg: "gray.800" }}
                  _hover={{ bg: "gray.900" }}
                >
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold">1. Basic Event Info</Text>
                    <Text fontSize="xs" color="gray.400">
                      Title, description, timings & type
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pt={4} pb={6}>
                <VStack align="stretch" spacing={3}>
                  <HStack spacing={3} align="flex-start">
                    <Box flex="3">
                      <Text fontSize="sm" mb={1}>
                        Event Type <span style={{ color: "#f97373" }}>*</span>
                      </Text>
                      <Select
                        value={eventType}
                        onChange={(e) => setEventType(e.target.value)}
                        bg="gray.900"
                        borderColor="gray.700"
                        _hover={{ borderColor: "teal.400" }}
                      >
                        <option value="" style={{ background: "#020617" }}>
                          Select type
                        </option>
                        <option value="MOVIE" style={{ background: "#020617" }}>
                          Movie
                        </option>
                        <option value="SPORT" style={{ background: "#020617" }}>
                          Sport
                        </option>
                        <option value="EVENT" style={{ background: "#020617" }}>
                          Event
                        </option>
                      </Select>
                    </Box>
                    <Box flex="5">
                      <Text fontSize="sm" mb={1}>
                        Title <span style={{ color: "#f97373" }}>*</span>
                      </Text>
                      <Input
                        bg="gray.900"
                        borderColor="gray.700"
                        _hover={{ borderColor: "teal.400" }}
                        placeholder="e.g. Avengers: Endgame"
                        value={eventForm.title}
                        onChange={(e) =>
                          updateEventField("title", e.target.value)
                        }
                      />
                    </Box>
                  </HStack>

                  <Box>
                    <Text fontSize="sm" mb={1}>
                      Description
                    </Text>
                    <Textarea
                      bg="gray.900"
                      borderColor="gray.700"
                      _hover={{ borderColor: "teal.400" }}
                      placeholder="Short description of the event"
                      value={eventForm.description}
                      onChange={(e) =>
                        updateEventField("description", e.target.value)
                      }
                    />
                  </Box>

                  <HStack spacing={3}>
                    <Box flex="1">
                      <Text fontSize="sm" mb={1}>
                        Sub Category (optional)
                      </Text>
                      <Input
                        bg="gray.900"
                        borderColor="gray.700"
                        _hover={{ borderColor: "teal.400" }}
                        placeholder={
                          eventType === "MOVIE"
                            ? "e.g. Action, Thriller"
                            : eventType === "SPORT"
                              ? "e.g. League, Final"
                              : "e.g. Stand up comedy"
                        }
                        value={eventForm.subCategory}
                        onChange={(e) =>
                          updateEventField("subCategory", e.target.value)
                        }
                      />
                    </Box>
                    <Box flex="1">
                      <Text fontSize="sm" mb={1}>
                        Thumbnail URL
                      </Text>
                      <Input
                        bg="gray.900"
                        borderColor="gray.700"
                        _hover={{ borderColor: "teal.400" }}
                        placeholder="Small poster"
                        value={eventForm.thumbnailUrl}
                        onChange={(e) =>
                          updateEventField("thumbnailUrl", e.target.value)
                        }
                      />
                    </Box>
                    <Box flex="1">
                      <Text fontSize="sm" mb={1}>
                        Banner URL
                      </Text>
                      <Input
                        bg="gray.900"
                        borderColor="gray.700"
                        _hover={{ borderColor: "teal.400" }}
                        placeholder="Wide banner"
                        value={eventForm.bannerUrl}
                        onChange={(e) =>
                          updateEventField("bannerUrl", e.target.value)
                        }
                      />
                    </Box>
                  </HStack>

                  <HStack spacing={3}>
                    <Box flex="1">
                      <Text fontSize="sm" mb={1}>
                        Event Start <span style={{ color: "#f97373" }}>*</span>
                      </Text>
                      <Input
                        type="datetime-local"
                        bg="gray.900"
                        borderColor="gray.700"
                        _hover={{ borderColor: "teal.400" }}
                        value={eventForm.startTime}
                        onChange={(e) =>
                          updateEventField("startTime", e.target.value)
                        }
                      />
                    </Box>
                    <Box flex="1">
                      <Text fontSize="sm" mb={1}>
                        Event End <span style={{ color: "#f97373" }}>*</span>
                      </Text>
                      <Input
                        type="datetime-local"
                        bg="gray.900"
                        borderColor="gray.700"
                        _hover={{ borderColor: "teal.400" }}
                        value={eventForm.endTime}
                        onChange={(e) =>
                          updateEventField("endTime", e.target.value)
                        }
                      />
                    </Box>
                  </HStack>

                  <HStack justify="flex-end" pt={3}>
                    <Button
                      colorScheme="teal"
                      onClick={() => {
                        if (validateBasicInfo()) goToNext(1);
                      }}
                    >
                      Save & Continue to Slots
                    </Button>
                  </HStack>
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            {/* STEP 1: SLOTS + FOOD */}
            <AccordionItem isDisabled={!eventType}>
              <h2>
                <AccordionButton
                  _expanded={{ bg: "gray.800" }}
                  _hover={{ bg: "gray.900" }}
                >
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold">2. Event Slots & Food</Text>
                    <Text fontSize="xs" color="gray.400">
                      Choose venue, show timings, ticket base price & food
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pt={4} pb={6}>
                <VStack align="stretch" spacing={4}>
                  {/* Venue filters */}
                  <Box>
                    <Text fontSize="sm" mb={2} color="gray.300">
                      Filter venues (current city:{" "}
                      <b>{selectedCity || "All"}</b>)
                    </Text>
                    <HStack spacing={3}>
                      <Input
                        placeholder="Search by name"
                        bg="gray.900"
                        borderColor="gray.700"
                        _hover={{ borderColor: "teal.400" }}
                        value={venueNameFilter}
                        onChange={(e) => setVenueNameFilter(e.target.value)}
                      />
                      <Select
                        placeholder="Venue type"
                        bg="gray.900"
                        borderColor="gray.700"
                        _hover={{ borderColor: "teal.400" }}
                        value={venueTypeFilter}
                        onChange={(e) => setVenueTypeFilter(e.target.value)}
                      >
                        <option value="CINEMA" style={{ background: "#020617" }}>
                          CINEMA
                        </option>
                        <option value="STADIUM" style={{ background: "#020617" }}>
                          STADIUM
                        </option>
                        <option value="AUDITORIUM" style={{ background: "#020617" }}>
                          AUDITORIUM
                        </option>
                      </Select>
                      <Input
                        placeholder="Screen name"
                        bg="gray.900"
                        borderColor="gray.700"
                        _hover={{ borderColor: "teal.400" }}
                        value={venueScreenFilter}
                        onChange={(e) => setVenueScreenFilter(e.target.value)}
                      />
                    </HStack>
                  </Box>

                  {slots.map((slot, idx) => (
                    <Box
                      key={idx}
                      border="1px solid"
                      borderColor="gray.700"
                      borderRadius="xl"
                      p={4}
                      bg="gray.900"
                    >
                      <HStack justify="space-between" mb={3}>
                        <HStack spacing={3}>
                          <Text fontWeight="bold" fontSize="md">
                            Slot #{idx + 1}
                          </Text>
                          {slot.venueName && (
                            <Badge colorScheme="teal" fontSize="0.7rem">
                              {slot.venueName}
                            </Badge>
                          )}
                        </HStack>
                        {slots.length > 1 && (
                          <IconButton
                            size="sm"
                            aria-label="Remove slot"
                            icon={<DeleteIcon />}
                            onClick={() => removeSlot(idx)}
                            variant="ghost"
                            colorScheme="red"
                          />
                        )}
                      </HStack>

                      <VStack align="stretch" spacing={3}>
                        {/* Venue select */}
                        <Box>
                          <Text fontSize="sm" mb={1}>
                            Venue <span style={{ color: "#f97373" }}>*</span>
                          </Text>
                          <Select
                            bg="gray.950"
                            borderColor="gray.700"
                            _hover={{ borderColor: "teal.400" }}
                            value={slot.venueId}
                            onChange={(e) => {
                              const vId = e.target.value;
                              const v = venues.find(
                                (vv) => String(vv.venueId) === vId
                              );
                              updateSlotField(idx, "venueId", vId);
                              updateSlotField(
                                idx,
                                "venueName",
                                v
                                  ? `${v.name} • ${v.screenName || ""}`.trim()
                                  : ""
                              );
                            }}
                          >
                            <option value="" style={{ background: "#020617" }}>
                              Select venue
                            </option>
                            {filteredVenues.map((v) => (
                              <option
                                key={v.venueId}
                                value={v.venueId}
                                style={{ background: "#020617" }}
                              >
                                {v.name} • {v.screenName} • {v.city}
                              </option>
                            ))}
                          </Select>
                        </Box>

                        <HStack spacing={3}>
                          <Box flex="1">
                            <Text fontSize="sm" mb={1}>
                              Show start <span style={{ color: "#f97373" }}>*</span>
                            </Text>
                            <Input
                              type="datetime-local"
                              bg="gray.950"
                              borderColor="gray.700"
                              _hover={{ borderColor: "teal.400" }}
                              value={slot.startTime}
                              onChange={(e) =>
                                updateSlotField(idx, "startTime", e.target.value)
                              }
                            />
                          </Box>
                          <Box flex="1">
                            <Text fontSize="sm" mb={1}>
                              Show end <span style={{ color: "#f97373" }}>*</span>
                            </Text>
                            <Input
                              type="datetime-local"
                              bg="gray.950"
                              borderColor="gray.700"
                              _hover={{ borderColor: "teal.400" }}
                              value={slot.endTime}
                              onChange={(e) =>
                                updateSlotField(idx, "endTime", e.target.value)
                              }
                            />
                          </Box>
                        </HStack>

                        <HStack spacing={3}>
                          <Box flex="1">
                            <Text fontSize="sm" mb={1}>
                              Format
                            </Text>
                            <Select
                              bg="gray.950"
                              borderColor="gray.700"
                              _hover={{ borderColor: "teal.400" }}
                              value={slot.format}
                              onChange={(e) =>
                                updateSlotField(idx, "format", e.target.value)
                              }
                            >
                              <option value="NA" style={{ background: "#020617" }}>
                                NA
                              </option>
                              <option value="_2D" style={{ background: "#020617" }}>
                                2D
                              </option>
                              <option value="_3D" style={{ background: "#020617" }}>
                                3D
                              </option>
                              <option value="_4DX" style={{ background: "#020617" }}>
                                4DX
                              </option>
                            </Select>
                          </Box>
                          <Box flex="1">
                            <Text fontSize="sm" mb={1}>
                              Language <span style={{ color: "#f97373" }}>*</span>
                            </Text>
                            <Input
                              bg="gray.950"
                              borderColor="gray.700"
                              _hover={{ borderColor: "teal.400" }}
                              placeholder="e.g. Hindi, English"
                              value={slot.language}
                              onChange={(e) =>
                                updateSlotField(idx, "language", e.target.value)
                              }
                            />
                          </Box>
                          <Box flex="1">
                            <Text fontSize="sm" mb={1}>
                              Base Price (₹) <span style={{ color: "#f97373" }}>*</span>
                            </Text>
                            <NumberInput
                              min={1}
                              value={slot.basePrice}
                              onChange={(v) =>
                                updateSlotField(idx, "basePrice", v || "")
                              }
                            >
                              <NumberInputField
                                bg="gray.950"
                                borderColor="gray.700"
                                _hover={{ borderColor: "teal.400" }}
                              />
                            </NumberInput>
                          </Box>
                        </HStack>

                        {/* Food per slot */}
                        <Box mt={3} pt={3} borderTop="1px dashed" borderColor="gray.700">
                          <Text fontSize="sm" mb={2}>
                            Food & Beverages for this slot (optional)
                          </Text>

                          <HStack spacing={3} mb={2}>
                            <Input
                              placeholder="Food name e.g. Popcorn"
                              bg="gray.950"
                              borderColor="gray.700"
                              _hover={{ borderColor: "teal.400" }}
                              value={slot.newFoodName || ""}
                              onChange={(e) =>
                                updateSlotField(idx, "newFoodName", e.target.value)
                              }
                            />
                            <NumberInput
                              min={1}
                              value={slot.newFoodPrice || ""}
                              onChange={(v) =>
                                updateSlotField(idx, "newFoodPrice", v || "")
                              }
                            >
                              <NumberInputField
                                bg="gray.950"
                                borderColor="gray.700"
                                _hover={{ borderColor: "teal.400" }}
                                placeholder="Price (₹)"
                              />
                            </NumberInput>
                            <Button
                              size="sm"
                              leftIcon={<AddIcon />}
                              colorScheme="teal"
                              onClick={() => {
                                addFoodToSlot(
                                  idx,
                                  slot.newFoodName || "",
                                  slot.newFoodPrice || ""
                                );
                                updateSlotField(idx, "newFoodName", "");
                                updateSlotField(idx, "newFoodPrice", "");
                              }}
                            >
                              Add
                            </Button>
                          </HStack>

                          <VStack align="stretch" spacing={1}>
                            {(slot.foods || []).map((f, fi) => (
                              <HStack
                                key={fi}
                                justify="space-between"
                                fontSize="sm"
                                border="1px solid"
                                borderColor="gray.700"
                                borderRadius="md"
                                px={3}
                                py={1}
                              >
                                <Text>
                                  {f.name} • ₹{f.price}
                                </Text>
                                <IconButton
                                  size="xs"
                                  aria-label="Delete food"
                                  icon={<DeleteIcon />}
                                  variant="ghost"
                                  colorScheme="red"
                                  onClick={() => removeFoodFromSlot(idx, fi)}
                                />
                              </HStack>
                            ))}
                          </VStack>
                        </Box>
                      </VStack>
                    </Box>
                  ))}

                  <HStack justify="space-between" pt={2}>
                    <Button
                      size="sm"
                      leftIcon={<AddIcon />}
                      onClick={addSlot}
                      variant="outline"
                      borderColor="teal.400"
                    >
                      Add another slot
                    </Button>
                    <Button
                      colorScheme="teal"
                      onClick={() => {
                        if (validateSlots()) goToNext(2);
                      }}
                    >
                      Save & Continue to Details
                    </Button>
                  </HStack>
                </VStack>
              </AccordionPanel>
            </AccordionItem>

            {/* STEP 2: TYPE-SPECIFIC DETAILS */}
            <AccordionItem isDisabled={!eventType}>
              <h2>
                <AccordionButton
                  _expanded={{ bg: "gray.800" }}
                  _hover={{ bg: "gray.900" }}
                >
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold">3. Type-specific Details</Text>
                    <Text fontSize="xs" color="gray.400">
                      Movie, Sport or Event specific fields
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pt={4} pb={6}>
                {eventType === "MOVIE" && (
                  <VStack align="stretch" spacing={3}>
                    <HStack spacing={3}>
                      <Box flex="1">
                        <Text fontSize="sm" mb={1}>
                          Director <span style={{ color: "#f97373" }}>*</span>
                        </Text>
                        <Input
                          bg="gray.900"
                          borderColor="gray.700"
                          _hover={{ borderColor: "teal.400" }}
                          value={movieDetails.director}
                          onChange={(e) =>
                            updateMovieField("director", e.target.value)
                          }
                        />
                      </Box>
                      <Box flex="1">
                        <Text fontSize="sm" mb={1}>
                          Genre <span style={{ color: "#f97373" }}>*</span>
                        </Text>
                        <Input
                          bg="gray.900"
                          borderColor="gray.700"
                          _hover={{ borderColor: "teal.400" }}
                          placeholder="Action, Thriller..."
                          value={movieDetails.genre}
                          onChange={(e) =>
                            updateMovieField("genre", e.target.value)
                          }
                        />
                      </Box>
                      <Box flex="1">
                        <Text fontSize="sm" mb={1}>
                          Language <span style={{ color: "#f97373" }}>*</span>
                        </Text>
                        <Input
                          bg="gray.900"
                          borderColor="gray.700"
                          _hover={{ borderColor: "teal.400" }}
                          value={movieDetails.language}
                          onChange={(e) =>
                            updateMovieField("language", e.target.value)
                          }
                        />
                      </Box>
                    </HStack>

                    <HStack spacing={3}>
                      <Box flex="1">
                        <Text fontSize="sm" mb={1}>
                          Release Date
                        </Text>
                        <Input
                          type="date"
                          bg="gray.900"
                          borderColor="gray.700"
                          _hover={{ borderColor: "teal.400" }}
                          value={movieDetails.releaseDate}
                          onChange={(e) =>
                            updateMovieField("releaseDate", e.target.value)
                          }
                        />
                      </Box>
                      <Box flex="2">
                        <Text fontSize="sm" mb={1}>
                          Trailer URL
                        </Text>
                        <Input
                          bg="gray.900"
                          borderColor="gray.700"
                          _hover={{ borderColor: "teal.400" }}
                          value={movieDetails.trailerUrl}
                          onChange={(e) =>
                            updateMovieField("trailerUrl", e.target.value)
                          }
                        />
                      </Box>
                    </HStack>

                    <Box>
                      <Text fontSize="sm" mb={1}>
                        Cast (comma separated)
                      </Text>
                      <Input
                        bg="gray.900"
                        borderColor="gray.700"
                        _hover={{ borderColor: "teal.400" }}
                        placeholder="Actor 1, Actor 2, Actor 3"
                        value={movieDetails.castInput}
                        onChange={(e) =>
                          updateMovieField("castInput", e.target.value)
                        }
                      />
                      <Text fontSize="xs" color="gray.500" mt={1}>
                        This will be stored as an array in <code>castJson</code>.
                      </Text>
                    </Box>
                  </VStack>
                )}

                {eventType === "SPORT" && (
                  <VStack align="stretch" spacing={3}>
                    <HStack spacing={3}>
                      <Box flex="1">
                        <Text fontSize="sm" mb={1}>
                          Sport Type <span style={{ color: "#f97373" }}>*</span>
                        </Text>
                        <Input
                          bg="gray.900"
                          borderColor="gray.700"
                          _hover={{ borderColor: "teal.400" }}
                          placeholder="e.g. Cricket, Football"
                          value={sportDetails.sportType}
                          onChange={(e) =>
                            updateSportField("sportType", e.target.value)
                          }
                        />
                      </Box>
                      <Box flex="1">
                        <Text fontSize="sm" mb={1}>
                          Team 1 <span style={{ color: "#f97373" }}>*</span>
                        </Text>
                        <Input
                          bg="gray.900"
                          borderColor="gray.700"
                          _hover={{ borderColor: "teal.400" }}
                          value={sportDetails.team1}
                          onChange={(e) =>
                            updateSportField("team1", e.target.value)
                          }
                        />
                      </Box>
                      <Box flex="1">
                        <Text fontSize="sm" mb={1}>
                          Team 2 <span style={{ color: "#f97373" }}>*</span>
                        </Text>
                        <Input
                          bg="gray.900"
                          borderColor="gray.700"
                          _hover={{ borderColor: "teal.400" }}
                          value={sportDetails.team2}
                          onChange={(e) =>
                            updateSportField("team2", e.target.value)
                          }
                        />
                      </Box>
                    </HStack>

                    <HStack spacing={3}>
                      <Box flex="1">
                        <Text fontSize="sm" mb={1}>
                          Match Format
                        </Text>
                        <Input
                          bg="gray.900"
                          borderColor="gray.700"
                          _hover={{ borderColor: "teal.400" }}
                          placeholder="T20, ODI, Test..."
                          value={sportDetails.matchFormat}
                          onChange={(e) =>
                            updateSportField("matchFormat", e.target.value)
                          }
                        />
                      </Box>
                      <Box flex="2">
                        <Text fontSize="sm" mb={1}>
                          Venue Info
                        </Text>
                        <Input
                          bg="gray.900"
                          borderColor="gray.700"
                          _hover={{ borderColor: "teal.400" }}
                          placeholder="Optional note about ground / stadium"
                          value={sportDetails.venueInfo}
                          onChange={(e) =>
                            updateSportField("venueInfo", e.target.value)
                          }
                        />
                      </Box>
                    </HStack>
                  </VStack>
                )}

                {eventType === "EVENT" && (
                  <VStack align="stretch" spacing={3}>
                    <HStack spacing={3}>
                      <Box flex="1">
                        <Text fontSize="sm" mb={1}>
                          Artist <span style={{ color: "#f97373" }}>*</span>
                        </Text>
                        <Input
                          bg="gray.900"
                          borderColor="gray.700"
                          _hover={{ borderColor: "teal.400" }}
                          placeholder="Performer / Band"
                          value={generalDetails.artist}
                          onChange={(e) =>
                            updateGeneralField("artist", e.target.value)
                          }
                        />
                      </Box>
                      <Box flex="1">
                        <Text fontSize="sm" mb={1}>
                          Host
                        </Text>
                        <Input
                          bg="gray.900"
                          borderColor="gray.700"
                          _hover={{ borderColor: "teal.400" }}
                          placeholder="Emcee / Host (optional)"
                          value={generalDetails.host}
                          onChange={(e) =>
                            updateGeneralField("host", e.target.value)
                          }
                        />
                      </Box>
                      <Box flex="1">
                        <Text fontSize="sm" mb={1}>
                          Genre <span style={{ color: "#f97373" }}>*</span>
                        </Text>
                        <Input
                          bg="gray.900"
                          borderColor="gray.700"
                          _hover={{ borderColor: "teal.400" }}
                          placeholder="Concert, Standup, Workshop..."
                          value={generalDetails.genre}
                          onChange={(e) =>
                            updateGeneralField("genre", e.target.value)
                          }
                        />
                      </Box>
                    </HStack>

                    <Box>
                      <Text fontSize="sm" mb={1}>
                        Additional Info
                      </Text>
                      <Textarea
                        bg="gray.900"
                        borderColor="gray.700"
                        _hover={{ borderColor: "teal.400" }}
                        placeholder="Any extra details you want to show"
                        value={generalDetails.additionalInfo}
                        onChange={(e) =>
                          updateGeneralField("additionalInfo", e.target.value)
                        }
                      />
                    </Box>
                  </VStack>
                )}

                <HStack justify="flex-end" pt={4}>
                  <Button
                    colorScheme="teal"
                    onClick={() => {
                      if (validateTypeDetails()) goToNext(3);
                    }}
                  >
                    Review & Create
                  </Button>
                </HStack>
              </AccordionPanel>
            </AccordionItem>

            {/* STEP 3: REVIEW */}
            <AccordionItem isDisabled={!eventType}>
              <h2>
                <AccordionButton
                  _expanded={{ bg: "gray.800" }}
                  _hover={{ bg: "gray.900" }}
                >
                  <Box flex="1" textAlign="left">
                    <Text fontWeight="bold">4. Review & Confirm</Text>
                    <Text fontSize="xs" color="gray.400">
                      Double check everything before creating
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pt={4} pb={6}>
                <VStack align="stretch" spacing={3}>
                  <Box>
                    <Text fontSize="sm" color="gray.400">
                      Title
                    </Text>
                    <Text fontWeight="semibold">{eventForm.title}</Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.400">
                      Type & Subcategory
                    </Text>
                    <Text>
                      {eventType}{" "}
                      {eventForm.subCategory ? `• ${eventForm.subCategory}` : ""}
                    </Text>
                  </Box>

                  <Box>
                    <Text fontSize="sm" color="gray.400">
                      Slots
                    </Text>
                    {slots.map((s, i) => (
                      <Text key={i} fontSize="sm">
                        #{i + 1} — Venue {s.venueName || s.venueId} •{" "}
                        {s.startTime} → {s.endTime} • {formatLabel(s.format)} •{" "}
                        {s.language} • ₹{s.basePrice}
                        {s.foods && s.foods.length > 0
                          ? ` • Food: ${s.foods
                            .map((f) => `${f.name} (₹${f.price})`)
                            .join(", ")}`
                          : ""}
                      </Text>
                    ))}
                  </Box>

                  {eventType === "MOVIE" && (
                    <Box>
                      <Text fontSize="sm" color="gray.400">
                        Movie Details
                      </Text>
                      <Text fontSize="sm">
                        Dir. {movieDetails.director} • {movieDetails.genre} •{" "}
                        {movieDetails.language}
                      </Text>
                      {movieDetails.castInput && (
                        <Text fontSize="sm">
                          Cast: {movieDetails.castInput}
                        </Text>
                      )}
                    </Box>
                  )}

                  {eventType === "SPORT" && (
                    <Box>
                      <Text fontSize="sm" color="gray.400">
                        Sport Details
                      </Text>
                      <Text fontSize="sm">
                        {sportDetails.sportType} — {sportDetails.team1} vs{" "}
                        {sportDetails.team2}
                      </Text>
                      {sportDetails.matchFormat && (
                        <Text fontSize="sm">
                          Format: {sportDetails.matchFormat}
                        </Text>
                      )}
                    </Box>
                  )}

                  {eventType === "EVENT" && (
                    <Box>
                      <Text fontSize="sm" color="gray.400">
                        Event Details
                      </Text>
                      <Text fontSize="sm">
                        {generalDetails.artist}
                        {generalDetails.host
                          ? ` • Hosted by ${generalDetails.host}`
                          : ""}
                        {` • ${generalDetails.genre}`}
                      </Text>
                    </Box>
                  )}

                  <HStack justify="flex-end" pt={3}>
                    <Button variant="outline" onClick={() => goToStep(0)}>
                      Edit
                    </Button>
                    <Button
                      colorScheme="teal"
                      onClick={handleCreate}
                      isLoading={creating}
                    >
                      Create Event
                    </Button>
                  </HStack>
                </VStack>
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </ModalBody>

        <ModalFooter borderTop="1px solid" borderColor="gray.700">
          <Button variant="ghost" onClick={onClose} mr={3}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}