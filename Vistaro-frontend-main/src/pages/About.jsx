import React from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";

export default function About() {
	return (
		<Box p={6}>
			<VStack align="start" spacing={4} maxW="3xl">
				<Heading size="lg">About Vistaro</Heading>
				<Text>
					Vistaro is a modern ticketing platform for discovering and booking
					live shows, concerts, comedy nights, workshops and premium experiences
					across India. We make event discovery simple and booking fast with
					secure checkout and instant e-tickets.
				</Text>

				<Heading size="md" pt={4}>Our mission</Heading>
				<Text>
					To connect audiences with memorable live experiences — safely,
					reliably, and affordably.
				</Text>

				<Heading size="md" pt={4}>Contact</Heading>
				<Text>
					For partnerships, support or media enquiries, email us at{" "}
					<code>support@vistaro.example</code>.
				</Text>
			</VStack>
		</Box>
	);
}
