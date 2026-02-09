import { auth } from "../config/auth";

// =============================================================================
// Types
// =============================================================================

export type CreateOrganizationInput = {
	name: string;
	slug: string;
	logo?: string;
	metadata?: Record<string, unknown>;
};

export type UpdateOrganizationInput = {
	name?: string;
	slug?: string;
	logo?: string;
	metadata?: Record<string, unknown>;
};

export type SetActiveOrganizationInput = {
	organizationId: string;
};

export type InviteMemberInput = {
	email: string;
	role: "member" | "admin" | "owner";
	organizationId: string;
};

export type UpdateMemberRoleInput = {
	memberId: string;
	role: "member" | "admin" | "owner";
	organizationId: string;
};

export type RemoveMemberInput = {
	memberIdOrEmail: string;
	organizationId: string;
};

export type InvitationInput = {
	invitationId: string;
};

// =============================================================================
// Organization CRUD
// =============================================================================

export async function createOrganization(
	input: CreateOrganizationInput,
	headers: Headers,
) {
	return auth.api.createOrganization({
		body: {
			name: input.name,
			slug: input.slug,
			logo: input.logo,
			metadata: input.metadata,
		},
		headers,
	});
}

export async function updateOrganization(
	input: UpdateOrganizationInput,
	headers: Headers,
) {
	return auth.api.updateOrganization({
		body: { data: input },
		headers,
	});
}

export async function setActiveOrganization(
	organizationId: string,
	headers: Headers,
) {
	return auth.api.setActiveOrganization({
		body: { organizationId },
		headers,
	});
}

export async function listOrganizations(headers: Headers) {
	return auth.api.listOrganizations({
		headers,
	});
}

export async function getFullOrganization(headers: Headers) {
	return auth.api.getFullOrganization({
		headers,
	});
}

// =============================================================================
// Member Management
// =============================================================================

export async function listMembers(headers: Headers) {
	return auth.api.listMembers({
		headers,
	});
}

export async function inviteMember(input: InviteMemberInput, headers: Headers) {
	return auth.api.createInvitation({
		body: input,
		headers,
	});
}

export async function updateMemberRole(
	input: UpdateMemberRoleInput,
	headers: Headers,
) {
	return auth.api.updateMemberRole({
		body: input,
		headers,
	});
}

export async function removeMember(input: RemoveMemberInput, headers: Headers) {
	return auth.api.removeMember({
		body: input,
		headers,
	});
}

// =============================================================================
// Invitation Management
// =============================================================================

export async function getInvitation(invitationId: string, headers: Headers) {
	return auth.api.getInvitation({
		query: { id: invitationId },
		headers,
	});
}

export async function acceptInvitation(invitationId: string, headers: Headers) {
	return auth.api.acceptInvitation({
		body: { invitationId },
		headers,
	});
}

export async function rejectInvitation(invitationId: string, headers: Headers) {
	return auth.api.rejectInvitation({
		body: { invitationId },
		headers,
	});
}
