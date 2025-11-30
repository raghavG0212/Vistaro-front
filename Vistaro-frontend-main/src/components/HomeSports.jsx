// src/components/HomeSports.jsx

import React, { useEffect, useState } from "react";
import {
	Box,
	Image,
	Text,
	Skeleton,
	Button,
	Center,
	Badge,
} from "@chakra-ui/react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useSelector } from "react-redux";
import { searchByCategory } from "../apis/eventApi";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";
import HeadingComponent from "./HeadingComponent";

const fmtDateOnly = (iso) => {
	if (!iso) return "TBD";
	return new Date(iso).toLocaleDateString(undefined, {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
};

export default function HomeSports() {
	const navigate = useNavigate();
	const selectedCity = useSelector((s) => s.city?.selectedCity);
	const cityName = selectedCity?.city || "";

	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (!cityName) return;

		setLoading(true);
		searchByCategory(cityName, "SPORT")
			.then((res) => setEvents(Array.isArray(res.data) ? res.data : []))
			.catch(() => setEvents([]))
			.finally(() => setLoading(false));
	}, [cityName]);

	if (loading) {
		return (
			<Loader/>
		);
	}

	if (!events.length) {
		return (
			<Box px={4} py={6}>
				<HeadingComponent heading={"trending sports"}/>
				<Center py={8}>
					<Text color="white">No sports events found.</Text>
				</Center>
			</Box>
		);
	}

	const responsive = {
		desktop: { breakpoint: { max: 3000, min: 1024 }, items: 4 },
		tablet: { breakpoint: { max: 1024, min: 600 }, items: 2 },
		mobile: { breakpoint: { max: 600, min: 0 }, items: 1 },
	};

	return (
		<Box px={4} py={6}>
			<HeadingComponent heading={"trending sports"} />

			<Carousel
				responsive={responsive}
				draggable
				swipeable
				autoPlay={false}
				keyBoardControl
				arrows={true}
				showDots={false}
				customTransition="all 0.8s ease"
				transitionDuration={800}
				ssr
				containerClass="carousel-container"
				itemClass="carousel-item-padding-40-px"
			>
				{events.map((e) => (
					<Box
						key={e.eventId}
						px={2}
						cursor="pointer"
						onClick={() => navigate(`/event/${e.eventId}`)}
					>
						<Box
							position="relative"
							overflow="hidden"
							borderRadius="lg"
							height="360px"
							transition="0.3s"
							_hover={{ transform: "scale(1.04)" }}
							boxShadow="dark-lg"
						>
							{/* SUBCATEGORY BADGE */}
							{e.subCategory && (
								<Badge
									position="absolute"
									top="10px"
									left="10px"
									colorScheme="purple"
									fontSize="0.8rem"
									px={2}
									py={1}
									zIndex={10}
								>
									{e.subCategory}
								</Badge>
							)}

							<Image
								src={e.thumbnailUrl}
								alt={e.title}
								width="100%"
								height="100%"
								objectFit="cover"
								objectPosition="center"
								borderRadius="lg"
							/>

							{/* HOVER OVERLAY */}
							<Box
								className="hover-info"
								position="absolute"
								bottom="-100%"
								left="0"
								width="100%"
								p={4}
								color="white"
								bg="rgba(0,0,0,0.75)"
								transition="0.3s ease"
							>
								<Text fontSize="sm" noOfLines={3}>
									{e.description}
								</Text>

								<Text mt={2} fontSize="sm" fontWeight="bold">
									{fmtDateOnly(e.startTime)} — {fmtDateOnly(e.endTime)}
								</Text>

								<Button
									size="sm"
									mt={3}
									colorScheme="red"
									width="100%"
									onClick={(ev) => {
										ev.stopPropagation();
										navigate(`/event/${e.eventId}`);
									}}
								>
									Book
								</Button>
							</Box>
						</Box>

						<Text
							mt={2}
							textAlign="center"
							color="white"
							fontWeight="bold"
							fontSize="lg"
							noOfLines={1}
						>
							{e.title}
						</Text>
					</Box>
				))}
			</Carousel>

			<style>
				{`
          .hover-info { bottom: -100%; }
          img:hover + .hover-info, 
          .hover-info:hover { bottom: 0; }
        `}
			</style>
		</Box>
	);
}
