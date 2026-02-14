import { useState } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	IconUserPlus,
	IconTrash,
	IconLoader2,
	IconDots,
	IconUser,
} from "@tabler/icons-react";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth";
import { type Role, getRoleBadgeVariant } from "./types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export function MembersTab() {
	const queryClient = useQueryClient();
	const { data: sessionData } = useSession();
	const { data: activeOrg } = authClient.useActiveOrganization();

	// Debug logging
	console.log("[MembersTab] Session:", sessionData);
	console.log("[MembersTab] Active Org:", activeOrg);

	const $role = activeOrg?.members?.find(
		(m) => m.userId === sessionData?.user?.id,
	)?.role;

	// Invite dialog state
	const [inviteOpen, setInviteOpen] = useState(false);
	const [inviteEmail, setInviteEmail] = useState("");
	const [inviteRole, setInviteRole] = useState<Role>("member");

	// Role update state
	const [updatingMemberId, setUpdatingMemberId] = useState<string | null>(null);

	const canManageMembers = $role === "owner" || $role === "admin";

	// Queries
	const orgQuery = useQuery(
		orpc.organization.getFullOrganization.queryOptions(),
	);

	const membersQuery = useQuery(orpc.organization.listMembers.queryOptions());

	const orgId = orgQuery.data?.id || null;
	const members = (membersQuery.data?.members as any[]) || [];
	const isLoading = orgQuery.isLoading || membersQuery.isLoading;

	// Mutations
	const inviteMutation = useMutation(
		orpc.organization.inviteMember.mutationOptions({
			onSuccess: () => {
				toast.success(`Invitation sent to ${inviteEmail}`);
				setInviteOpen(false);
				setInviteEmail("");
				setInviteRole("member");
			},
			onError: (error: any) => {
				toast.error(error.message || "Failed to send invitation");
			},
		}),
	);

	const updateRoleMutation = useMutation(
		orpc.organization.updateMemberRole.mutationOptions({
			onSuccess: () => {
				toast.success("Role updated successfully");
				queryClient.invalidateQueries({
					queryKey: orpc.organization.listMembers.queryOptions().queryKey,
				});
				setUpdatingMemberId(null);
			},
			onError: (error: any) => {
				toast.error(error.message || "Failed to update role");
				setUpdatingMemberId(null);
			},
		}),
	);

	const removeMemberMutation = useMutation(
		orpc.organization.removeMember.mutationOptions({
			onSuccess: () => {
				toast.success("Member removed successfully");
				queryClient.invalidateQueries({
					queryKey: orpc.organization.listMembers.queryOptions().queryKey,
				});
			},
			onError: (error: any) => {
				toast.error(error.message || "Failed to remove member");
			},
		}),
	);

	const handleInvite = () => {
		if (!inviteEmail || !orgId) return;
		inviteMutation.mutate({
			email: inviteEmail,
			role: inviteRole,
			organizationId: orgId,
		});
	};

	const handleUpdateRole = (memberId: string, newRole: Role) => {
		if (!orgId) return;
		setUpdatingMemberId(memberId);
		updateRoleMutation.mutate({
			memberId,
			role: newRole,
			organizationId: orgId,
		});
	};

	const handleRemoveMember = (memberId: string, email: string) => {
		if (!orgId) return;

		if (
			!confirm(
				`Are you sure you want to remove ${email} from the organization?`,
			)
		) {
			return;
		}

		removeMemberMutation.mutate({
			memberIdOrEmail: memberId,
			organizationId: orgId,
		});
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between space-y-0">
				<div>
					<CardTitle>Team Members</CardTitle>
					<CardDescription>
						Manage who has access to this organization
					</CardDescription>
				</div>
				{canManageMembers && (
					<Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
						<DialogTrigger render={<Button className="gap-2" />}>
							<IconUserPlus className="size-4" />
							Invite Member
						</DialogTrigger>
						<DialogContent>
							<DialogHeader>
								<DialogTitle>Invite Team Member</DialogTitle>
								<DialogDescription>
									Send an email invitation to join your organization
								</DialogDescription>
							</DialogHeader>
							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<label className="text-sm font-medium">Email Address</label>
									<Input
										placeholder="colleague@example.com"
										value={inviteEmail}
										onChange={(e) => setInviteEmail(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium">Role</label>
									<Select
										value={inviteRole}
										onValueChange={(v) => setInviteRole(v as Role)}
									>
										<SelectTrigger>
											<SelectValue>Select a role</SelectValue>
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="member">Member</SelectItem>
											<SelectItem value="admin">Admin</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>
							<DialogFooter>
								<Button variant="outline" onClick={() => setInviteOpen(false)}>
									Cancel
								</Button>
								<Button
									onClick={handleInvite}
									disabled={inviteMutation.isPending || !inviteEmail}
								>
									{inviteMutation.isPending && (
										<IconLoader2 className="mr-2 size-4 animate-spin" />
									)}
									Send Invitation
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				)}
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex justify-center py-8">
						<IconLoader2 className="size-8 animate-spin text-muted-foreground" />
					</div>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>User</TableHead>
								<TableHead>Role</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{members.map((member: any) => (
								<TableRow key={member.id}>
									<TableCell>
										<div className="flex items-center gap-3">
											<Avatar className="size-8">
												<AvatarImage src={member.user.image || undefined} />
												<AvatarFallback className="text-[10px]">
													{member.user.name
														?.split(" ")
														.map((n: string) => n[0])
														.join("")
														.slice(0, 2)}
												</AvatarFallback>
											</Avatar>
											<div>
												<p className="font-medium">{member.user.name}</p>
												<p className="text-sm text-muted-foreground">
													{member.user.email}
												</p>
											</div>
										</div>
									</TableCell>
									<TableCell>
										<Badge variant={getRoleBadgeVariant(member.role)}>
											{member.role}
										</Badge>
									</TableCell>
									<TableCell className="text-right">
										{canManageMembers && member.role !== "owner" && (
											<DropdownMenu>
												<DropdownMenuTrigger
													render={
														<Button
															variant="ghost"
															size="icon"
															className="size-8"
														/>
													}
												>
													<IconDots className="size-4" />
												</DropdownMenuTrigger>
												<DropdownMenuContent align="end">
													<DropdownMenuItem disabled>
														<IconUser className="mr-2 size-4" />
														View Profile
													</DropdownMenuItem>
													{updatingMemberId === member.id ? (
														<DropdownMenuItem disabled>
															<IconLoader2 className="mr-2 size-4 animate-spin" />
															Updating...
														</DropdownMenuItem>
													) : (
														<>
															{member.role === "member" ? (
																<DropdownMenuItem
																	onClick={() =>
																		handleUpdateRole(member.id, "admin")
																	}
																>
																	Make Admin
																</DropdownMenuItem>
															) : (
																<DropdownMenuItem
																	onClick={() =>
																		handleUpdateRole(member.id, "member")
																	}
																>
																	Make Member
																</DropdownMenuItem>
															)}
														</>
													)}
													<DropdownMenuItem
														className="text-destructive focus:text-destructive"
														onClick={() =>
															handleRemoveMember(member.id, member.user.email)
														}
													>
														<IconTrash className="mr-2 size-4" />
														Remove
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										)}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</CardContent>
		</Card>
	);
}
