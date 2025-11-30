import React from "react";
import { Box, Heading, Text, VStack } from "@chakra-ui/react";

export default function CancellationRefund() {
	return (
		<Box p={6}>
			<VStack align="start" spacing={4} maxW="3xl">
				<Heading size="lg">Cancellation & Refund Policy</Heading>
				<Text>
					This is placeholder content explaining cancellation windows,
					partial/full refunds, and how to request support for refunds.
				</Text>

				<Heading size="md" pt={4}>Quick Summary</Heading>
				<Text>- Refund eligibility varies by event and ticket type.</Text>
				<Text>- Service fees may be non-refundable.</Text>
				<Text>- Contact support within 7 days for refund requests.</Text>
			</VStack>
		</Box>
	);
}
