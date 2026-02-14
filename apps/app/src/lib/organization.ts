import { authClient } from "./auth";

/**
 * Ensures the user has an active organization set in their session.
 * The organization itself is created by the backend during user registration.
 * This function only sets the first available organization as active if none is currently active.
 *
 * @returns The active organization ID, or null if setup failed
 */
export async function ensureActiveOrganization(): Promise<string | null> {
	try {
		// Check if user already has an active organization
		const { data: activeOrg } = await authClient.organization.getFullOrganization({});
		if (activeOrg) {
			return activeOrg.id;
		}

		// No active org - get all organizations for user
		const { data: orgsData } = await authClient.organization.list({});

		if (!orgsData?.length) {
			// User has no organizations (this shouldn't happen as backend creates one)
			console.error(
				"User has no organizations - this should not happen as the backend creates one during registration",
			);
			return null;
		}

		// Set the first organization as active
		await authClient.organization.setActive({
			organizationId: orgsData[0].id,
		});

		return orgsData[0].id;
	} catch (error) {
		console.error("Failed to ensure active organization:", error);
		return null;
	}
}
