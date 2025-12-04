
import React, { useState, useEffect, useRef } from "react";
import {
	Box, HStack, Text, Button, Menu, MenuButton, MenuList, MenuItem,
	Modal, ModalOverlay, ModalContent,
	InputGroup, InputLeftElement, Input,
	VStack, Divider, SimpleGrid, Center,
	Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerBody,
	AlertDialog, AlertDialogOverlay, AlertDialogContent,
	AlertDialogHeader, AlertDialogFooter, AlertDialogBody
} from "@chakra-ui/react";

import { Link, useNavigate, useLocation } from "react-router-dom";

import { FiSearch, FiMenu } from "react-icons/fi";
import { IoLocationSharp } from "react-icons/io5";
import { ChevronDownIcon } from "@chakra-ui/icons";

import { useSelector, useDispatch } from "react-redux";
import { setCity } from "../redux/citySlice";

import CreateMoviePage from "./CreateMoviePage";
import CreateSportPage from "./CreateSportPage";
import CreateGeneralEventPage from "./CreateGeneralEventPage";

import axios from "axios";
import { searchByTitle } from "../apis/eventApi";
import { logoutUser } from "../redux/userSlice";
import { persistor } from "../redux/store";
import { toast } from "react-toastify";

export default function Header() {
	const navigate = useNavigate();
	const location = useLocation();
	const dispatch = useDispatch();

	const user = useSelector((state) => state.user);
	const userCity = user?.city || null;
	const storedCity = useSelector((state) => state.city?.selectedCity || null);

	const isLoggedIn = !!user?.isAuthenticated;
	const role = user?.role;
	const isAdmin = isLoggedIn && role === "ADMIN";
	const isNormalUser = isLoggedIn && role === "USER";

	// current city shown in UI
	const currentCityName = storedCity?.city || userCity || "Goa";

	// when user.city is present & no city selected yet, initialize citySlice from user
	useEffect(() => {
		if (userCity && !storedCity) {
			dispatch(setCity({ id: null, city: userCity }));
		}
	}, [userCity, storedCity, dispatch]);

	// ---------------- CITY MODAL ----------------
	const cities = [
		{ id: 1, city: "Mumbai" }, { id: 2, city: "Delhi" },
		{ id: 3, city: "Bengaluru" }, { id: 4, city: "Chennai" },
		{ id: 5, city: "Kolkata" }, { id: 6, city: "Hyderabad" },
		{ id: 7, city: "Noida" }, { id: 8, city: "Pune" },
		{ id: 9, city: "Chandigarh" }, { id: 10, city: "Goa" }
	];
	const dummySymbols = ["🏠", "🏛", "💻", "🏝", "🏯", "🏰", "🕌", "🌆", "🏖", "🌇"];

	const [cityModalOpen, setCityModalOpen] = useState(false);

	// ---------------- CREATE MODAL ----------------
	const [createOpen, setCreateOpen] = useState(false);
	const [createType, setCreateType] = useState("");
	const openCreate = (type) => {
		setCreateType(type);
		setCreateOpen(true);
	};

	// ---------------- SIDEBAR ----------------
	const [sidebarOpen, setSidebarOpen] = useState(false);

	// ---------------- LOGOUT POPUP ----------------
	const [logoutOpen, setLogoutOpen] = useState(false);
	const logoutCancelRef = useRef();

	// ---------------- SEARCH BAR ----------------
	const [searchText, setSearchText] = useState("");
	const [showPanel, setShowPanel] = useState(false);
	const [results, setResults] = useState({ movies: [], events: [], sports: [] });
	const [cityEventIds, setCityEventIds] = useState(new Set());
	const panelRef = useRef(null);

	// helper for disabled sidebar links
	const SidebarNavItem = ({ to, disabled, children }) => {
		if (disabled) {
			return (
				<Text
					as="span"
					color="gray.500"
					opacity={0.6}
					cursor="not-allowed"
				>
					{children}
				</Text>
			);
		}
		return (
			<Link to={to} onClick={() => setSidebarOpen(false)}>
				{children}
			</Link>
		);
	};

	// Load event slots for city filtering
	useEffect(() => {
		const cityName = storedCity?.city || userCity;
		if (!cityName) return;

		const load = async () => {
			try {
				const res = await axios.get("/api/v1/eventslot", {
					params: { city: cityName }
				});
				setCityEventIds(new Set(res.data?.map((s) => s.eventId)));
			} catch {
				setCityEventIds(new Set());
			}
		};

		load();
	}, [storedCity, userCity]);

	// Click outside closes search panel
	useEffect(() => {
		const handler = (e) => {
			if (panelRef.current && !panelRef.current.contains(e.target))
				setShowPanel(false);
		};

		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	// Fetch search results
	useEffect(() => {
		if (!searchText.trim()) {
			setResults({ movies: [], events: [], sports: [] });
			return;
		}

		const timeout = setTimeout(fetchSearch, 300);
		return () => clearTimeout(timeout);
	}, [searchText, cityEventIds]);

	const fetchSearch = async () => {
		const cityName = storedCity?.city || userCity;
		if (!cityName) return;

		try {
			const res = await searchByTitle(cityName, searchText);
			let data = res.data || [];

			data = data.filter((e) => cityEventIds.has(e.eventId));

			setResults({
				movies: data.filter((e) => e.category === "MOVIE"),
				events: data.filter((e) => e.category === "EVENT"),
				sports: data.filter((e) => e.category === "SPORT")
			});

		} catch {
			setResults({ movies: [], events: [], sports: [] });
		}
	};

	// Close search on navigation & clear on home
	useEffect(() => {
		setShowPanel(false);

		if (location.pathname === "/") {
			setSearchText("");
			setResults({ movies: [], events: [], sports: [] });
		}
	}, [location.pathname]);

	const handleLogout = () => {
		dispatch(logoutUser());
		persistor.purge(); // clear redux-persist storage
		navigate("/login");
		setLogoutOpen(false);
		setShowPanel(false);
		setSidebarOpen(false);
		toast.success("Logged out.");
	};

	// bookings + profile enable/disable logic
	const bookingsDisabled = !isLoggedIn || isAdmin; // guest OR admin → disabled
	const profileDisabled = !isLoggedIn;             // guest → disabled, user/admin → enabled

	return (
		<>
			{/* TOP NAVBAR */}
			<Box
				bg="linear-gradient(180deg,#0b1320 0%,#071018 100%)"
				color="gray.200"
				px={6}
				py={3}
				boxShadow="lg"
				position="relative"
				zIndex={1000}
			>
				<div className="flex items-center justify-between">

					{/* LOGO */}
					<Link to="/">
						<img
							src="/Logo-final-2.png"
							alt="Vistaro"
							style={{ height: "64px", width: "150px", objectFit: "contain" }}
						/>
					</Link>

					{/* NAV LINKS */}
					<div className="hidden md:flex gap-6 text-gray-300 font-medium">
						<Link to="/">Home</Link>
						<Link to="/events">Events</Link>
						<Link to="/sports">Sports</Link>
						<Link to="/movies">Movies</Link>
						<Link to="/offers">Offers</Link>
						<Link to="/about">About</Link>
					</div>

					{/* SEARCH BAR */}
					<Box flex="1" maxW="500px" mx={6} display={{ base: "none", md: "block" }}>
						<InputGroup>
							<InputLeftElement pointerEvents="none">
								<FiSearch color="gray.400" />
							</InputLeftElement>

							<Input
								placeholder="Search for movies, events, sports…"
								bg="gray.800"
								border="1px solid #2D3748"
								color="gray.200"
								value={searchText}
								onChange={(e) => {
									setSearchText(e.target.value);
									setShowPanel(true);
								}}
								onFocus={() => setShowPanel(true)}
							/>
						</InputGroup>
					</Box>

					{/* RIGHT SIDE (CITY → CREATE → LOGIN → SIDEBAR) */}
					<HStack spacing={3}>

						{/* CITY */}
						<Button
							size="sm"
							bg="#2bb0a0"
							color="white"
							onClick={() => setCityModalOpen(true)}
							_hover={{ bg: "#239485" }}
						>
							<HStack spacing={2}>
								<Text fontSize="sm">{currentCityName}</Text>
								<IoLocationSharp />
							</HStack>
						</Button>

						{/* CREATE (Admin only) */}
						{isAdmin && (
							<Menu>
								<MenuButton
									as={Button}
									size="sm"
									bg="gray.800"
									color="white"
									rightIcon={<ChevronDownIcon />}
									_hover={{ bg: "gray.600" }}
								>
									Create Event
								</MenuButton>

								<MenuList bg="gray.800" borderColor="gray.700" color="white">
									<MenuItem onClick={() => openCreate("MOVIE")}>Movie</MenuItem>
									<MenuItem onClick={() => openCreate("SPORT")}>Sport</MenuItem>
									<MenuItem onClick={() => openCreate("EVENT")}>Event</MenuItem>
								</MenuList>
							</Menu>
						)}

						{/* LOGIN (show only when not logged in) */}
						{!isLoggedIn && (
							<Link to="/login">
								<Button size="sm" bg="white" color="black">
									Sign In
								</Button>
							</Link>
						)}

						{/* SIDEBAR BUTTON */}
						<Button
							bg="gray.700"
							color="white"
							onClick={() => setSidebarOpen(true)}
							_hover={{ bg: "gray.600" }}
						>
							<FiMenu size={20} />
						</Button>

					</HStack>
				</div>
			</Box>

			{/* SEARCH DROPDOWN */}
			{showPanel && searchText.trim() && (
				<Box
					ref={panelRef}
					position="absolute"
					top="80px"
					width="100%"
					bg="gray.900"
					color="gray.200"
					p={8}
					boxShadow="0 12px 50px rgba(0,0,0,0.6)"
					zIndex={1500}
				>
					<Text fontSize="xl" fontWeight="bold">
						Search results for "{searchText}"
					</Text>
					<Divider my={4} />

					<HStack align="start" spacing={10}>
						{/* MOVIES */}
						<Box flex="1">
							<Text fontWeight="bold">Movies</Text>
							<VStack align="start" mt={3}>
								{results.movies.map((m) => (
									<HStack
										key={m.eventId}
										cursor="pointer"
										onClick={() => navigate(`/event/${m.eventId}`)}
									>
										<img src={m.thumbnailUrl} style={{ width: 50, height: 50 }} />
										<Text>{m.title}</Text>
									</HStack>
								))}
							</VStack>
						</Box>

						{/* EVENTS */}
						<Box flex="1">
							<Text fontWeight="bold">Events</Text>
							<VStack align="start" mt={3}>
								{results.events.map((e) => (
									<HStack
										key={e.eventId}
										cursor="pointer"
										onClick={() => navigate(`/event/${e.eventId}`)}
									>
										<img src={e.thumbnailUrl} style={{ width: 50, height: 50 }} />
										<Text>{e.title}</Text>
									</HStack>
								))}
							</VStack>
						</Box>

						{/* SPORTS */}
						<Box flex="1">
							<Text fontWeight="bold">Sports</Text>
							<VStack align="start" mt={3}>
								{results.sports.map((s) => (
									<HStack
										key={s.eventId}
										cursor="pointer"
										onClick={() => navigate(`/event/${s.eventId}`)}
									>
										<img src={s.thumbnailUrl} style={{ width: 50, height: 50 }} />
										<Text>{s.title}</Text>
									</HStack>
								))}
							</VStack>
						</Box>
					</HStack>
				</Box>
			)}

			{/* CITY MODAL */}
			<Modal
				isOpen={cityModalOpen}
				onClose={() => setCityModalOpen(false)}
				size="5xl"
				isCentered
			>
				<ModalOverlay />
				<ModalContent bg="white" color="black" p={6} borderRadius="lg">
					<Text fontSize="2xl" fontWeight="bold" mb={4}>
						Select Your City
					</Text>

					<Divider mb={4} />

					<SimpleGrid columns={5} spacing={6}>
						{cities.map((c, i) => (
							<Box
								key={c.id}
								p={4}
								border="1px solid #E2E8F0"
								borderRadius="lg"
								textAlign="center"
								cursor="pointer"
								_hover={{ boxShadow: "lg", transform: "scale(1.05)" }}
								transition="0.2s"
								onClick={() => {
									dispatch(setCity(c));
									setCityModalOpen(false);
								}}
							>
								<Text fontSize="2xl">{dummySymbols[i]}</Text>
								<Text fontWeight="600" mt={2}>{c.city}</Text>
							</Box>
						))}
					</SimpleGrid>
				</ModalContent>
			</Modal>

			{/* CREATE MODAL */}
			<Modal
				isOpen={createOpen}
				onClose={() => {
					setCreateOpen(false);
					setCreateType("");
				}}
				size="5xl"
				isCentered
			>
				<ModalOverlay />
				<ModalContent bg="gray.800" color="white">
					{createType === "MOVIE" && (
						<CreateMoviePage onClose={() => setCreateOpen(false)} />
					)}
					{createType === "SPORT" && (
						<CreateSportPage onClose={() => setCreateOpen(false)} />
					)}
					{createType === "EVENT" && (
						<CreateGeneralEventPage onClose={() => setCreateOpen(false)} />
					)}
				</ModalContent>
			</Modal>

			{/* SIDEBAR */}
			<Drawer
				isOpen={sidebarOpen}
				placement="right"
				onClose={() => setSidebarOpen(false)}
			>
				<DrawerOverlay />
				<DrawerContent
					bg="linear-gradient(180deg,#0b1320 0%,#071018 100%)"
					color="white"
				>
					<DrawerCloseButton />

					<DrawerBody mt={10}>
						{/* Logo */}
						<Center>
							<img
								src="/Logo-final-2.png"
								style={{ width: "120px", marginBottom: "20px" }}
							/>
						</Center>

						{/* User Info */}
						<VStack spacing={1} mb={6}>
							<Text fontSize="xl" fontWeight="bold">
								{isLoggedIn ? user.email : "Guest"}
							</Text>
							<Text fontSize="sm" color="gray.300">
								{isLoggedIn ? user.role : ""}
							</Text>
						</VStack>

						<Divider borderColor="gray.600" my={4} />

						{/* Navigation Links */}
						<VStack align="start" spacing={4} fontSize="lg">
							<Link to="/" onClick={() => setSidebarOpen(false)}>Home</Link>
							<Link to="/events" onClick={() => setSidebarOpen(false)}>Events</Link>
							<Link to="/sports" onClick={() => setSidebarOpen(false)}>Sports</Link>
							<Link to="/movies" onClick={() => setSidebarOpen(false)}>Movies</Link>
							<Link to="/offers" onClick={() => setSidebarOpen(false)}>Offers</Link>
							<Link to="/about" onClick={() => setSidebarOpen(false)}>About</Link>

							<SidebarNavItem
								to="/bookings"
								disabled={bookingsDisabled}
							>
								View Your Bookings
							</SidebarNavItem>

							<SidebarNavItem
								to="/profile"
								disabled={profileDisabled}
							>
								Update Profile
							</SidebarNavItem>
						</VStack>

						<Divider borderColor="gray.600" my={6} />

						{/* Bottom button – Sign In or Logout */}
						{!isLoggedIn ? (
							<Link to="/login" onClick={() => setSidebarOpen(false)}>
								<Button
									width="100%"
									bg="teal.500"
									color="white"
									_hover={{ bg: "teal.600" }}
								>
									Sign In
								</Button>
							</Link>
						) : (
							<Button
								width="100%"
								bg="red.500"
								color="white"
								_hover={{ bg: "red.600" }}
								onClick={() => setLogoutOpen(true)}
							>
								Logout
							</Button>
						)}
					</DrawerBody>
				</DrawerContent>
			</Drawer>

			{/* LOGOUT POPUP */}
			<AlertDialog
				isOpen={logoutOpen}
				leastDestructiveRef={logoutCancelRef}
				onClose={() => setLogoutOpen(false)}
			>
				<AlertDialogOverlay>
					<AlertDialogContent bg="gray.800" color="white">
						<AlertDialogHeader fontSize="lg" fontWeight="bold">
							Do you want to logout?
						</AlertDialogHeader>

						<AlertDialogBody>
							You will need to sign in again to access your account.
						</AlertDialogBody>

						<AlertDialogFooter>
							<Button ref={logoutCancelRef} onClick={() => setLogoutOpen(false)}>
								No
							</Button>
							<Button colorScheme="red" ml={3} onClick={handleLogout}>
								Yes
							</Button>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialogOverlay>
			</AlertDialog>
		</>
	);
}
