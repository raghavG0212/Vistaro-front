import React from "react";
import { Box, Heading, Text, VStack, List, ListItem } from "@chakra-ui/react";

export default function HowItWorks() {
	return (
		<Box p={6}>
			<VStack align="start" spacing={4} maxW="3xl">
				<Heading size="lg">How Vistaro Works</Heading>
				<Text>
					Booking on Vistaro is quick — pick a city, choose an event, pick seats,
					and pay securely. Your e-ticket is delivered instantly.
				</Text>

				<Heading size="md" pt={4}>Steps</Heading>
				<List spacing={3}>
					<ListItem>1. Choose your city and browse events or shows.</ListItem>
					<ListItem>2. Select date, timing and seats (if applicable).</ListItem>
					<ListItem>3. Review order and checkout securely.</ListItem>
					<ListItem>4. Receive e-ticket by email / in-app immediately.</ListItem>
				</List>

				<Heading size="md" pt={4}>Payment & Seats</Heading>
				<Text>
					We support major UPI, cards and wallets. Seat maps (where available)
					show real-time availability.
				</Text>
			</VStack>
		</Box>
	);
}
