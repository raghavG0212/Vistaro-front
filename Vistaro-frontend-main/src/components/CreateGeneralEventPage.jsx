// src/pages/CreateEvent.jsx
import React, { useState, useEffect } from "react";
import {
  ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Box, Text, Input, HStack, VStack, Button, Divider,
  Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
  Tag, Menu, MenuButton, MenuList, MenuItem, Badge
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import axios from "axios";
import { addEvent } from "../apis/eventApi";
import { addSlot } from "../apis/eventSlotApi";

const FORMAT_OPTIONS = [
  { label: "2D", value: "_2D" },
  { label: "3D", value: "_3D" },
  { label: "4DX", value: "_4DX" },
  { label: "NA", value: "NA" }
];

export default function CreateGeneralEventPage({ onClose }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [stepPills] = useState(["1. Basic", "2. Specific", "3. Slot & Food", "4. Finish"]);

  const [basic, setBasic] = useState({ title: "", description: "", subCategory: "", city: "" });
  const [eventSpecific, setEventSpecific] = useState({ artist: "", host: "", genre: "", additionalInfo: "" });

  const [slot, setSlot] = useState({ venueId: "", format: "NA", startTime: "", endTime: "", basePrice: "" });
  const [venueList, setVenueList] = useState([]);
  const [foodRows, setFoodRows] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/v1/venue/all");
        setVenueList(res.data || []);
      } catch (e) {
        setVenueList([]);
      }
    })();
  }, []);

  const setBasicField = (k, v) => setBasic((p) => ({ ...p, [k]: v }));
  const setEventField = (k, v) => setEventSpecific((p) => ({ ...p, [k]: v }));
  const setSlotField = (k, v) => setSlot((p) => ({ ...p, [k]: v }));
  const addFoodRow = () => setFoodRows((r) => [...r, { name: "", price: "" }]);
  const updateFood = (i, k, v) => setFoodRows((r) => r.map((f, idx) => idx === i ? { ...f, [k]: v } : f));
  const removeFood = (i) => setFoodRows((r) => r.filter((_, idx) => idx !== i));

  const next = () => setActiveIndex((i) => Math.min(3, i + 1));
  const back = () => setActiveIndex((i) => Math.max(0, i - 1));

  const handleCreate = async () => {
    try {
      const eventPayload = {
        title: basic.title,
        description: basic.description,
        category: "EVENT",
        subCategory: basic.subCategory,
        bannerUrl: "",
        thumbnailUrl: "",
        startTime: slot.startTime,
        endTime: slot.endTime
      };
      const evRes = await addEvent(eventPayload);
      const createdEvent = evRes.data || evRes;
      const eventId = createdEvent.eventId || createdEvent.eventId;

      const formatBackend = FORMAT_OPTIONS.find((o) => o.value === slot.format)?.value || slot.format;
      const slotPayload = {
        eventId,
        venueId: parseInt(slot.venueId, 10),
        startTime: slot.startTime,
        endTime: slot.endTime,
        format: formatBackend,
        language: eventSpecific.genre || "",
        basePrice: slot.basePrice ? parseFloat(slot.basePrice) : 0
      };

      const slotRes = await addSlot(slotPayload);
      const createdSlot = slotRes.data || slotRes;
      const slotId = createdSlot.slotId || createdSlot.slotId;

      for (const f of foodRows) {
        if (!f.name) continue;
        await axios.post("/api/v1/food", { slotId, name: f.name, price: f.price ? parseFloat(f.price) : 0 });
      }

      onClose();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while creating event");
    }
  };

  return (
    <>
      <ModalHeader>Create Event</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <HStack spacing={3} mb={4}>
          {stepPills.map((s, idx) => (
            <Tag key={s} size="sm" bg={idx === activeIndex ? "green.300" : "gray.700"} color={idx === activeIndex ? "black" : "white"}>
              {s}
            </Tag>
          ))}
        </HStack>

        <Divider mb={4} />

        <Accordion index={activeIndex} allowToggle>
          <AccordionItem>
            <AccordionButton><Box flex="1" textAlign="left">Basic Event Details</Box><AccordionIcon /></AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={3} align="stretch">
                <Input placeholder="Title" bg="gray.700" value={basic.title} onChange={(e) => setBasicField("title", e.target.value)} />
                <Input placeholder="Sub Category" bg="gray.700" value={basic.subCategory} onChange={(e) => setBasicField("subCategory", e.target.value)} />
                <Input placeholder="City" bg="gray.700" value={basic.city} onChange={(e) => setBasicField("city", e.target.value)} />
                <Input placeholder="Description" bg="gray.700" value={basic.description} onChange={(e) => setBasicField("description", e.target.value)} />
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton><Box flex="1" textAlign="left">Event Specific Details</Box><AccordionIcon /></AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={3} align="stretch">
                <Input placeholder="Artist" bg="gray.700" value={eventSpecific.artist} onChange={(e) => setEventField("artist", e.target.value)} />
                <Input placeholder="Host" bg="gray.700" value={eventSpecific.host} onChange={(e) => setEventField("host", e.target.value)} />
                <Input placeholder="Genre" bg="gray.700" value={eventSpecific.genre} onChange={(e) => setEventField("genre", e.target.value)} />
                <Input placeholder="Additional info" bg="gray.700" value={eventSpecific.additionalInfo} onChange={(e) => setEventField("additionalInfo", e.target.value)} />
              </VStack>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem>
            <AccordionButton><Box flex="1" textAlign="left">Slot & Food</Box><AccordionIcon /></AccordionButton>
            <AccordionPanel pb={4}>
              <VStack spacing={4} align="stretch">
                <HStack>
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

                <HStack>
                  <Input type="datetime-local" bg="gray.700" value={slot.startTime} onChange={(e) => setSlotField("startTime", e.target.value)} />
                  <Input type="datetime-local" bg="gray.700" value={slot.endTime} onChange={(e) => setSlotField("endTime", e.target.value)} />
                </HStack>

                <HStack>
                  <Input placeholder="Base Price" bg="gray.700" value={slot.basePrice} onChange={(e) => setSlotField("basePrice", e.target.value)} />
                  <Button onClick={addFoodRow} colorScheme="purple">Add Food</Button>
                </HStack>

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

          <AccordionItem>
            <AccordionButton><Box flex="1" textAlign="left">Review & Finish</Box><AccordionIcon /></AccordionButton>
            <AccordionPanel pb={4}>
              <Box bg="gray.700" p={4} borderRadius="md">
                <Text fontWeight="600">Quick review</Text>
                <Text>Title: {basic.title}</Text>
                <Text>City: {basic.city}</Text>
                <Text>Category: EVENT</Text>
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
