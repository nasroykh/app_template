import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
	IconPlus,
	IconSearch,
	IconChecks,
	IconShieldCheck,
	IconBan,
	IconTrash,
	IconDots,
	IconUser,
	IconKey,
	IconGhost,
	IconLoader2,
	IconChevronLeft,
	IconChevronRight,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { orpc } from "@/lib/orpc";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export function UsersTab() {
	const [limit] = useState(10);
	const [offset, setOffset] = useState(0);
	const [searchValue, setSearchValue] = useState("");
	const [searchField, setSearchField] = useState<"name" | "email">("name");

	const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

	// Queries
	const queryClient = useQueryClient();
	const { data, isLoading } = useQuery(
		orpc.users.listUsers.queryOptions({
			input: {
				limit,
				offset,
				searchValue: searchValue || undefined,
				searchField,
				searchOperator: "contains",
			},
		}),
	);

	// Mutations
	const deleteUserMutation = useMutation(
		orpc.users.deleteUser.mutationOptions({
			onSuccess: () => {
				toast.success("User deleted successfully");
				queryClient.invalidateQueries({
					queryKey: orpc.users.listUsers.key(),
				});
			},
			onError: (error: any) => {
				toast.error(error.message || "Failed to delete user");
			},
		}),
	);

	const impersonateMutation = useMutation(
		orpc.users.impersonateUser.mutationOptions({
			onSuccess: (data: any) => {
				toast.success(`Now impersonating ${data.user.name}`);
				window.location.reload();
			},
			onError: (error: any) => {
				toast.error(error.message || "Impersonation failed");
			},
		}),
	);

	const unbanMutation = useMutation(
		orpc.users.unbanUser.mutationOptions({
			onSuccess: () => {
				toast.success("User unbanned");
				queryClient.invalidateQueries({
					queryKey: orpc.users.listUsers.key(),
				});
			},
			onError: (error: any) => {
				toast.error(error.message || "Failed to unban user");
			},
		}),
	);

	const bulkDeleteMutation = useMutation(
		orpc.users.bulkDeleteUsers.mutationOptions({
			onSuccess: (res: any) => {
				toast.success(res.message);
				setSelectedUserIds([]);
				queryClient.invalidateQueries({
					queryKey: orpc.users.listUsers.key(),
				});
			},
			onError: (error: any) => {
				toast.error(error.message || "Bulk delete failed");
			},
		}),
	);

	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [isEditOpen, setIsEditOpen] = useState(false);
	const [isPasswordOpen, setIsPasswordOpen] = useState(false);
	const [isBanOpen, setIsBanOpen] = useState(false);
	const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
	const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);
	const [isBulkRoleOpen, setIsBulkRoleOpen] = useState(false);
	const [isBulkBanOpen, setIsBulkBanOpen] = useState(false);

	const [editingUser, setEditingUser] = useState<any>(null);
	const [passwordUser, setPasswordUser] = useState<any>(null);
	const [banUserObj, setBanUserObj] = useState<any>(null);
	const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

	const toggleSelectUser = (userId: string) => {
		setSelectedUserIds((prev) =>
			prev.includes(userId)
				? prev.filter((id) => id !== userId)
				: [...prev, userId],
		);
	};

	const toggleSelectAll = () => {
		if (selectedUserIds.length === data?.users.length) {
			setSelectedUserIds([]);
		} else {
			setSelectedUserIds(data?.users.map((u: any) => u.id) || []);
		}
	};

	const handleBulkDelete = async () => {
		await bulkDeleteMutation.mutateAsync({ userIds: selectedUserIds });
		setIsBulkDeleteConfirmOpen(false);
	};

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0">
					<div>
						<CardTitle>Users Management</CardTitle>
						<CardDescription>
							Manage all system users and their permissions
						</CardDescription>
					</div>
					<Button onClick={() => setIsCreateOpen(true)} className="gap-2">
						<IconPlus className="size-4" />
						Create User
					</Button>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-4 mb-6">
						<div className="relative flex-1">
							<IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
							<Input
								placeholder="Search users..."
								value={searchValue}
								onChange={(e) => setSearchValue(e.target.value)}
								className="pl-10"
							/>
						</div>
						<div className="flex gap-2">
							<Select
								value={searchField}
								onValueChange={(v) => setSearchField(v as any)}
							>
								<SelectTrigger className="w-[140px]">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="name">Name</SelectItem>
									<SelectItem value="email">Email</SelectItem>
								</SelectContent>
							</Select>
							{selectedUserIds.length > 0 && (
								<DropdownMenu>
									<DropdownMenuTrigger
										render={<Button variant="outline" className="gap-2" />}
									>
										<IconChecks className="size-4" />
										Bulk Actions ({selectedUserIds.length})
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DropdownMenuItem onClick={() => setIsBulkRoleOpen(true)}>
											<IconShieldCheck className="mr-2 size-4" />
											Change Role
										</DropdownMenuItem>
										<DropdownMenuItem onClick={() => setIsBulkBanOpen(true)}>
											<IconBan className="mr-2 size-4" />
											Ban Users
										</DropdownMenuItem>
										<DropdownMenuItem
											className="text-destructive focus:text-destructive"
											onClick={() => setIsBulkDeleteConfirmOpen(true)}
										>
											<IconTrash className="mr-2 size-4" />
											Delete Users
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>
					</div>

					<div className="rounded-md border border-input overflow-hidden">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-[50px]">
										<Checkbox
											checked={
												(data?.users?.length ?? 0) > 0 &&
												selectedUserIds.length === data?.users?.length
											}
											onCheckedChange={toggleSelectAll}
										/>
									</TableHead>
									<TableHead>User</TableHead>
									<TableHead>Role</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Joined</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{isLoading ? (
									Array.from({ length: 5 }).map((_, i) => (
										<TableRow key={i}>
											<TableCell>
												<Skeleton className="h-4 w-4" />
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-3">
													<Skeleton className="size-9 rounded-full" />
													<div className="space-y-1">
														<Skeleton className="h-4 w-24" />
														<Skeleton className="h-3 w-32" />
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Skeleton className="h-6 w-16" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-6 w-16" />
											</TableCell>
											<TableCell>
												<Skeleton className="h-4 w-24" />
											</TableCell>
											<TableCell className="text-right">
												<Skeleton className="h-8 w-8 ml-auto" />
											</TableCell>
										</TableRow>
									))
								) : !data?.users || data.users.length === 0 ? (
									<TableRow>
										<TableCell
											colSpan={6}
											className="h-24 text-center text-muted-foreground"
										>
											No users found
										</TableCell>
									</TableRow>
								) : (
									data.users.map((user: any) => (
										<TableRow key={user.id}>
											<TableCell>
												<Checkbox
													checked={selectedUserIds.includes(user.id)}
													onCheckedChange={() => toggleSelectUser(user.id)}
												/>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-3">
													<Avatar className="size-9 border">
														<AvatarImage src={user.image} />
														<AvatarFallback className="bg-primary/5 text-primary text-xs">
															{user.name?.charAt(0).toUpperCase()}
														</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium">{user.name}</p>
														<p className="text-xs text-muted-foreground">
															{user.email}
														</p>
													</div>
												</div>
											</TableCell>
											<TableCell>
												<Badge
													variant={
														user.role === "admin" ? "default" : "secondary"
													}
													className="capitalize"
												>
													{user.role}
												</Badge>
											</TableCell>
											<TableCell>
												{user.banned ? (
													<Badge variant="destructive" className="gap-1">
														<IconCircleOff className="size-3" />
														Banned
													</Badge>
												) : (
													<Badge
														variant="outline"
														className="text-emerald-600 border-emerald-200 bg-emerald-50"
													>
														Active
													</Badge>
												)}
											</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{format(new Date(user.createdAt), "MMM d, yyyy")}
											</TableCell>
											<TableCell className="text-right">
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
													<DropdownMenuContent align="end" className="w-48">
														<DropdownMenuItem
															onClick={() => {
																setEditingUser(user);
																setIsEditOpen(true);
															}}
														>
															<IconUser className="mr-2 size-4" />
															Edit Details
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() => {
																setPasswordUser(user);
																setIsPasswordOpen(true);
															}}
														>
															<IconKey className="mr-2 size-4" />
															Reset Password
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																impersonateMutation.mutate({ userId: user.id })
															}
														>
															<IconGhost className="mr-2 size-4" />
															Impersonate
														</DropdownMenuItem>
														<Separator className="my-1" />
														{user.banned ? (
															<DropdownMenuItem
																onClick={() =>
																	unbanMutation.mutate({ userId: user.id })
																}
															>
																<IconUserCheck className="mr-2 size-4" />
																Unban User
															</DropdownMenuItem>
														) : (
															<DropdownMenuItem
																className="text-orange-600 focus:text-orange-600"
																onClick={() => {
																	setBanUserObj(user);
																	setIsBanOpen(true);
																}}
															>
																<IconBan className="mr-2 size-4" />
																Ban User
															</DropdownMenuItem>
														)}
														<DropdownMenuItem
															className="text-destructive focus:text-destructive"
															onClick={() => {
																setDeletingUserId(user.id);
																setIsDeleteConfirmOpen(true);
															}}
														>
															<IconTrash className="mr-2 size-4" />
															Delete User
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</TableCell>
										</TableRow>
									))
								)}
							</TableBody>
						</Table>
					</div>

					{/* Pagination */}
					{!isLoading && data?.total && data.total > limit ? (
						<div className="flex items-center justify-between mt-4">
							<p className="text-sm text-muted-foreground">
								Showing {offset + 1} to {Math.min(offset + limit, data.total)}{" "}
								of {data.total} users
							</p>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									disabled={offset === 0}
									onClick={() => setOffset(Math.max(0, offset - limit))}
								>
									<IconChevronLeft className="size-4 mr-1" />
									Previous
								</Button>
								<Button
									variant="outline"
									size="sm"
									disabled={offset + limit >= data.total}
									onClick={() => setOffset(offset + limit)}
								>
									Next
									<IconChevronRight className="size-4 ml-1" />
								</Button>
							</div>
						</div>
					) : null}
				</CardContent>
			</Card>

			{/* Dialogs */}
			<CreateUserDialog
				open={isCreateOpen}
				setOpen={setIsCreateOpen}
				onSuccess={() =>
					queryClient.invalidateQueries({
						queryKey: orpc.users.listUsers.key(),
					})
				}
			/>

			{editingUser && (
				<EditUserDialog
					open={isEditOpen}
					setOpen={setIsEditOpen}
					user={editingUser}
					onSuccess={() =>
						queryClient.invalidateQueries({
							queryKey: orpc.users.listUsers.key(),
						})
					}
				/>
			)}

			{passwordUser && (
				<ResetPasswordDialog
					open={isPasswordOpen}
					setOpen={setIsPasswordOpen}
					user={passwordUser}
				/>
			)}

			{banUserObj && (
				<BanUserDialog
					open={isBanOpen}
					setOpen={setIsBanOpen}
					user={banUserObj}
					onSuccess={() =>
						queryClient.invalidateQueries({
							queryKey: orpc.users.listUsers.key(),
						})
					}
				/>
			)}

			<BulkRoleDialog
				open={isBulkRoleOpen}
				setOpen={setIsBulkRoleOpen}
				userIds={selectedUserIds}
				onSuccess={() => {
					setSelectedUserIds([]);
					queryClient.invalidateQueries({
						queryKey: orpc.users.listUsers.key(),
					});
				}}
			/>

			<BulkBanDialog
				open={isBulkBanOpen}
				setOpen={setIsBulkBanOpen}
				userIds={selectedUserIds}
				onSuccess={() => {
					setSelectedUserIds([]);
					queryClient.invalidateQueries({
						queryKey: orpc.users.listUsers.key(),
					});
				}}
			/>

			<AlertDialog
				open={isDeleteConfirmOpen}
				onOpenChange={setIsDeleteConfirmOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
						<AlertDialogDescription>
							This action cannot be undone. This will permanently delete the
							user account and remove their data from our servers.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={deleteUserMutation.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={deleteUserMutation.isPending}
							onClick={async (e) => {
								e.preventDefault();
								if (deletingUserId) {
									await deleteUserMutation.mutateAsync({
										userId: deletingUserId,
									});
									setIsDeleteConfirmOpen(false);
									setDeletingUserId(null);
								}
							}}
						>
							{deleteUserMutation.isPending ? "Deleting..." : "Delete User"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			<AlertDialog
				open={isBulkDeleteConfirmOpen}
				onOpenChange={setIsBulkDeleteConfirmOpen}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>
							Delete {selectedUserIds.length} users?
						</AlertDialogTitle>
						<AlertDialogDescription>
							This will permanently delete all selected user accounts. This
							action is irreversible.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={bulkDeleteMutation.isPending}>
							Cancel
						</AlertDialogCancel>
						<AlertDialogAction
							className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
							disabled={bulkDeleteMutation.isPending}
							onClick={handleBulkDelete}
						>
							{bulkDeleteMutation.isPending
								? "Deleting..."
								: "Delete All Selected"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}

// Sub-components (Dialogs)
const createUserSchema = z.object({
	email: z.email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	name: z.string().min(1, "Name is required"),
	role: z.enum(["admin", "user"]),
});

function CreateUserDialog({
	open,
	setOpen,
	onSuccess,
}: {
	open: boolean;
	setOpen: (v: boolean) => void;
	onSuccess: () => void;
}) {
	const form = useForm({
		resolver: zodResolver(createUserSchema),
		defaultValues: { email: "", password: "", name: "", role: "user" as const },
	});

	const mutation = useMutation(
		orpc.users.createUser.mutationOptions({
			onSuccess: () => {
				toast.success("User created successfully");
				setOpen(false);
				form.reset();
				onSuccess();
			},
			onError: (err: any) => toast.error(err.message),
		}),
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create New User</DialogTitle>
					<DialogDescription>Add a new user to the system</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
						className="space-y-4 py-4"
					>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Jane Doe" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Email Address</FormLabel>
									<FormControl>
										<Input
											{...field}
											type="email"
											placeholder="jane@example.com"
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Initial Password</FormLabel>
									<FormControl>
										<Input {...field} type="password" placeholder="••••••••" />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="role"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Role</FormLabel>
									<Select value={field.value} onValueChange={field.onChange}>
										<FormControl>
											<SelectTrigger>
												<SelectValue />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="user">User</SelectItem>
											<SelectItem value="admin">Admin</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>
						<DialogFooter className="pt-4">
							<Button
								variant="outline"
								type="button"
								onClick={() => setOpen(false)}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={mutation.isPending}>
								{mutation.isPending && (
									<IconLoader2 className="mr-2 size-4 animate-spin" />
								)}
								Create User
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}

function EditUserDialog({
	open,
	setOpen,
	user,
	onSuccess,
}: {
	open: boolean;
	setOpen: (v: boolean) => void;
	user: any;
	onSuccess: () => void;
}) {
	const form = useForm({
		defaultValues: { name: user?.name || "", email: user?.email || "" },
	});

	const updateMutation = useMutation(
		orpc.users.updateUser.mutationOptions({
			onSuccess: () => {
				toast.success("User updated successfully");
				setOpen(false);
				onSuccess();
			},
			onError: (err: any) => toast.error(err.message),
		}),
	);

	const roleMutation = useMutation(
		orpc.users.setUserRole.mutationOptions({
			onSuccess: () => {
				toast.success("Role updated successfully");
				setOpen(false);
				onSuccess();
			},
			onError: (err: any) => toast.error(err.message),
		}),
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit User: {user?.name}</DialogTitle>
					<DialogDescription>
						Update user profile and account settings
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-6 py-4">
					<Form {...form}>
						<form
							onSubmit={form.handleSubmit((v) =>
								updateMutation.mutate({ userId: user.id, data: v }),
							)}
							className="space-y-4"
						>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input {...field} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<Input {...field} type="email" />
										</FormControl>
									</FormItem>
								)}
							/>
							<Button
								type="submit"
								disabled={updateMutation.isPending}
								className="w-full"
							>
								{updateMutation.isPending && (
									<IconLoader2 className="mr-2 size-4 animate-spin" />
								)}
								Update Profile
							</Button>
						</form>
					</Form>

					<Separator />

					<div className="space-y-2">
						<FormLabel>Account Role</FormLabel>
						<Select
							defaultValue={
								Array.isArray(user?.role) ? user.role[0] : user?.role
							}
							onValueChange={(r) =>
								roleMutation.mutate({ userId: user.id, role: r as any })
							}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="user">User</SelectItem>
								<SelectItem value="admin">Admin</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function ResetPasswordDialog({
	open,
	setOpen,
	user,
}: {
	open: boolean;
	setOpen: (v: boolean) => void;
	user: any;
}) {
	const [password, setPassword] = useState("");
	const mutation = useMutation(
		orpc.users.setUserPassword.mutationOptions({
			onSuccess: () => {
				toast.success(`Password updated for ${user.name}`);
				setOpen(false);
				setPassword("");
			},
			onError: (err: any) => toast.error(err.message),
		}),
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Reset Password</DialogTitle>
					<DialogDescription>
						Set a new password for {user?.name}
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<FormLabel>New Password</FormLabel>
						<Input
							type="password"
							placeholder="Min 8 characters"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button
							disabled={password.length < 8 || mutation.isPending}
							onClick={() =>
								mutation.mutate({ userId: user.id, newPassword: password })
							}
						>
							{mutation.isPending && (
								<IconLoader2 className="mr-2 size-4 animate-spin" />
							)}
							Update Password
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function BanUserDialog({
	open,
	setOpen,
	user,
	onSuccess,
}: {
	open: boolean;
	setOpen: (v: boolean) => void;
	user: any;
	onSuccess: () => void;
}) {
	const [reason, setReason] = useState("");
	const mutation = useMutation(
		orpc.users.banUser.mutationOptions({
			onSuccess: () => {
				toast.success("User banned successfully");
				setOpen(false);
				onSuccess();
			},
			onError: (err: any) => toast.error(err.message),
		}),
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-destructive">
						Ban User: {user?.name}
					</DialogTitle>
					<DialogDescription>
						The user will be immediately logged out and prevented from signing
						in.
					</DialogDescription>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<div className="space-y-2">
						<FormLabel>Ban Reason (Optional)</FormLabel>
						<Textarea
							placeholder="e.g. Terms of service violation, Payment issues..."
							value={reason}
							onChange={(e) => setReason(e.target.value)}
						/>
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							disabled={mutation.isPending}
							onClick={() =>
								mutation.mutate({ userId: user.id, banReason: reason })
							}
						>
							{mutation.isPending && (
								<IconLoader2 className="mr-2 size-4 animate-spin" />
							)}
							Confirm Ban
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function BulkRoleDialog({
	open,
	setOpen,
	userIds,
	onSuccess,
}: {
	open: boolean;
	setOpen: (v: boolean) => void;
	userIds: string[];
	onSuccess: () => void;
}) {
	const [role, setRole] = useState<"admin" | "user">("user");
	const mutation = useMutation(
		orpc.users.bulkSetUserRole.mutationOptions({
			onSuccess: (res: any) => {
				toast.success(res.message);
				setOpen(false);
				onSuccess();
			},
			onError: (err: any) => toast.error(err.message),
		}),
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Update Role for {userIds.length} users</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<Select value={role} onValueChange={(v) => setRole(v as any)}>
						<SelectTrigger>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="user">User</SelectItem>
							<SelectItem value="admin">Admin</SelectItem>
						</SelectContent>
					</Select>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button
							onClick={() => mutation.mutate({ userIds, role })}
							disabled={mutation.isPending}
						>
							{mutation.isPending && (
								<IconLoader2 className="mr-2 size-4 animate-spin" />
							)}
							Update All
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}

function BulkBanDialog({
	open,
	setOpen,
	userIds,
	onSuccess,
}: {
	open: boolean;
	setOpen: (v: boolean) => void;
	userIds: string[];
	onSuccess: () => void;
}) {
	const [reason, setReason] = useState("");
	const mutation = useMutation(
		orpc.users.bulkBanUsers.mutationOptions({
			onSuccess: (res: any) => {
				toast.success(res.message);
				setOpen(false);
				onSuccess();
			},
			onError: (err: any) => toast.error(err.message),
		}),
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Ban {userIds.length} users?</DialogTitle>
				</DialogHeader>
				<div className="space-y-4 py-4">
					<FormLabel>Ban Reason</FormLabel>
					<Textarea
						placeholder="Optional reason for bulk ban..."
						value={reason}
						onChange={(e) => setReason(e.target.value)}
					/>
					<DialogFooter>
						<Button variant="outline" onClick={() => setOpen(false)}>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => mutation.mutate({ userIds, banReason: reason })}
							disabled={mutation.isPending}
						>
							{mutation.isPending && (
								<IconLoader2 className="mr-2 size-4 animate-spin" />
							)}
							Confirm Bulk Ban
						</Button>
					</DialogFooter>
				</div>
			</DialogContent>
		</Dialog>
	);
}

// Icons and Helpers
const IconUserCheck = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
		<circle cx="9" cy="7" r="4" />
		<polyline points="16 11 18 13 22 9" />
	</svg>
);

const IconCircleOff = ({ className }: { className?: string }) => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		strokeWidth="2"
		strokeLinecap="round"
		strokeLinejoin="round"
		className={className}
	>
		<circle cx="12" cy="12" r="10" />
		<path d="m4.9 4.9 14.2 14.2" />
	</svg>
);

const Textarea = ({ ...props }: React.ComponentProps<"textarea">) => (
	<textarea
		className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
		{...props}
	/>
);
