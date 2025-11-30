import React from "react";
import { Box, Heading, Text, VStack, Link } from "@chakra-ui/react";

export default function Blog() {
	return (
		<Box p={6}>
			<VStack align="start" spacing={4} maxW="3xl">
				<Heading size="lg">Vistaro Blog</Heading>
				<Text>
					Stories, event highlights and tips for getting the best experience at
					live shows and ticketed events.
				</Text>

				<VStack align="start" spacing={3} pt={4}>
					<Link href="#" color="teal.600">How to pick the best seats for concerts</Link>
					<Link href="#" color="teal.600">Safety checklist for live events</Link>
					<Link href="#" color="teal.600">Top 10 comedy shows this month</Link>
				</VStack>
			</VStack>
		</Box>
	);
}
