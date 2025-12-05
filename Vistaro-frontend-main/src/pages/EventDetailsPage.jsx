import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	Box,
	Flex,
	Image,
	Text,
	Button,
	Badge,
	Stack,
	HStack,
	VStack,
	Divider,
	Icon,
	useColorModeValue,
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalFooter,
	ModalCloseButton,
	FormControl,
	FormLabel,
	Input,
	Select,
	Switch,
} from "@chakra-ui/react";
import { StarIcon } from "@chakra-ui/icons";
import { FiPlay, FiMapPin, FiCalendar, FiEdit2, FiTrash2 } from "react-icons/fi";
import { IoPerson } from "react-icons/io5";
import { toast } from "react-toastify";

import { getEventById, updateEvent, deleteEvent } from "../apis/eventApi";
import { getMovieByEventId } from "../apis/movieApi";
import { getSportsByEventId } from "../apis/sportApi";
import { getGeneralEventByEventId } from "../apis/generalEventDetailsApi";
import Loader from "../components/Loader";
import { useSelector } from "react-redux";

export default function EventDetailsPage() {
	const { eventId } = useParams();
	const navigate = useNavigate();
	const [event, setEvent] = useState(null);
	const [details, setDetails] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [eventtype, setEventType] = useState("");
    const role = useSelector((state)=>state.user?.role);
	const user = useSelector((state)=> state.user);
	const isAdmin = (role==="ADMIN") ? true : false;
	const [isEditOpen, setEditOpen] = useState(false);
	const [isDeleteOpen, setDeleteOpen] = useState(false);
	const isLoggedIn = !!user?.isAuthenticated;

	const [editForm, setEditForm] = useState({
		eventId: "",
		title: "",
		description: "",
		category: "",
		subCategory: "",
		bannerUrl: "",
		thumbnailUrl: "",
		startTime: "",
		endTime: "",
	});

	const offers = useMemo(
		() => [
			{ id: 1, title: "Bank Offer", desc: "Get 10% off on XYZ Bank Cards.", tag: "Limited Time" },
			{ id: 2, title: "Wallet Cashback", desc: "Flat ₹100 cashback via ABC Wallet.", tag: "Cashback" },
			{ id: 3, title: "Combo Deal", desc: "Ticket + Popcorn @ ₹399.", tag: "Food" },
		],
		[]
	);
	const [offerIndex, setOfferIndex] = useState(0);

	useEffect(() => {
		const loadDetails = async () => {
			try {
				setLoading(true);
				setError(null);

				const eventRes = await getEventById(eventId);
				setEvent(eventRes.data);

				let detailsRes = null;

				switch (eventRes.data.category) {
					case "MOVIE":
						detailsRes = await getMovieByEventId(eventId);
						setEventType("MOVIE");
						break;
					case "SPORT":
						detailsRes = await getSportsByEventId(eventId);
						setEventType("SPORT");
						break;
					case "EVENT":
						detailsRes = await getGeneralEventByEventId(eventId);
						setEventType("EVENT");
						break;
				}
				setDetails(detailsRes?.data || null);
			} catch (err) {
				setError("Failed to load event details");
			} finally {
				setLoading(false);
			}
		};
		loadDetails();
	}, [eventId]);

	const bgColor = useColorModeValue("#050816", "#050816");
	const cardBg = useColorModeValue("whiteAlpha.100", "whiteAlpha.100");
	const borderClr = useColorModeValue("whiteAlpha.300", "whiteAlpha.300");

	const formatDateTime = (iso) => {
		if (!iso) return "TBD";
		const d = new Date(iso);
		return d.toLocaleString(undefined, {
			day: "numeric",
			month: "short",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDateOnly = (iso) => {
		if (!iso) return "TBD";
		const d = new Date(iso);
		return d.toLocaleDateString(undefined, {
			day: "numeric",
			month: "short",
			year: "numeric",
		});
	};

	const handlePrevOffer = () => setOfferIndex((i) => (i === 0 ? offers.length - 1 : i - 1));
	const handleNextOffer = () => setOfferIndex((i) => (i === offers.length - 1 ? 0 : i + 1));

	const openEditModal = () => {
		setEditForm({
			eventId: event.eventId,
			title: event.title,
			description: event.description,
			category: event.category,
			subCategory: event.subCategory,
			bannerUrl: event.bannerUrl,
			thumbnailUrl: event.thumbnailUrl,
			startTime: event.startTime ? event.startTime.slice(0, 16) : "",
			endTime: event.endTime ? event.endTime.slice(0, 16) : "",
		});
		setEditOpen(true);
	};

	const handleEditChange = (e) => {
		setEditForm({ ...editForm, [e.target.name]: e.target.value });
	};

	const handleSubmitEdit = async () => {
		try {
			const payload = {
				...editForm,
				startTime: new Date(editForm.startTime).toISOString(),
				endTime: new Date(editForm.endTime).toISOString(),
			};

			await updateEvent(eventId, payload);

			toast.success("Event updated successfully!");
			setEditOpen(false);

			const refresh = await getEventById(eventId);
			setEvent(refresh.data);
		} catch (err) {
			toast.error("Failed to update event");
		}
	};

	const handleConfirmDelete = async () => {
		try {
			await deleteEvent(eventId);
			toast.success("Event deleted successfully!");
			setDeleteOpen(false);
			navigate("/");
		} catch (err) {
			toast.error("Delete failed");
		}
	};

	if (loading) return <Loader />;

	if (error || !event) {
		return (
			<Box bg={bgColor} minH="100vh" color="white" p={6}>
				<Text textAlign="center" mt={10}>{error || "Event not found."}</Text>
			</Box>
		);
	}

	const isMovie = eventtype === "MOVIE";
	const isSport = eventtype === "SPORT";
	const isGeneral = eventtype === "EVENT";
	const castList = isMovie && details && Array.isArray(details.castJson) ? details.castJson : [];
	return (
		<Box bg={bgColor} minH="100vh" color="white">
			<Box position="relative" height={{ base: "220px", md: "320px", lg: "360px" }} bg="black">
				<Image src={event.bannerUrl} objectFit="cover" width="100%" height="100%" opacity={0.4} zIndex={5}/>
				<Box position="absolute" inset="0" bgGradient="linear(to-t, blackAlpha.900, blackAlpha.400)" />

				{isAdmin && (
					<HStack position="absolute" top="15px" right="15px" spacing={3} zIndex={20}>
						<Button size="sm" leftIcon={<FiEdit2 />} colorScheme="green" onClick={openEditModal}>
							Edit
						</Button>
						<Button size="sm" leftIcon={<FiTrash2 />} colorScheme="red" onClick={() => setDeleteOpen(true)}>
							Delete
						</Button>
					</HStack>
				)}

				{/* OVERLAY CONTENT */}
				<Flex
					position="absolute"
					inset="0"
					align="flex-end"
					px={{ base: 4, md: 10 }}
					pb={{ base: 4, md: 8 }}
					gap={6}
					direction={{ base: "column", md: "row" }}
				>
					{/* Thumbnail + Trailer for movies */}
					<Box
						flexShrink={0}
						width={{ base: "120px", md: "180px", lg: "210px" }}
						position="relative"
					>
						<Image
							src={event.thumbnailUrl}
							alt={event.title}
							borderRadius="lg"
							objectFit="cover"
							width="100%"
							height={{ base: "170px", md: "240px" }}
							boxShadow="xl"
						/>

						{isMovie && details?.trailerUrl && (
							<Button
								leftIcon={<FiPlay />}
								size="sm"
								position="absolute"
								bottom="10px"
								left="50%"
								transform="translateX(-50%)"
								colorScheme="red"
								onClick={() => window.open(details.trailerUrl, "_blank")}
							>
								Trailer
							</Button>
						)}
					</Box>

					{/* Title + primary info */}
					<Box flex="1">
						<Stack spacing={3}>
							<HStack spacing={3} align="center">
								<Text
									fontSize={{ base: "2xl", md: "3xl" }}
									fontWeight="bold"
									noOfLines={2}
								>
									{event.title}
								</Text>
								{event.subCategory && (
									<Badge colorScheme="purple" borderRadius="md">
										{event.subCategory}
									</Badge>
								)}
							</HStack>

							{isMovie && details && (
								<HStack spacing={4}>
									<HStack>
										<StarIcon color="yellow.400" />
										<Text fontWeight="semibold">
											{details.rating ?? "N/A"}
										</Text>
										{details.totalReviews != null && (
											<Text fontSize="sm" color="gray.300">
												({details.totalReviews} reviews)
											</Text>
										)}
									</HStack>
									<Button
										size="sm"
										variant="outline"
										borderColor="whiteAlpha.600"
										_hover={{ bg: "whiteAlpha.200" }}
									>
										Rate Now
									</Button>
								</HStack>
							)}

							{/* Generic info strip */}
							<HStack spacing={4} flexWrap="wrap">
								{isMovie && (
									<>
										{details?.language && (
											<Badge colorScheme="blue" variant="outline">
												{details.language}
											</Badge>
										)}
										{details?.genre && (
											<Badge colorScheme="green" variant="outline">
												{details.genre}
											</Badge>
										)}
										{details?.releaseDate && (
											<Text fontSize="sm" color="gray.300">
												Release: {formatDateOnly(details.releaseDate)}
											</Text>
										)}
									</>
								)}

								{isSport && details && (
									<>
										{details.sportType && (
											<Badge colorScheme="orange" variant="outline">
												{details.sportType}
											</Badge>
										)}
										{details.matchFormat && (
											<Badge colorScheme="purple" variant="outline">
												{details.matchFormat}
											</Badge>
										)}
									</>
								)}

								{isGeneral && details && (
									<>
										{details.genre && (
											<Badge colorScheme="pink" variant="outline">
												{details.genre}
											</Badge>
										)}
									</>
								)}
							</HStack>

							{/* Time & Venue / Additional top info */}
							<Stack spacing={1} fontSize="sm" color="gray.200">
								{(isSport || isGeneral) && (
									<HStack>
										<Icon as={FiCalendar} />
										<Text>
											{formatDateTime(details.startTime)} -{" "}
											{formatDateTime(details.endTime)}
										</Text>
									</HStack>
								)}

								{isSport && details.venueInfo && (
									<HStack>
										<Icon as={FiMapPin} />
										<Text>{details.venueInfo}</Text>
									</HStack>
								)}
							</Stack>

							{/* BOOK TICKETS PANEL */}
							<Box
								mt={3}
								p={4}
								borderRadius="lg"
								bg={cardBg}
								border="1px solid"
								borderColor={borderClr}
							>
								{isAdmin ? (<Flex
									justify="space-between"
									align={{ base: "flex-start", md: "center" }}
									direction={{ base: "column", md: "row" }}
									gap={3}
								>
									<Box>
										<Text fontWeight="bold" fontSize="lg">
											Create Eventslot
										</Text>
										<Text fontSize="sm" color="gray.300">
											Add Slot Details On The Next Step
										</Text>
									</Box>
									<Button
										colorScheme="purple"
										size="md"
										onClick={()=> navigate(`/eventslot/add/${eventId}`)}
									>
										Add Slot
									</Button>
								</Flex>) : (<Flex
									justify="space-between"
									align={{ base: "flex-start", md: "center" }}
									direction={{ base: "column", md: "row" }}
									gap={3}
								>
									<Box>
										<Text fontWeight="bold" fontSize="lg">
											Book Tickets
										</Text>
										<Text fontSize="sm" color="gray.300">
											Select showtime and seats on the next step.
										</Text>
									</Box>
										{isLoggedIn ? (<Button
											colorScheme="purple"
											size="md"
											onClick={() => navigate(`/eventslots/${eventId}`)}
										>
											Book Tickets
										</Button>) : (<Button
											colorScheme="purple"
											size="md"
											onClick={() => {navigate(`/login`);
											toast.warning("Login to book tickets.")}}
										>
											Book Tickets
										</Button>)}
								</Flex>)}
							</Box>
						</Stack>
					</Box>
				</Flex>
			</Box>

			{/* MAIN BODY */}
			<Box px={{ base: 4, md: 10 }} py={6}>
				<Flex
					gap={8}
					direction={{ base: "column", lg: "row" }}
					alignItems="flex-start"
				>
					{/* LEFT COLUMN: DESCRIPTION + EXTRA DETAILS */}
					<Box flex="3">
						{/* Description */}
						<Box
							mb={6}
							p={5}
							borderRadius="lg"
							bg={cardBg}
							border="1px solid"
							borderColor={borderClr}
						>
							<Text fontSize="xl" fontWeight="bold" mb={2}>
								About the Event
							</Text>
							<Text fontSize="sm" color="gray.200">
								{event.description || "No description provided."}
							</Text>
						</Box>

						{/* Event-type specific details */}
						{isMovie && details && (
							<Box
								mb={6}
								p={5}
								borderRadius="lg"
								bg={cardBg}
								border="1px solid"
								borderColor={borderClr}
							>
								<Text fontSize="xl" fontWeight="bold" mb={3}>
									Cast & Crew
								</Text>

								{castList.length > 0 ? (
									<HStack spacing={3} flexWrap="wrap" mb={4}>
										{castList.map((c, idx) => (
											<div
												key={idx}
											>
												<div className="flex flex-col justify-center items-center py-3">
													<IoPerson className="text-[80px] rounded-full bg-slate-500" />
													<p className="py-3">
														{typeof c === "string" || typeof c === "number"
															? c
															: JSON.stringify(c)}
													</p>
												</div>
											</div>
										))}
									</HStack>
								) : (
									<Text fontSize="sm" color="gray.400" mb={3}>
										Cast information not available.
									</Text>
								)}

								{details.director && (
									<Box mt={2}>
										<Text fontWeight="semibold" fontSize="xl">Director</Text>
										<Text fontSize="md" color="gray.200" className="py-3">
											{details.director}
										</Text>
									</Box>
								)}
							</Box>
						)}

						{isSport && details && (
							<Box
								mb={6}
								p={5}
								borderRadius="lg"
								bg={cardBg}
								border="1px solid"
								borderColor={borderClr}
							>
								<Text fontSize="xl" fontWeight="bold" mb={3}>
									Match Details
								</Text>

								<HStack spacing={4} mb={3}>
									<Text fontSize="lg" fontWeight="bold">
										{details.team1}
									</Text>
									<Text fontSize="lg" color="gray.300">
										VS
									</Text>
									<Text fontSize="lg" fontWeight="bold">
										{details.team2}
									</Text>
								</HStack>

								{details.matchFormat && (
									<Text fontSize="sm" color="gray.200" mb={1}>
										Format: {details.matchFormat}
									</Text>
								)}

								{details.venueInfo && (
									<Text fontSize="sm" color="gray.200">
										Venue: {details.venueInfo}
									</Text>
								)}
							</Box>
						)}

						{isGeneral && details && (
							<Box
								mb={6}
								p={5}
								borderRadius="lg"
								bg={cardBg}
								border="1px solid"
								borderColor={borderClr}
							>
								<Text fontSize="xl" fontWeight="bold" mb={3}>
									Event Highlights
								</Text>

								<Stack spacing={2}>
									<Text fontSize="sm" color="gray.200">
										<b>Artist:</b> {details.artist}
									</Text>
									{details.host && (
										<Text fontSize="sm" color="gray.200">
											<b>Host:</b> {details.host}
										</Text>
									)}
									{details.additionalInfo && (
										<Text fontSize="sm" color="gray.200">
											<b>More Info:</b> {details.additionalInfo}
										</Text>
									)}
								</Stack>
							</Box>
						)}
					</Box>

					{/* RIGHT COLUMN: OFFERS + SIDE INFO */}
					<Box flex="1.2" minW={{ base: "100%", lg: "320px" }}>
						{/* Offers Carousel (1/4 width kind of side panel) */}
						<Box
							mb={6}
							p={4}
							borderRadius="lg"
							bg={cardBg}
							border="1px solid"
							borderColor={borderClr}
						>
							<Text fontSize="lg" fontWeight="bold" mb={2}>
								Offers
							</Text>
							<Divider mb={3} borderColor="whiteAlpha.300" />

							{offers.length > 0 && (
								<Box>
									<Text fontSize="md" fontWeight="semibold">
										{offers[offerIndex].title}
									</Text>
									<Badge
										colorScheme="green"
										variant="outline"
										mt={1}
										mb={2}
									>
										{offers[offerIndex].tag}
									</Badge>
									<Text fontSize="sm" color="gray.200" mb={3}>
										{offers[offerIndex].desc}
									</Text>

									<HStack justify="space-between">
										<Button size="xs" variant="ghost" onClick={handlePrevOffer}>
											◀ Prev
										</Button>
										<Text fontSize="xs" color="gray.400">
											{offerIndex + 1} / {offers.length}
										</Text>
										<Button size="xs" variant="ghost" onClick={handleNextOffer}>
											Next ▶
										</Button>
									</HStack>
								</Box>
							)}
						</Box>

						{/* Generic extra info card (time, category, etc.) */}
						<Box
							p={4}
							borderRadius="lg"
							bg={cardBg}
							border="1px solid"
							borderColor={borderClr}
						>
							<Text fontSize="lg" fontWeight="bold" mb={2}>
								Event Info
							</Text>
							<Divider mb={3} borderColor="whiteAlpha.300" />

							<VStack align="flex-start" spacing={2} fontSize="sm">
								<HStack>
									<Icon as={FiCalendar} />
									<Text>
										{formatDateTime(event.startTime)} -{" "}
										{formatDateTime(event.endTime)}
									</Text>
								</HStack>

								<HStack>
									<Text fontWeight="semibold">Category:</Text>
									<Text>{event.category}</Text>
								</HStack>

								{event.subCategory && (
									<HStack>
										<Text fontWeight="semibold">Sub Category:</Text>
										<Text>{event.subCategory}</Text>
									</HStack>
								)}
							</VStack>
							<Modal isOpen={isEditOpen} onClose={() => setEditOpen(false)} size="xl" isCentered>
								<ModalOverlay />
								<ModalContent bg="#10121a" color="white">
									<ModalHeader>Edit Event</ModalHeader>
									<ModalCloseButton />

									<ModalBody>
										<Stack spacing={4}>
											<FormControl>
												<FormLabel>Event ID</FormLabel>
												<Input value={editForm.eventId} disabled />
											</FormControl>

											<FormControl>
												<FormLabel>Title</FormLabel>
												<Input name="title" value={editForm.title} onChange={handleEditChange} />
											</FormControl>

											<FormControl>
												<FormLabel>Description</FormLabel>
												<Input name="description" value={editForm.description} onChange={handleEditChange} />
											</FormControl>

											<FormControl>
												<FormLabel>Category</FormLabel>
												<Select value={editForm.category} disabled>
													<option style={{ color: "black" }}>{editForm.category}</option>
												</Select>
											</FormControl>

											<FormControl>
												<FormLabel>Sub Category</FormLabel>
												<Input name="subCategory" value={editForm.subCategory} onChange={handleEditChange} />
											</FormControl>

											<FormControl>
												<FormLabel>Banner URL</FormLabel>
												<Input name="bannerUrl" value={editForm.bannerUrl} onChange={handleEditChange} />
											</FormControl>

											<FormControl>
												<FormLabel>Thumbnail URL</FormLabel>
												<Input name="thumbnailUrl" value={editForm.thumbnailUrl} onChange={handleEditChange} />
											</FormControl>

											<FormControl>
												<FormLabel>Start Time</FormLabel>
												<Input type="datetime-local" name="startTime" value={editForm.startTime} onChange={handleEditChange} />
											</FormControl>

											<FormControl>
												<FormLabel>End Time</FormLabel>
												<Input type="datetime-local" name="endTime" value={editForm.endTime} onChange={handleEditChange} />
											</FormControl>
										</Stack>
									</ModalBody>

									<ModalFooter>
										<Button colorScheme="gray" mr={3} onClick={() => setEditOpen(false)}>
											Cancel
										</Button>
										<Button colorScheme="yellow" onClick={handleSubmitEdit}>
											Save Changes
										</Button>
									</ModalFooter>
								</ModalContent>
							</Modal>

							{/* ---------------------------- DELETE MODAL ---------------------------- */}
							<Modal isOpen={isDeleteOpen} onClose={() => setDeleteOpen(false)} isCentered>
								<ModalOverlay />
								<ModalContent bg="#1a1c25" color="white">
									<ModalHeader>Confirm Delete</ModalHeader>
									<ModalCloseButton />

									<ModalBody>
										<Text>Are you sure you want to delete this event?</Text>
									</ModalBody>

									<ModalFooter>
										<Button mr={3} onClick={() => setDeleteOpen(false)}>
											Cancel
										</Button>
										<Button colorScheme="red" onClick={handleConfirmDelete}>
											Delete
										</Button>
									</ModalFooter>
								</ModalContent>
							</Modal>
						</Box>
					</Box>
				</Flex>
			</Box>
		</Box>
	);
}
