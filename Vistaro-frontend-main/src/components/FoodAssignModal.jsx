// src/components/FoodAssignModal.jsx
import React, { useEffect, useState } from "react";
import {
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter,
  Button, VStack, HStack, Checkbox, Text, Select, useToast
} from "@chakra-ui/react";
import axios from "axios";

// Expect props: isOpen, onClose, slots = [{ slotId, ... }], optionally eventId
export default function FoodAssignModal({ isOpen, onClose, slots = [], eventId = null }) {
  const toast = useToast();
  const [allFoods, setAllFoods] = useState([]);         // master food list
  const [selectedBySlot, setSelectedBySlot] = useState({}); // { slotId: Set(foodId) }

  useEffect(() => {
    if (!isOpen) return;
    fetchFoods();
    // initialize selected map
    const init = {};
    slots.forEach(s => { init[s.slotId] = new Set(); });
    setSelectedBySlot(init);
  }, [isOpen, slots]);

  const fetchFoods = async () => {
    try {
      const res = await axios.get("http://localhost:9090/api/v1/food");
      setAllFoods(res.data || []);
    } catch (err) {
      console.error(err);
      toast({ status: "error", title: "Failed to load foods" });
    }
  };

  const toggle = (slotId, foodId) => {
    setSelectedBySlot(prev => {
      const copy = { ...prev };
      const set = new Set(copy[slotId] || []);
      if (set.has(foodId)) set.delete(foodId); else set.add(foodId);
      copy[slotId] = set;
      return copy;
    });
  };

  // If you need to "create" a new food item for a slot (not selecting existing),
  // you'd open another small dialog. For now this assigns existing food items to slots
  // by creating new food rows with same name/price + slotId (Option C).
  const applyAssignments = async () => {
    try {
      for (const slot of slots) {
        const picks = Array.from(selectedBySlot[slot.slotId] || []);
        // For each picked foodId, create a food row with slotId set (or use mapping if exists)
        for (const fid of picks) {
          // find food details
          const f = allFoods.find(x => x.foodId === fid);
          if (!f) continue;
          const payload = {
            slotId: slot.slotId,
            name: f.name,
            price: f.price
          };
          // POST to /api/v1/food
          await axios.post("http://localhost:9090/api/v1/food", payload);
        }
      }
      toast({ status: "success", title: "Food assigned to slots" });
      onClose();
    } catch (err) {
      console.error(err);
      toast({ status: "error", title: "Assign failed" });
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="4xl" isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Assign Food to Slots</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack align="stretch" spacing={4}>
            {slots.length === 0 ? <Text>No slots available</Text> :
              slots.map(slot => (
                <VStack key={slot.slotId} align="start" p={3} border="1px solid" borderColor="gray.200" borderRadius="md">
                  <Text fontWeight="600">Slot #{slot.slotId} — {slot.startTime ?? ""}</Text>
                  <HStack wrap="wrap">
                    {allFoods.map(food => (
                      <Checkbox
                        key={food.foodId}
                        isChecked={selectedBySlot[slot.slotId] && selectedBySlot[slot.slotId].has(food.foodId)}
                        onChange={() => toggle(slot.slotId, food.foodId)}
                      >
                        {food.name} — {food.price}
                      </Checkbox>
                    ))}
                  </HStack>
                </VStack>
              ))
            }
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button mr={3} onClick={applyAssignments} colorScheme="teal">Assign</Button>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
