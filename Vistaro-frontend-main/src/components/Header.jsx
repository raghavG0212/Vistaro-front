// src/components/HeaderWithCityModal.jsx

import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCity } from "../redux/citySlice";

import {
	Modal,
	ModalOverlay,
	ModalContent,
	ModalHeader,
	ModalBody,
	ModalCloseButton,
	Drawer,
	DrawerBody,
	DrawerHeader,
	DrawerOverlay,
	DrawerContent,
	DrawerCloseButton,
	Input,
	InputGroup,
	InputLeftElement,
	VStack,
	HStack,
	Text,
	Box,
	Button,
	Divider,
	Badge,
	SimpleGrid,
	Center,
	useDisclosure,
} from "@chakra-ui/react";

import { SearchIcon } from "@chakra-ui/icons";
import { IoLocationSharp } from "react-icons/io5";
import { CiCircleList } from "react-icons/ci";

export default function Header() {
	const dispatch = useDispatch();
	const selectedCity = useSelector((state) => state.city.selectedCity);

	const [cityModal, setCityModal] = useState(false);
	const [query, setQuery] = useState("");

	const {
		isOpen: isDrawerOpen,
		onOpen: openDrawer,
		onClose: closeDrawer,
	} = useDisclosure();

	// ---------- CITY LIST ----------
	const cities = useMemo(
		() => [
			{ id: 1, city: "Mumbai" },
			{ id: 2, city: "Delhi" },
			{ id: 3, city: "Bengaluru" },
			{ id: 4, city: "Chennai" },
			{ id: 5, city: "Kolkata" },
			{ id: 6, city: "Hyderabad" },
			{ id: 7, city: "Noida" },
			{ id: 8, city: "Pune" },
			{ id: 9, city: "Chandigarh" },
			{ id: 10, city: "Goa" },
		],
		[]
	);

	const dummySymbols = ["🏠", "🏛️", "💻", "🏝️", "🏯", "🏰", "🕌", "🌆", "🏖️", "🌇"];

	const filteredCities = useMemo(() => {
		const q = query.toLowerCase().trim();
		if (!q) return cities;
		return cities.filter((c) => c.city.toLowerCase().includes(q));
	}, [query, cities]);

	const handleSelect = (cityObj) => {
		dispatch(setCity(cityObj));
		setCityModal(false);
	};

	return (
		<>


			{/* NAVBAR */}
			<div className="flex justify-between items-center px-6 py-3 bg-slate-950 shadow-lg">

				{/* Logo */}
				<Link to="/">
					<img
						src="/Logo-final-2.png"
						className="h-10 w-40 object-contain"
						alt="Vistaro"
					/>
				</Link>

				{/* --- FULL MENU (Desktop Only) --- */}
				<div className="hidden md:flex items-center gap-6 text-gray-200 font-medium">
					<Link to="/">Home</Link>
					<Link to="/events">Events</Link>
					<Link to="/sports">Sports</Link>
					<Link to="/movies">Movies</Link>
					<Link to="/offers">Offers</Link>
					<Link to="/about">About</Link>
				</div>

				{/* Search Bar (Hidden on small screens) */}
				<div className="hidden md:block flex-1 mx-8 max-w-lg">
					<InputGroup>
						<InputLeftElement pointerEvents="none">
							<SearchIcon color="gray.400" />
						</InputLeftElement>
						<Input
							placeholder="Search for events, sports, movies.."
							bg="whitesmoke"
							borderRadius="lg"
						/>
					</InputGroup>
				</div>

				{/* Right Side Buttons */}
				<div>
					<div className="flex items-center gap-3">

						{/* City Selector */}
						<Button
							onClick={() => setCityModal(true)}
							colorScheme="teal"
							size="sm"
							borderRadius="md"
						>
							<HStack>
								<Text>{selectedCity ? selectedCity.city : "Choose City"}</Text>
								<IoLocationSharp />
							</HStack>
						</Button>

						{/* Login Button */}
						<Link to="/login">
							<Button size="sm">Sign In</Button>
						</Link>

						{/* Hamburger - ALWAYS visible on mobile only */}
						<Button
							variant="ghost"
							color="white"
							onClick={openDrawer}
							className="md:hidden"
						>
							<CiCircleList className="text-3xl" />
						</Button>

					</div>

					{/* create button */}
					<div>

					</div>
				</div>
			</div>

			{/* MOBILE DRAWER */}
			<Drawer placement="right" onClose={closeDrawer} isOpen={isDrawerOpen}>
				<DrawerOverlay />
				<DrawerContent bg="gray.900" color="gray.200">
					<DrawerCloseButton />
					<DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>

					<DrawerBody>
						<VStack align="start" spacing={5} mt={4} fontSize="lg">
							<Link to="/" onClick={closeDrawer}>Home</Link>
							<Link to="/events" onClick={closeDrawer}>Events</Link>
							<Link to="/sports" onClick={closeDrawer}>Sports</Link>
							<Link to="/movies" onClick={closeDrawer}>Movies</Link>
							<Link to="/offers" onClick={closeDrawer}>Offers</Link>
							<Link to="/about" onClick={closeDrawer}>About</Link>
							<Link to="/contact" onClick={closeDrawer}>Contact</Link>
						</VStack>

						<Divider my={6} />

						{/* Mobile Search */}
						<InputGroup>
							<InputLeftElement pointerEvents="none">
								<SearchIcon color="gray.400" />
							</InputLeftElement>
							<Input placeholder="Search..." bg="gray.800" />
						</InputGroup>
					</DrawerBody>
				</DrawerContent>
			</Drawer>

			{/* CITY MODAL (Your original code) */}
			<Modal isOpen={cityModal} onClose={() => setCityModal(false)} isCentered size="3xl">
				<ModalOverlay />
				<ModalContent>
					<ModalHeader>Select Your City</ModalHeader>
					<ModalCloseButton />
					<ModalBody pb={6}>
						<VStack spacing={4} align="stretch">

							{/* City Search */}
							<InputGroup>
								<InputLeftElement pointerEvents="none">
									<SearchIcon />
								</InputLeftElement>
								<Input
									placeholder="Search cities..."
									value={query}
									onChange={(e) => setQuery(e.target.value)}
								/>
							</InputGroup>

							<HStack justifyContent="space-between">
								<Text fontWeight="semibold">Popular Cities</Text>
								<Badge colorScheme="purple">India</Badge>
							</HStack>

							<Divider />

							<SimpleGrid columns={{ base: 2, sm: 3, md: 5 }} spacing={4}>
								{filteredCities.map((city, idx) => (
									<Box
										key={city.id}
										p={3}
										borderRadius="md"
										textAlign="center"
										border="1px solid #CBD5E0"
										onClick={() => handleSelect(city)}
										_hover={{
											bg: "gray.100",
											cursor: "pointer",
											transform: "scale(1.03)",
										}}
									>
										<Center>
											<Box fontSize="2xl" mb={1}>
												{dummySymbols[idx % dummySymbols.length]}
											</Box>
										</Center>
										<Text fontWeight="medium">{city.city}</Text>
									</Box>
								))}
							</SimpleGrid>
						</VStack>
					</ModalBody>
				</ModalContent>
			</Modal>
			<Box bg="gray.900" color="gray.300" borderTop="6px solid" borderColor="teal.600"></Box>
		</>
	);
}
