import React, { useEffect, useState } from "react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { Box, Badge, Image, Skeleton } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { getAllEvents } from "../apis/eventApi";
import { useNavigate } from "react-router-dom";
import Loader from "./Loader";

export default function HomeMainSlider() {
	const navigate = useNavigate();
	const selectedCity = useSelector((s) => s.city?.selectedCity);
	const cityName = selectedCity?.city || "";

	const [events, setEvents] = useState([]);
	const [loading, setLoading] = useState(false);

	// Fetch first 5 events
	useEffect(() => {
		if (!cityName) return;

		setLoading(true);
		getAllEvents(cityName)
			.then((res) => {
				const arr = Array.isArray(res.data) ? res.data.slice(0, 5) : [];
				setEvents(arr);
			})
			.catch(() => setEvents([]))
			.finally(() => setLoading(false));
	}, [cityName]);

	const responsive = {
		desktop: { breakpoint: { max: 3000, min: 1024 }, items: 1 },
		tablet: { breakpoint: { max: 1024, min: 600 }, items: 1 },
		mobile: { breakpoint: { max: 600, min: 0 }, items: 1 },
	};

	if (loading) {
		return (
			<Loader/>
		);
	}

	if (!events.length) return null;

	return (
		<Box width="100%" mt={4} borderRadius="lg" overflow="hidden">
			<Carousel
				responsive={responsive}
				infinite
				autoPlay
				autoPlaySpeed={3000}
				arrows
				draggable={false}
				swipeable
				ssr
				showDots={true}
				keyBoardControl
				containerClass="carousel-container"
			>
				{events.map((e) => (
					<Box
						key={e.eventId}
						position="relative"
						cursor="pointer"
						onClick={() => navigate(`/event/${e.eventId}`)}
					>
						{/* TITLE BADGE */}
						<Badge
							position="absolute"
							top="18px"
							left="18px"
							zIndex={20}
							px={3}
							py={2}
							fontSize="1rem"
							borderRadius="lg"
							colorScheme="red"
							textTransform="uppercase"
						>
							{e.title}
						</Badge>

						{/* BANNER IMAGE */}
						<Image
							src={e.bannerUrl}
							alt={e.title}
							width="100%"
							height="360px"
							objectFit="cover"
							objectPosition="center"
						/>
					</Box>
				))}
			</Carousel>

			{/* CUSTOM DOT STYLING */}
			<style>
				{`
          .react-multi-carousel-dot button {
            background: rgba(255,255,255,0.6);
            width: 10px;
            height: 10px;
          }

          .react-multi-carousel-dot--active button {
            background: #ff0000 !important; /* Active dot color (BookMyShow red) */
            width: 12px;
            height: 12px;
          }

          .react-multi-carousel-list {
            border-radius: 12px;
            overflow: hidden;
          }
        `}
			</style>
		</Box>
	);
}
