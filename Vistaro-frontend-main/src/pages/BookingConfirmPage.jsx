import React, {
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
	Box,
	Flex,
	Heading,
	Text,
	Badge,
	VStack,
	HStack,
	Divider,
	Button,
	Spinner,
	Stat,
	StatLabel,
	StatNumber,
	StatHelpText,
	SimpleGrid,
	Tag,
	useDisclosure,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	Progress,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

// you already have these APIs:
import { getEventById } from "../apis/eventApi";
import { getSlotsByEventId } from "../apis/eventSlotApi";
import { getSeatsForSlot, unlockSeats } from "../apis/seatApi";
import { getFoodsBySlot } from "../apis/foodApi";
import { createBooking } from "../apis/bookingApi";

const MotionBox = motion(Box);

export default function BookingConfirmPage() {
	const location = useLocation();
	const navigate = useNavigate();
	const { isOpen, onOpen, onClose } = useDisclosure();

	// data passed from EventBookingPage
	const state = location.state || {};
	const {
		eventId,
		slotId,
		seatIds,
		foodItems = [],
		offerCode,
		giftCardCode,
		paymentMode,
	} = state;

	// if user opens this URL directly, redirect back
	useEffect(() => {
		if (!eventId || !slotId || !seatIds || !seatIds.length) {
			toast.error("Booking session not found. Please start again.");
			navigate(`/eventslots/${eventId || ""}`, { replace: true });
		}
	}, [eventId, slotId, seatIds, navigate]);

	// ------------ STATE -------------
	const [loading, setLoading] = useState(true);
	const [event, setEvent] = useState(null);
	const [slot, setSlot] = useState(null);
	const [seats, setSeats] = useState([]);
	const [foods, setFoods] = useState([]);
	const [bookingDone, setBookingDone] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	// timer in seconds → 10 min = 600
	const [timeLeft, setTimeLeft] = useState(600);

	// ------------ FETCH EVENT + SLOT + SEATS + FOOD -------------
	useEffect(() => {
		if (!eventId || !slotId) return;

		const fetchAll = async () => {
			try {
				setLoading(true);

				const [eventRes, slotsRes, seatsRes, foodsRes] = await Promise.all([
					getEventById(eventId),
					getSlotsByEventId(eventId),
					getSeatsForSlot(slotId),
					getFoodsBySlot(slotId),
				]);

				setEvent(eventRes.data);

				const slotList = slotsRes.data || [];
				const s = slotList.find((sl) => sl.slotId === slotId);
				setSlot(s || null);

				setSeats(seatsRes.data || []);
				setFoods(foodsRes.data || []);
			} catch (err) {
				console.error(err);
				toast.error("Failed to load booking summary");
				navigate(`/eventslots/${eventId}`, { replace: true });
			} finally {
				setLoading(false);
			}
		};

		fetchAll();
	}, [eventId, slotId, navigate]);

	// ------------ MAP SELECTED SEATS / FOOD -------------
	const selectedSeatObjects = useMemo(() => {
		if (!seats.length || !seatIds?.length) return [];
		return seats.filter((s) =>
			seatIds.includes(s.seatId || s.seat_id)
		);
	}, [seats, seatIds]);

	const selectedFoodObjects = useMemo(() => {
		if (!foods.length || !foodItems?.length) return [];
		return foodItems
			.map((fi) => {
				const food = foods.find(
					(f) => (f.foodId || f.food_id) === fi.foodId
				);
				return food
					? {
						...food,
						quantity: fi.quantity,
					}
					: null;
			})
			.filter(Boolean);
	}, [foods, foodItems]);

	// ------------ PRICE CALC -------------
	const ticketTotal = useMemo(() => {
		return selectedSeatObjects.reduce((sum, seat) => {
			const price = Number(seat.price);
			return sum + (isNaN(price) ? 0 : price);
		}, 0);
	}, [selectedSeatObjects]);

	const foodTotal = useMemo(() => {
		return selectedFoodObjects.reduce((sum, f) => {
			const price = Number(f.price);
			const qty = f.quantity || 0;
			return sum + (isNaN(price) ? 0 : price * qty);
		}, 0);
	}, [selectedFoodObjects]);

	const estimatedTotal = ticketTotal + foodTotal;

	// ------------ TIMER + AUTO UNLOCK -------------
	const handleTimeout = useCallback(async () => {
		if (bookingDone) return;
		toast.error("Payment time expired. Seats have been released.");

		try {
			if (seatIds && seatIds.length) {
				await unlockSeats(seatIds);
			}
		} catch (err) {
			console.error("Failed to unlock seats on timeout", err);
		}

		navigate(`/eventslots/${eventId}`, { replace: true });
	}, [bookingDone, seatIds, eventId, navigate]);

	useEffect(() => {
		if (!seatIds || !seatIds.length) return;

		const interval = setInterval(() => {
			setTimeLeft((prev) => {
				if (prev <= 1) {
					clearInterval(interval);
					handleTimeout();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);

		return () => clearInterval(interval);
	}, [handleTimeout, seatIds]);

	// unlock on unmount if booking not done
	useEffect(() => {
		return () => {
			if (!bookingDone && seatIds && seatIds.length) {
				unlockSeats(seatIds).catch((err) =>
					console.error("Failed to unlock on unmount", err)
				);
			}
		};
	}, [bookingDone, seatIds]);

	const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
	const seconds = String(timeLeft % 60).padStart(2, "0");
	const progressPercent = (timeLeft / 600) * 100;

	// ------------ CONFIRM BOOKING (ACTUAL API) -------------
	const handleConfirmBooking = async () => {
		if (!slot) {
			toast.error("No show selected");
			return;
		}
		if (!seatIds || !seatIds.length) {
			toast.error("No seats selected");
			return;
		}
		if (!paymentMode) {
			toast.error("No payment mode selected");
			return;
		}

		try {
			setSubmitting(true);

			// TEMP: dummy user (replace later with real userId)
			const dummyUserId = 1;

			const payload = {
				userId: dummyUserId,
				slotId,
				seatIds,
				offerCode: offerCode || null,
				giftCardCode: giftCardCode || null,
				foodItems: foodItems || [],
				paymentMode,
			};

			const res = await createBooking(payload);
			setBookingDone(true);

			toast.success("Booking confirmed!");

			// Optional: navigate to booking detail page
			navigate("/");
		} catch (err) {
			console.error(err);
			const msg =
				err?.response?.data?.message ||
				err?.response?.data ||
				"Booking failed";
			toast.error(msg);
		} finally {
			setSubmitting(false);
			onClose();
		}
	};

	const handleCancel = async () => {
		try {
			if (seatIds && seatIds.length) {
				await unlockSeats(seatIds);
			}
		} catch (err) {
			console.error("Failed to unlock seats on cancel", err);
		}
		navigate(`/eventslots/${eventId}`, { replace: true });
	};

	const formatDateTime = (val) => {
		if (!val) return "";
		try {
			return new Date(val).toLocaleString();
		} catch {
			return String(val);
		}
	};

	if (loading || !event || !slot) {
		return (
			<Flex minH="70vh" align="center" justify="center">
				<Spinner size="xl" />
			</Flex>
		);
	}

	return (
		<Box maxW="6xl" mx="auto" px={4} py={6}>
			{/* Top header with subtle animation */}
			<MotionBox
				mb={6}
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
			>
				<Flex justify="space-between" align="flex-start" gap={4}>
					<VStack align="flex-start" spacing={2}>
						<Heading size="lg" color="gray.100">
							{event.title}
						</Heading>
						<HStack spacing={3}>
							<Badge colorScheme="purple">{event.category}</Badge>
							{event.subCategory && (
								<Badge variant="outline" colorScheme="gray">
									{event.subCategory}
								</Badge>
							)}
						</HStack>
						<Text fontSize="sm" color="gray.300">
							{formatDateTime(slot.startTime)} • {slot.language} •{" "}
							{slot.format}
						</Text>
						<Text fontSize="xs" color="gray.400">
							Complete payment before timer expires, or your seats
							will be released automatically.
						</Text>
					</VStack>

					{/* Timer card */}
					<MotionBox
						p={4}
						borderRadius="xl"
						bg="gray.800"
						borderWidth="1px"
						borderColor="gray.700"
						minW="220px"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3, delay: 0.1 }}
					>
						<Text fontSize="xs" color="gray.400" mb={1}>
							Payment time left
						</Text>
						<Heading
							size="lg"
							color={timeLeft < 60 ? "red.300" : "green.300"}
						>
							{minutes}:{seconds}
						</Heading>
						<Progress
							mt={3}
							value={progressPercent}
							size="sm"
							borderRadius="full"
							colorScheme={timeLeft < 60 ? "red" : "green"}
						/>
					</MotionBox>
				</Flex>
			</MotionBox>

			<Flex direction={["column", null, "row"]} gap={6}>
				{/* LEFT: details */}
				<MotionBox
					flex="2"
					bg="gray.900"
					borderRadius="2xl"
					borderWidth="1px"
					borderColor="gray.700"
					p={5}
					initial={{ opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4 }}
				>
					<Heading size="md" mb={3} color="gray.100">
						Review your booking
					</Heading>
					<Divider mb={4} borderColor="gray.700" />

					{/* Seats */}
					<Box mb={4}>
						<Text fontWeight="semibold" color="gray.200" mb={1}>
							Seats
						</Text>
						{selectedSeatObjects.length === 0 ? (
							<Text fontSize="sm" color="red.300">
								No seats found for this booking context.
							</Text>
						) : (
							<HStack flexWrap="wrap" gap={2}>
								{selectedSeatObjects.map((s) => (
									<Tag
										key={s.seatId || s.seat_id}
										size="lg"
										borderRadius="full"
										variant="solid"
										bg="blue.500"
										color="white"
									>
										{s.rowLabel || s.row_label}
										{s.seatNumber || s.seat_number} • ₹{s.price}
									</Tag>
								))}
							</HStack>
						)}
					</Box>

					{/* Food */}
					<Box mb={4}>
						<Text fontWeight="semibold" color="gray.200" mb={1}>
							Food & beverages
						</Text>
						{selectedFoodObjects.length === 0 ? (
							<Text fontSize="sm" color="gray.500">
								No food added.
							</Text>
						) : (
							<VStack align="stretch" spacing={2}>
								{selectedFoodObjects.map((f) => (
									<Flex
										key={f.foodId || f.food_id}
										justify="space-between"
										align="center"
										p={2}
										borderRadius="md"
										bg="gray.800"
									>
										<Box>
											<Text color="gray.100">{f.name}</Text>
											<Text fontSize="xs" color="gray.400">
												₹{f.price} × {f.quantity}
											</Text>
										</Box>
										<Text fontWeight="semibold" color="gray.100">
											₹{Number(f.price) * (f.quantity || 0)}
										</Text>
									</Flex>
								))}
							</VStack>
						)}
					</Box>

					{/* Offers / giftcards */}
					<SimpleGrid columns={[1, 2]} spacing={4} mb={2}>
						<Box>
							<Text fontWeight="semibold" color="gray.200">
								Offer code
							</Text>
							<Text fontSize="sm" color="gray.400">
								{offerCode || "None applied"}
							</Text>
						</Box>
						<Box>
							<Text fontWeight="semibold" color="gray.200">
								Gift card
							</Text>
							<Text fontSize="sm" color="gray.400">
								{giftCardCode || "None applied"}
							</Text>
						</Box>
					</SimpleGrid>

					<Box mt={3}>
						<Text fontWeight="semibold" color="gray.200">
							Payment method
						</Text>
						<Text fontSize="sm" color="gray.400">
							{paymentMode || "Not specified"}
						</Text>
						<Text fontSize="xs" color="gray.500" mt={1}>
							Payment details are dummy only; backend stores only mode &
							status.
						</Text>
					</Box>
				</MotionBox>

				{/* RIGHT: summary & actions */}
				<MotionBox
					flex="1"
					bg="gray.900"
					borderRadius="2xl"
					borderWidth="1px"
					borderColor="gray.700"
					p={5}
					initial={{ opacity: 0, x: 10 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
				>
					<Heading size="md" mb={3} color="gray.100">
						Fare summary
					</Heading>
					<Divider mb={4} borderColor="gray.700" />

					<VStack align="stretch" spacing={2} mb={4}>
						<Stat>
							<StatLabel color="gray.400">Tickets</StatLabel>
							<StatNumber color="gray.100">
								₹{ticketTotal.toFixed(2)}
							</StatNumber>
							<StatHelpText color="gray.500">
								{selectedSeatObjects.length} seat(s)
							</StatHelpText>
						</Stat>

						<Stat>
							<StatLabel color="gray.400">Food & beverages</StatLabel>
							<StatNumber color="gray.100">
								₹{foodTotal.toFixed(2)}
							</StatNumber>
						</Stat>

						<Stat>
							<StatLabel color="gray.400">Estimated total</StatLabel>
							<StatNumber color="teal.300">
								₹{estimatedTotal.toFixed(2)}
							</StatNumber>
							<StatHelpText color="gray.500">
								Final amount may differ slightly after offer / giftcard
								rules on backend.
							</StatHelpText>
						</Stat>
					</VStack>

					<Divider mb={4} borderColor="gray.700" />

					<VStack align="stretch" spacing={3}>
						<Button
							as={motion.button}
							whileTap={{ scale: 0.97 }}
							whileHover={{ scale: 1.01 }}
							colorScheme="green"
							size="lg"
							onClick={onOpen}
							isDisabled={timeLeft === 0 || submitting}
						>
							Confirm & Pay ₹{estimatedTotal.toFixed(2)}
						</Button>

						<Button
							variant="outline"
							colorScheme="red"
							onClick={handleCancel}
							isDisabled={submitting}
						>
							Cancel & release seats
						</Button>

						<Text fontSize="xs" color="gray.500">
							Seats are reserved only for this session and will be
							released automatically when timer ends or you cancel.
						</Text>
					</VStack>
				</MotionBox>
			</Flex>

			{/* Confirm payment modal */}
			<Modal isOpen={isOpen} onClose={onClose} isCentered>
				<ModalOverlay />
				<ModalContent bg="gray.900" color="gray.100">
					<ModalHeader>Confirm payment</ModalHeader>
					<ModalCloseButton />
					<ModalBody>
						<Text mb={2}>
							You are about to pay{" "}
							<Text as="span" fontWeight="bold">
								₹{estimatedTotal.toFixed(2)}
							</Text>{" "}
							for:
						</Text>
						<Text fontSize="sm" color="gray.300">
							{event.title} • {formatDateTime(slot.startTime)}
						</Text>
						<Text fontSize="sm" color="gray.300" mb={2}>
							Seats:{" "}
							{selectedSeatObjects
								.map(
									(s) =>
										(s.rowLabel || s.row_label) +
										(s.seatNumber || s.seat_number)
								)
								.join(", ")}
						</Text>
						<Text fontSize="xs" color="gray.400">
							Payment mode: {paymentMode}. This is a dummy payment flow;
							no real money is charged.
						</Text>
					</ModalBody>
					<ModalFooter>
						<Button
							variant="ghost"
							mr={3}
							onClick={onClose}
							isDisabled={submitting}
						>
							Go back
						</Button>
						<Button
							colorScheme="green"
							onClick={handleConfirmBooking}
							isLoading={submitting}
							loadingText="Processing..."
						>
							Pay now
						</Button>
					</ModalFooter>
				</ModalContent>
			</Modal>
		</Box>
	);
}
