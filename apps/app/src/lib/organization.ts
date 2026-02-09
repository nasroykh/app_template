import { orpc } from "./orpc";

/**
 * Ensures the user has an active organization.
 * Creates a default organization if user has none, or sets the first one as active.
 *
 * @param userName - The user's display name (used for default org naming)
 * @returns The active organization ID, or null if setup failed
 */
export async function ensureActiveOrganization(
	userName: string,
): Promise<string | null> {
	try {
		// Get all organizations for user
		const orgsData = await orpc.organization.list.call({});

		if (!orgsData?.length) {
			// User has no organizations - create a default one
			const slug = userName
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/^-|-$/g, "");

			const orgData = await orpc.organization.create.call({
				name: `${userName}'s Organization`,
				slug: `${slug}-${Date.now()}`,
			});

			if (!orgData) {
				console.error("Failed to create organization");
				return null;
			}

			await orpc.organization.setActive.call({
				organizationId: orgData.id,
			});

			return orgData.id;
		}

		// User has organizations - ensure one is active
		const activeOrg = await orpc.organization.getFullOrganization.call({});
		if (activeOrg) {
			return activeOrg.id;
		}

		// No active org, set the first one
		if (orgsData[0]) {
			await orpc.organization.setActive.call({
				organizationId: orgsData[0].id,
			});
			return orgsData[0].id;
		}

		return null;
	} catch (error) {
		console.error("Failed to ensure active organization:", error);
		return null;
	}
}
