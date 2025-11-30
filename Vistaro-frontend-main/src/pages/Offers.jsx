import React from "react";
import {
	Box,
	Heading,
	Text,
	VStack,
	SimpleGrid,
	Card,
	CardBody,
	Badge,
} from "@chakra-ui/react";

export default function Offers() {
	// Dummy offer data
	const offers = [
		{ id: 1, title: "10% off on first booking", tag: "NEW" },
		{ id: 2, title: "Flat ₹50 off on concerts", tag: "CONCERT" },
		{ id: 3, title: "Buy 1 Get 1: Comedy shows", tag: "B1G1" },
	];

	return (
		<Box p={6}>
			<VStack align="start" spacing={4} maxW="4xl">
				<Heading size="lg">Offers & Deals</Heading>
				<Text>Current promotional offers you can apply at checkout.</Text>

				<SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} w="full" pt={2}>
					{offers.map((o) => (
						<Card key={o.id} borderWidth="1px" borderRadius="md">
							<CardBody>
								<VStack align="start">
									<Heading size="sm">{o.title}</Heading>
									<Badge>{o.tag}</Badge>
									<Text fontSize="sm" color="gray.600">
										Terms apply. Limited time.
									</Text>
								</VStack>
							</CardBody>
						</Card>
					))}
				</SimpleGrid>
			</VStack>
		</Box>
	);
}
