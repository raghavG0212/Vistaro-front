// src/components/HomeEventType.jsx

import React from "react";
import { Box, Image, Text } from "@chakra-ui/react";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useNavigate } from "react-router-dom";

export default function HomeEventType() {
	const navigate = useNavigate();

	// First 6 fixed types + 4 more optional
	const types = [
		{ title: "STANDUP_COMEDY", img: "" },
		{ title: "LIVE_CONCERT", img: "" },
		{ title: "THEATRE_SHOW", img: "" },
		{ title: "CULTURAL_EVENT", img: "" },
		{ title: "FESTIVAL_EXHIBITION", img: "" },
		{ title: "WORKSHOP_CLASS", img: "" },
		// Additional 4 placeholders
		{ title: "SPORTS_EVENT", img: "" },
		{ title: "OPEN_MIC", img: "" },
		{ title: "KIDS_EVENT", img: "" },
		{ title: "TECH_EVENT", img: "" },
	];

	// Slider config: small cards, multiple visible
	const responsive = {
		desktop: { breakpoint: { max: 3000, min: 1024 }, items: 5 },
		tablet: { breakpoint: { max: 1024, min: 600 }, items: 3 },
		mobile: { breakpoint: { max: 600, min: 0 }, items: 2 },
	};

	return (
		<Box mt={3} px={4} py={12}>
			<Carousel
				responsive={responsive}
				arrows={true}
				draggable
				swipeable
				infinite
				autoPlay={false}
				customTransition="all 0.8s ease"
				transitionDuration={800}
				containerClass="carousel-container"
				itemClass="carousel-item-padding-40-px"
			>
				{types.map((t) => (
					<Box
						key={t.title}
						cursor="pointer"
						onClick={() => navigate(`/events/subcategory/${t.title}`)}
						px={2}
					>
						{/* Card */}
						<Box
							borderRadius="lg"
							overflow="hidden"
							bg="gray.800"
							boxShadow="md"
							transition="0.2s"
							_hover={{ transform: "scale(1.05)" }}
						>
							{/* Image Placeholder */}
							<Box
								width="100%"
								height="160px"
								bg="gray.700"
								display="flex"
								alignItems="center"
								justifyContent="center"
							>
								<Text color="gray.300" fontSize="sm">
									Image (Ratio: 1.4 : 1 → e.g., 350 × 250)
								</Text>
							</Box>

							{/* Title */}
							<Box p={3}>
								<Text
									color="white"
									fontWeight="bold"
									textAlign="center"
									fontSize="md"
									noOfLines={1}
								>
									{t.title.replace("_", " ")}
								</Text>
							</Box>
						</Box>
					</Box>
				))}
			</Carousel>

			{/* Style Fix (Optional) */}
			<style>
				{`
          .carousel-container {
            padding-bottom: 10px;
          }
        `}
			</style>
		</Box>
	);
}
