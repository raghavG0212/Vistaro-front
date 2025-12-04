import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Flex,
  Grid,
  Stack,
  Text,
  Badge,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  Tag,
  TagLabel,
  HStack,
  SimpleGrid,
  IconButton,
  Divider,
  Select,
  useDisclosure,
  Spinner,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "@chakra-ui/react";
import { AddIcon, MinusIcon } from "@chakra-ui/icons";
import { toast } from "react-toastify";
import { getGeneralEventByEventId } from "../apis/generalEventDetailsApi";
import { getMovieByEventId } from "../apis/movieApi";
import { getSportsByEventId } from "../apis/sportApi";
import { getSlotsByEventId } from "../apis/eventSlotApi";
import { getEventById } from "../apis/eventApi";
import { getSeatsForSlot, lockSeats, unlockSeats } from "../apis/seatApi";
import { getFoodsBySlot } from "../apis/foodApi";
import { createBooking } from "../apis/bookingApi";
import Loader from "../components/Loader";
import { motion } from "framer-motion";


export default function EventBookingPage() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  const {
    isOpen: isConfirmOpen,
    onOpen: openConfirm,
    onClose: closeConfirm
  } = useDisclosure();

  // ------------ STATE -------------
  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const selectedSeatsRef = useRef([]);

  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  const [foods, setFoods] = useState([]);
  const [foodQuantities, setFoodQuantities] = useState({}); // { foodId: qty }

  const [offerCode, setOfferCode] = useState("");
  const [giftCardCode, setGiftCardCode] = useState("");
  const [paymentMode, setPaymentMode] = useState(""); // 'CARD','UPI','WALLET','NETBANKING'

  const [submitting, setSubmitting] = useState(false);

  // optional filters for movie slots
  const [slotLanguageFilter, setSlotLanguageFilter] = useState("");
  const [slotFormatFilter, setSlotFormatFilter] = useState("");

  // ------------ FETCH EVENT + SLOTS -------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [eventRes, slotsRes] = await Promise.all([
          getEventById(eventId),
          getSlotsByEventId(eventId),
        ]);
        setEvent(eventRes.data);
        setSlots(slotsRes.data || []);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);

  // ------------ FETCH SEATS + FOOD WHEN SLOT SELECTED -------------
  const handleSelectSlot = async (slot) => {
    try {
      setSelectedSlot(slot);
      setSelectedSeats([]);
      setSeats([]);
      setFoods([]);
      setFoodQuantities({});

      const [seatsRes, foodRes] = await Promise.all([
        getSeatsForSlot(slot.slotId),
        getFoodsBySlot(slot.slotId),
      ]);

      setSeats(seatsRes.data || []);
      setFoods(foodRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load seats or food for this show");
    }
  };

  // ------------ SEAT GROUPING FOR UI -------------
  const seatsByRow = useMemo(() => {
    const map = {};
    seats.forEach((seat) => {
      const row = seat.rowLabel || seat.row_label;
      if (!map[row]) map[row] = [];
      map[row].push(seat);
    });
    Object.keys(map).forEach((row) =>
      map[row].sort((a, b) =>
        (a.seatNumber || a.seat_number).localeCompare(
          b.seatNumber || b.seat_number
        )
      )
    );
    return map;
  }, [seats]);

  // ------------ SEAT SELECTION -------------
  const toggleSeat = (seat) => {
    const seatId = seat.seatId || seat.seat_id;
    const isBooked = seat.isBooked ?? seat.is_booked;
    const isLocked = seat.isLocked ?? seat.is_locked;

    if (isBooked) {
      toast.warn("This seat is already booked");
      return;
    }
    if (isLocked) {
      toast.warn("This seat is temporarily locked by another user");
      return;
    }

    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  // ------------ FOOD QUANTITY HANDLERS -------------
  const incFood = (foodId) => {
    setFoodQuantities((prev) => ({
      ...prev,
      [foodId]: (prev[foodId] || 0) + 1,
    }));
  };

  const decFood = (foodId) => {
    setFoodQuantities((prev) => {
      const current = prev[foodId] || 0;
      const next = Math.max(0, current - 1);
      return { ...prev, [foodId]: next };
    });
  };

  // ------------ TOTALS -------------
  const ticketTotal = useMemo(() => {
    return selectedSeats.reduce((sum, seatId) => {
      const seat = seats.find(
        (s) => (s.seatId || s.seat_id) === seatId
      );
      if (!seat) return sum;
      const price = Number(seat.price);
      return sum + (isNaN(price) ? 0 : price);
    }, 0);
  }, [selectedSeats, seats]);

  const foodTotal = useMemo(() => {
    return foods.reduce((sum, f) => {
      const id = f.foodId || f.food_id;
      const qty = foodQuantities[id] || 0;
      const price = Number(f.price);
      return sum + qty * (isNaN(price) ? 0 : price);
    }, 0);
  }, [foods, foodQuantities]);

  const estimatedPayable = ticketTotal + foodTotal;

  // ------------ LOCK SELECTED SEATS -------------
  const lockSelectedSeats = async () => {
    if (selectedSeats.length === 0) {
      toast.warn("Please select at least one seat before locking");
      return;
    }

    try {
      await lockSeats(selectedSeats);
      toast.success("Seats locked for 10 minutes");

      // Refresh locked-status from DB
      if (selectedSlot) {
        const res = await getSeatsForSlot(selectedSlot.slotId);
        setSeats(res.data || []);
      }
    } catch (err) {
      console.error("Lock failed", err);
      toast.error(err?.response?.data?.message || "Failed to lock seats");

      // Refresh seat map (so UI shows correct locked seats)
      if (selectedSlot) {
        const res = await getSeatsForSlot(selectedSlot.slotId);
        setSeats(res.data || []);
      }
    }
  };

  // ------------ UNLOCK SELECTED SEATS -------------
  const releaseSeats = useCallback(async () => {
    const toUnlock = selectedSeatsRef.current;
    if (!toUnlock.length) return;

    try {
      await unlockSeats(toUnlock);
      // we *don't* clear selectedSeats here during normal usage;
      // this only runs on unmount / tab close
      if (selectedSlot) {
        const updated = await getSeatsForSlot(selectedSlot.slotId);
        setSeats(updated.data || []);
      }
    } catch (err) {
      console.error("Failed to unlock seats", err);
    }
  }, [selectedSlot]);


  // on component unmount
  useEffect(() => {
    return () => {
      releaseSeats();
    };
  }, [releaseSeats]);

  // on tab close / refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      releaseSeats();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [releaseSeats]);


  // on component unmount
  useEffect(() => {
    return () => {
      releaseSeats();
    };
  }, []); // run only on unmount


  // on tab close / refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      releaseSeats();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [releaseSeats]);



  // ------------ FILTERED SLOTS (for movies) -------------
  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      let ok = true;
      if (slotLanguageFilter) {
        ok =
          ok &&
          (slot.language || "")
            .toLowerCase()
            .includes(slotLanguageFilter.toLowerCase());
      }
      if (slotFormatFilter) {
        ok = ok && slot.format === slotFormatFilter;
      }
      return ok;
    });
  }, [slots, slotLanguageFilter, slotFormatFilter]);

  const handleProceedToPayment = async () => {
    if (!selectedSlot || selectedSeats.length === 0) {
      toast.warning("Select a show and seats first");
      return;
    }

    try {
      await lockSeats(selectedSeats); // lock for 10 min on backend

      // Build foodItems from your current state
      const foodItemsPayload = Object.entries(foodQuantities)
        .filter(([, qty]) => qty > 0)
        .map(([foodId, qty]) => ({
          foodId: Number(foodId),
          quantity: qty,
        }));

      navigate("/booking/confirm", {
        state: {
          eventId: event.eventId,
          slotId: selectedSlot.slotId,
          seatIds: selectedSeats,
          foodItems: foodItemsPayload,
          offerCode: offerCode || null,
          giftCardCode: giftCardCode || null,
          paymentMode: paymentMode || "CARD",
        },
      });
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to lock seats. Try again."
      );
    }
  };

  // ------------ UI HELPERS -------------
  const formatDateTime = (val) => {
    if (!val) return "";
    try {
      return new Date(val).toLocaleString();
    } catch {
      return String(val);
    }
  };

  const isMovie = event?.category === "MOVIE";

  // ------------ RENDER -------------
  if (loading) {
    return (
      <Loader />
    );
  }

  if (!event) {
    return (
      <Flex
        bg="gray.900"
        minH="100vh"
        align="center"
        justify="center"
        color="red.300"
      >
        <Text>Event not found</Text>
      </Flex>
    );
  }

  return (
    <Box bg="gray.900" minH="100vh" color="gray.100" py={6} px={{ base: 4, md: 8 }}>
      <Box maxW="1200px" mx="auto">
        {/* ---------- TOP HEADER WITH EVENT DETAILS ---------- */}
        <Box
          mb={6}
          borderRadius="lg"
          overflow="hidden"
          position="relative"
          height={{ base: "230px", md: "300px" }}
        >
          <Box
            backgroundImage={`url(${event.bannerUrl})`}
            backgroundSize="cover"
            backgroundPosition="center"
            w="100%"
            h="100%"
            filter="brightness(0.6)"
          />

          {/* Gradient overlay */}
          <Box
            position="absolute"
            top="0"
            left="0"
            w="100%"
            h="100%"
            bg="linear-gradient(to right, rgba(0,0,0,0.7), rgba(0,0,0,0.1))"
          />

          {/* Content */}
          <Flex
            position="absolute"
            top="0"
            left="0"
            w="100%"
            h="100%"
            p={6}
            align="center"
            justify="space-between"
          >
            {/* Left text */}
            <Stack spacing={3} maxW="60%">
              <Text fontSize={{ base: "2xl", md: "3xl" }} fontWeight="bold">
                {event.title}
              </Text>
              <HStack spacing={3}>
                <Badge
                  colorScheme={
                    event.category === "MOVIE"
                      ? "red"
                      : event.category === "SPORT"
                        ? "green"
                        : "purple"
                  }
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="sm"
                >
                  {event.category}
                </Badge>
                {event.subCategory && (
                  <Tag bg="gray.700" borderRadius="full" size="sm">
                    <TagLabel>{event.subCategory}</TagLabel>
                  </Tag>
                )}
              </HStack>
              <Text fontSize="sm" color="gray.300" noOfLines={3}>
                {event.description}
              </Text>
            </Stack>

            {/* Right thumbnail */}
            <Box
              borderRadius="lg"
              overflow="hidden"
              boxShadow="lg"
              minW="120px"
              maxW="150px"
            >
              <img
                src={event.thumbnailUrl}
                alt="thumbnail"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            </Box>
          </Flex>
        </Box>


        <Divider borderColor="gray.700" mb={6} />

        {/* ---------- 2-COLUMN LAYOUT ---------- */}
        <Grid templateColumns={{ base: "1fr", lg: "2.2fr 1fr" }} gap={6}>
          {/* LEFT: ACCORDIONS */}
          <Box>
            <Accordion allowToggle defaultIndex={[0]}>
              {/* 1. SHOW TIME / SLOT */}
              <AccordionItem
                bg="gray.800"
                borderRadius="lg"
                mb={4}
                border="1px solid"
                borderColor="gray.700"
              >
                <AccordionButton
                  px={4}
                  py={4}
                  _expanded={{ bg: "gray.700" }}
                >
                  <Box flex="1" textAlign="left">
                    <Text fontSize="lg" fontWeight="semibold">
                      Select Show Time
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      Choose a show for this event
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {isMovie && (
                    <HStack spacing={4} mb={4} wrap="wrap">
                      <Select
                        placeholder="Filter by language"
                        size="sm"
                        bg="gray.900"
                        borderColor="gray.600"
                        color="gray.100"
                        value={slotLanguageFilter}
                        onChange={(e) => setSlotLanguageFilter(e.target.value)}
                        maxW="200px"
                      >
                        {[...new Set(slots.map((s) => s.language))].map(
                          (lang) =>
                            lang && (
                              <option
                                key={lang}
                                value={lang}
                                style={{ color: "black" }}
                              >
                                {lang}
                              </option>
                            )
                        )}
                      </Select>

                      <Select
                        placeholder="Filter by format"
                        size="sm"
                        bg="gray.900"
                        borderColor="gray.600"
                        color="gray.100"
                        value={slotFormatFilter}
                        onChange={(e) => setSlotFormatFilter(e.target.value)}
                        maxW="200px"
                      >
                        {[...new Set(slots.map((s) => s.format))].map(
                          (fmt) =>
                            fmt && (
                              <option
                                key={fmt}
                                value={fmt}
                                style={{ color: "black" }}
                              >
                                {fmt.replace("_", "").replace("NA", "Standard")}
                              </option>
                            )
                        )}
                      </Select>
                    </HStack>
                  )}

                  {filteredSlots.length === 0 ? (
                    <Text fontSize="sm" color="gray.400">
                      No shows available for this event.
                    </Text>
                  ) : (
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3}>
                      {filteredSlots.map((slot) => {
                        const isSelected =
                          selectedSlot &&
                          selectedSlot.slotId === slot.slotId;
                        return (
                          <Box
                            key={slot.slotId}
                            borderWidth="1px"
                            borderRadius="md"
                            p={3}
                            cursor="pointer"
                            bg={isSelected ? "gray.700" : "gray.900"}
                            borderColor={isSelected ? "teal.400" : "gray.600"}
                            _hover={{
                              borderColor: "teal.300",
                              boxShadow: "0 0 0 1px rgba(56,178,172,0.7)",
                            }}
                            onClick={() => handleSelectSlot(slot)}
                          >
                            <Text fontSize="sm" fontWeight="semibold">
                              {formatDateTime(slot.startTime)}
                            </Text>
                            <Text fontSize="xs" color="gray.400">
                              Ends at {formatDateTime(slot.endTime)}
                            </Text>
                            <HStack spacing={2} mt={2}>
                              {slot.format && (
                                <Tag size="sm" bg="gray.700">
                                  {slot.format.replace("_", "")}
                                </Tag>
                              )}
                              {slot.language && (
                                <Tag size="sm" bg="gray.700">
                                  {slot.language}
                                </Tag>
                              )}
                            </HStack>
                            <Text mt={2} fontSize="sm" color="teal.300">
                              Starts from ₹{Number(slot.basePrice || 0)}
                            </Text>
                          </Box>
                        );
                      })}
                    </SimpleGrid>
                  )}
                </AccordionPanel>
              </AccordionItem>

              {/* 2. SEATS */}
              <AccordionItem
                isDisabled={!selectedSlot}
                opacity={selectedSlot ? 1 : 0.4}
                bg="gray.800"
                borderRadius="lg"
                mb={4}
                border="1px solid"
                borderColor="gray.700"
              >
                <AccordionButton
                  px={4}
                  py={4}
                  _expanded={{ bg: "gray.700" }}
                >
                  <Box flex="1" textAlign="left">
                    <Text fontSize="lg" fontWeight="semibold">
                      Select Seats
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      Choose your seats from the layout
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {!selectedSlot ? (
                    <Text fontSize="sm" color="gray.400">
                      Please select a show time first.
                    </Text>
                  ) : seats.length === 0 ? (
                    <Text fontSize="sm" color="gray.400">
                      No seats found for this show.
                    </Text>
                  ) : (
                    <>
                      <Box
                        mb={3}
                        textAlign="center"
                        fontSize="xs"
                        color="gray.400"
                      >
                        <Box
                          w="80%"
                          h="2px"
                          bg="gray.600"
                          mx="auto"
                          mb={1}
                        />
                        <Text>SCREEN THIS SIDE</Text>
                      </Box>

                      <Stack spacing={2}>
                        {Object.keys(seatsByRow)
                          .sort()
                          .map((row) => (
                            <HStack key={row} align="center">
                              <Text
                                w="20px"
                                fontSize="xs"
                                color="gray.400"
                                textAlign="right"
                              >
                                {row}
                              </Text>
                              <HStack spacing={1} wrap="wrap">
                                {seatsByRow[row].map((seat) => {
                                  const seatId =
                                    seat.seatId || seat.seat_id;
                                  const isBooked =
                                    seat.isBooked ?? seat.is_booked;
                                  const isLocked =
                                    seat.isLocked ?? seat.is_locked;
                                  const isSelected =
                                    selectedSeats.includes(seatId);

                                  let bg = "gray.700";
                                  let color = "gray.100";

                                  if (isBooked) {
                                    bg = "red.500";
                                  } else if (isLocked) {
                                    bg = "yellow.500";
                                    color = "black";
                                  } else if (isSelected) {
                                    bg = "teal.400";
                                    color = "black";
                                  }

                                  return (
                                    <Button
                                      key={seatId}
                                      size="xs"
                                      h="28px"
                                      minW="32px"
                                      bg={bg}
                                      color={color}
                                      _hover={
                                        isBooked || isLocked
                                          ? {}
                                          : { bg: "teal.500" }
                                      }
                                      isDisabled={isBooked || isLocked}
                                      onClick={() => toggleSeat(seat)}
                                    >
                                      {seat.seatNumber || seat.seat_number}
                                    </Button>
                                  );
                                })}
                              </HStack>
                            </HStack>
                          ))}
                      </Stack>

                      <Text mt={3} fontSize="xs" color="gray.400">
                        <Box
                          as="span"
                          display="inline-block"
                          w="10px"
                          h="10px"
                          bg="gray.700"
                          borderRadius="2px"
                          mr={1}
                        />
                        Available &nbsp;&nbsp;
                        <Box
                          as="span"
                          display="inline-block"
                          w="10px"
                          h="10px"
                          bg="teal.400"
                          borderRadius="2px"
                          mr={1}
                        />
                        Selected &nbsp;&nbsp;
                        <Box
                          as="span"
                          display="inline-block"
                          w="10px"
                          h="10px"
                          bg="red.500"
                          borderRadius="2px"
                          mr={1}
                        />
                        Booked
                      </Text>
                    </>
                  )}
                </AccordionPanel>
              </AccordionItem>

              {/* 3. FOOD & BEVERAGES */}
              <AccordionItem
                isDisabled={!selectedSlot || selectedSeats.length === 0}
                opacity={
                  !selectedSlot || selectedSeats.length === 0 ? 0.4 : 1
                }
                bg="gray.800"
                borderRadius="lg"
                mb={4}
                border="1px solid"
                borderColor="gray.700"
              >
                <AccordionButton
                  px={4}
                  py={4}
                  _expanded={{ bg: "gray.700" }}
                >
                  <Box flex="1" textAlign="left">
                    <Text fontSize="lg" fontWeight="semibold">
                      Food & Beverages
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      Add snacks & drinks for your show
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  {foods.length === 0 ? (
                    <Text fontSize="sm" color="gray.400">
                      No food options available for this show.
                    </Text>
                  ) : (
                    <Stack spacing={3}>
                      {foods.map((f) => {
                        const id = f.foodId || f.food_id;
                        const qty = foodQuantities[id] || 0;
                        return (
                          <Flex
                            key={id}
                            align="center"
                            justify="space-between"
                            bg="gray.900"
                            borderRadius="md"
                            px={3}
                            py={2}
                          >
                            <Box>
                              <Text fontSize="sm" fontWeight="medium">
                                {f.name}
                              </Text>
                              <Text fontSize="xs" color="gray.400">
                                ₹{Number(f.price || 0)}
                              </Text>
                            </Box>
                            <HStack>
                              <IconButton
                                aria-label="Decrease"
                                icon={<MinusIcon />}
                                size="xs"
                                onClick={() => decFood(id)}
                                isDisabled={qty === 0}
                              />
                              <Text w="24px" textAlign="center">
                                {qty}
                              </Text>
                              <IconButton
                                aria-label="Increase"
                                icon={<AddIcon />}
                                size="xs"
                                onClick={() => incFood(id)}
                              />
                            </HStack>
                          </Flex>
                        );
                      })}
                    </Stack>
                  )}
                </AccordionPanel>
              </AccordionItem>

              {/* 4. OFFERS & SUMMARY */}
              <AccordionItem
                isDisabled={selectedSeats.length === 0}
                opacity={selectedSeats.length === 0 ? 0.4 : 1}
                bg="gray.800"
                borderRadius="lg"
                mb={4}
                border="1px solid"
                borderColor="gray.700"
              >
                <AccordionButton
                  px={4}
                  py={4}
                  _expanded={{ bg: "gray.700" }}
                >
                  <Box flex="1" textAlign="left">
                    <Text fontSize="lg" fontWeight="semibold">
                      Offers & Summary
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      Apply offers / gift cards and review fare
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Stack spacing={3}>
                    <Box>
                      <Text fontSize="sm" mb={1}>
                        Offer Code (optional)
                      </Text>
                      <Flex gap={2}>
                        <input
                          style={{
                            flex: 1,
                            background: "#020617",
                            border: "1px solid #475569",
                            borderRadius: "6px",
                            padding: "8px",
                            color: "#e5e7eb",
                            fontSize: "0.85rem",
                          }}
                          value={offerCode}
                          onChange={(e) => setOfferCode(e.target.value)}
                          placeholder="e.g. BMS50"
                        />
                      </Flex>
                    </Box>

                    <Box>
                      <Text fontSize="sm" mb={1}>
                        Gift Card Code (optional)
                      </Text>
                      <Flex gap={2}>
                        <input
                          style={{
                            flex: 1,
                            background: "#020617",
                            border: "1px solid #475569",
                            borderRadius: "6px",
                            padding: "8px",
                            color: "#e5e7eb",
                            fontSize: "0.85rem",
                          }}
                          value={giftCardCode}
                          onChange={(e) => setGiftCardCode(e.target.value)}
                          placeholder="Enter gift card code"
                        />
                      </Flex>
                    </Box>

                    <Divider borderColor="gray.700" />

                    <Stack spacing={1} fontSize="sm">
                      <Flex justify="space-between">
                        <Text color="gray.300">Ticket total</Text>
                        <Text>₹{ticketTotal.toFixed(2)}</Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text color="gray.300">Food total</Text>
                        <Text>₹{foodTotal.toFixed(2)}</Text>
                      </Flex>
                      <Flex justify="space-between" fontWeight="semibold">
                        <Text>Estimated payable</Text>
                        <Text>₹{estimatedPayable.toFixed(2)}</Text>
                      </Flex>
                      <Text fontSize="xs" color="gray.500">
                        Final payable amount may change slightly depending on
                        offer / gift card validation on server.
                      </Text>
                    </Stack>
                  </Stack>
                </AccordionPanel>
              </AccordionItem>

              {/* 5. PAYMENT */}
              <AccordionItem
                isDisabled={selectedSeats.length === 0}
                opacity={selectedSeats.length === 0 ? 0.4 : 1}
                bg="gray.800"
                borderRadius="lg"
                mb={4}
                border="1px solid"
                borderColor="gray.700"
              >
                <AccordionButton
                  px={4}
                  py={4}
                  _expanded={{ bg: "gray.700" }}
                >
                  <Box flex="1" textAlign="left">
                    <Text fontSize="lg" fontWeight="semibold">
                      Payment
                    </Text>
                    <Text fontSize="xs" color="gray.400">
                      Choose how you want to pay
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Stack spacing={4}>
                    <Box>
                      <Text fontSize="sm" mb={1}>
                        Payment Mode
                      </Text>
                      <Select
                        placeholder="Select payment mode"
                        bg="gray.900"
                        borderColor="gray.600"
                        color="gray.100"
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value)}
                      >
                        <option value="CARD" style={{ color: "black" }}>
                          Card
                        </option>
                        <option value="UPI" style={{ color: "black" }}>
                          UPI
                        </option>
                        <option value="NETBANKING" style={{ color: "black" }}>
                          Netbanking
                        </option>
                        <option value="WALLET" style={{ color: "black" }}>
                          Wallet
                        </option>
                      </Select>
                    </Box>

                    {/* Dummy inputs (not sent to backend) */}
                    {paymentMode === "CARD" && (
                      <Stack spacing={2} fontSize="sm">
                        <Text color="gray.400">
                          Dummy card inputs (not actually validated):
                        </Text>
                        <input
                          style={{
                            background: "#020617",
                            border: "1px solid #475569",
                            borderRadius: "6px",
                            padding: "8px",
                            color: "#e5e7eb",
                            fontSize: "0.85rem",
                          }}
                          placeholder="Card Number"
                        />
                        <Flex gap={2}>
                          <input
                            style={{
                              flex: 1,
                              background: "#020617",
                              border: "1px solid #475569",
                              borderRadius: "6px",
                              padding: "8px",
                              color: "#e5e7eb",
                              fontSize: "0.85rem",
                            }}
                            placeholder="MM/YY"
                          />
                          <input
                            style={{
                              width: "80px",
                              background: "#020617",
                              border: "1px solid #475569",
                              borderRadius: "6px",
                              padding: "8px",
                              color: "#e5e7eb",
                              fontSize: "0.85rem",
                            }}
                            placeholder="CVV"
                          />
                        </Flex>
                      </Stack>
                    )}

                    {paymentMode === "UPI" && (
                      <Stack spacing={2} fontSize="sm">
                        <Text color="gray.400">
                          Enter any dummy UPI ID (not validated):
                        </Text>
                        <input
                          style={{
                            background: "#020617",
                            border: "1px solid #475569",
                            borderRadius: "6px",
                            padding: "8px",
                            color: "#e5e7eb",
                            fontSize: "0.85rem",
                          }}
                          placeholder="your-name@upi"
                        />
                      </Stack>
                    )}

                    <Button
                      colorScheme="teal"
                      size="lg"
                      onClick={async () => {
                        // 1) Lock seats
                        await lockSelectedSeats();
                        // 2) Navigate to confirm page
                        await handleProceedToPayment();
                      }}
                    >
                      Proceed to Payment
                    </Button>

                  </Stack>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>

          <Modal isOpen={isConfirmOpen} onClose={closeConfirm} isCentered>
            <ModalOverlay />
            <ModalContent bg="gray.800" color="gray.100">
              <ModalHeader>Confirm Payment</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text mb={2}>
                  You are about to complete your booking for:
                </Text>

                <Text fontWeight="bold" color="teal.300" mb={3}>
                  {event?.title}
                </Text>

                <Text fontSize="sm" color="gray.300">
                  Total amount payable: <b>₹{estimatedPayable.toFixed(2)}</b>
                </Text>

                <Text fontSize="xs" color="gray.500" mt={2}>
                  Note: Payment inputs are dummy, but booking will be created officially.
                </Text>
              </ModalBody>

              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={() => {
                  closeConfirm();
                  releaseSeats();
                }}>
                  Cancel
                </Button>
                <Button
                  colorScheme="teal"
                  onClick={async () => {
                    closeConfirm();
                    await handleProceedToPayment();
                  }}
                >
                  Confirm Payment
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>


          {/* RIGHT: SUMMARY SIDEBAR */}
          <Box
            bg="gray.800"
            borderRadius="lg"
            p={4}
            border="1px solid"
            borderColor="gray.700"
            position="sticky"
            top="80px"
            h="fit-content"
          >
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              Booking Summary
            </Text>
            <Divider borderColor="gray.700" mb={3} />
            <Stack spacing={2} fontSize="sm">
              <Text fontWeight="semibold">{event.title}</Text>
              {selectedSlot ? (
                <>
                  <Text color="gray.300">
                    {formatDateTime(selectedSlot.startTime)}
                  </Text>
                  <HStack spacing={2}>
                    {selectedSlot.language && (
                      <Tag size="sm" bg="gray.700">
                        {selectedSlot.language}
                      </Tag>
                    )}
                    {selectedSlot.format && (
                      <Tag size="sm" bg="gray.700">
                        {selectedSlot.format.replace("_", "")}
                      </Tag>
                    )}
                  </HStack>
                </>
              ) : (
                <Text color="gray.500">No show selected</Text>
              )}

              <Divider borderColor="gray.700" my={2} />

              <Text fontWeight="medium">Seats</Text>
              {selectedSeats.length === 0 ? (
                <Text fontSize="xs" color="gray.500">
                  No seats selected
                </Text>
              ) : (
                <Text fontSize="xs" color="gray.200">
                  {selectedSeats.length} seat(s) selected
                </Text>
              )}

              <Divider borderColor="gray.700" my={2} />

              <Text fontWeight="medium">Price Details</Text>
              <Flex justify="space-between">
                <Text color="gray.300">Ticket total</Text>
                <Text>₹{ticketTotal.toFixed(2)}</Text>
              </Flex>
              <Flex justify="space-between">
                <Text color="gray.300">Food total</Text>
                <Text>₹{foodTotal.toFixed(2)}</Text>
              </Flex>
              <Flex justify="space-between" fontWeight="semibold" mt={1}>
                <Text>Total payable</Text>
                <Text>₹{estimatedPayable.toFixed(2)}</Text>
              </Flex>
            </Stack>
          </Box>
        </Grid>
      </Box>
    </Box>
  );
}
