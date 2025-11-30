import React from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";

export default function TermsAndConditions() {
	return (
		<Box p={6}>
			<VStack align="start" spacing={4} maxW="3xl">
				<Heading size="lg">Terms & Conditions</Heading>
				<Text>
					Placeholder terms for using Vistaro. Include booking rules, user
					responsibilities, refund limits, and liabilities.
				</Text>

				<Heading size="md" pt={4}>Booking Rules</Heading>
				<Text>- Tickets are subject to venue rules.</Text>
				<Text>- Refunds follow cancellation policies listed on the event page.</Text>
			</VStack>
		</Box>
	);
}
