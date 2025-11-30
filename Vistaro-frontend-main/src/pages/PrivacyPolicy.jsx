import React from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";

export default function PrivacyPolicy() {
	return (
		<Box p={6}>
			<VStack align="start" spacing={4} maxW="3xl">
				<Heading size="lg">Privacy Policy</Heading>
				<Text>
					This is a placeholder privacy policy for Vistaro. Describe how user
					data, booking information and preferences are collected, stored and
					protected. Mention cookies, analytics and third-party integrations.
				</Text>

				<Heading size="md" pt={4}>Data We Collect</Heading>
				<Text>- Account information, email and phone (optional)</Text>
				<Text>- Booking history and preferences</Text>
				<Text>- Payment metadata (we do not store full card details)</Text>
			</VStack>
		</Box>
	);
}
