import { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { IconLoader2, IconCheck } from "@tabler/icons-react";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth";
import { useMutation } from "@tanstack/react-query";

const orgSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	slug: z.string().min(2, "Slug must be at least 2 characters"),
});

type OrgFormValues = z.infer<typeof orgSchema>;

export function OrganizationTab() {
	const { data: sessionData } = useSession();
	const { data: activeOrg } = authClient.useActiveOrganization();
	const { data: organizations } = authClient.useListOrganizations();
	const [isSwitching, setIsSwitching] = useState(false);

	// Debug logging
	console.log("[OrganizationTab] Session:", sessionData);
	console.log("[OrganizationTab] Active Org:", activeOrg);
	console.log("[OrganizationTab] All Organizations:", organizations);

	const $role = activeOrg?.members?.find(
		(m) => m.userId === sessionData?.user?.id,
	)?.role;

	const form = useForm<OrgFormValues>({
		resolver: zodResolver(orgSchema),
		defaultValues: {
			name: "",
			slug: "",
		},
	});

	useEffect(() => {
		if (activeOrg) {
			form.reset({
				name: activeOrg.name,
				slug: activeOrg.slug,
			});
		}
	}, [activeOrg, form]);

	const updateOrgMutation = useMutation(
		orpc.organization.update.mutationOptions({
			onSuccess: () => {
				toast.success("Organization updated successfully");
			},
			onError: (error: any) => {
				toast.error(error.message || "Failed to update organization");
			},
		}),
	);

	const onSubmit = (values: OrgFormValues) => {
		updateOrgMutation.mutate({
			name: values.name,
			slug: values.slug,
		});
	};

	const handleSwitchOrganization = async (organizationId: string) => {
		if (organizationId === activeOrg?.id) return;

		setIsSwitching(true);
		try {
			await authClient.organization.setActive({
				organizationId,
			});

			// Refetch session to get updated active organization
			await authClient.getSession();

			toast.success("Organization switched successfully");
		} catch (error: any) {
			toast.error(error.message || "Failed to switch organization");
		} finally {
			setIsSwitching(false);
		}
	};

	return (
		<div className="space-y-6">
			{/* Organization Switcher */}
			{organizations && organizations.length > 1 && (
				<Card>
					<CardHeader>
						<CardTitle>Switch Organization</CardTitle>
						<CardDescription>
							Select which organization you want to work with
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid gap-2">
							{organizations.map((org) => {
								const isActive = org.id === activeOrg?.id;
								return (
									<button
										key={org.id}
										onClick={() => handleSwitchOrganization(org.id)}
										disabled={isSwitching || isActive}
										className={`flex items-center justify-between rounded-lg border p-4 text-left transition-colors hover:bg-accent disabled:opacity-50 ${
											isActive ? "border-primary bg-accent" : ""
										}`}
									>
										<div className="flex-1">
											<div className="flex items-center gap-2">
												<p className="font-medium">{org.name}</p>
												{isActive && (
													<Badge variant="default" className="gap-1">
														<IconCheck className="size-3" />
														Active
													</Badge>
												)}
											</div>
											<p className="text-sm text-muted-foreground">
												{org.slug}
											</p>
										</div>
										{isSwitching && !isActive && (
											<IconLoader2 className="size-4 animate-spin text-muted-foreground" />
										)}
									</button>
								);
							})}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Organization Settings */}
			<Card>
				<CardHeader>
					<CardTitle>Organization Settings</CardTitle>
					<CardDescription>
						Update your organization details and workspace settings
					</CardDescription>
				</CardHeader>
				<CardContent>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Organization Name</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Acme Inc." />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="slug"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Workspace Slug</FormLabel>
									<FormControl>
										<Input {...field} placeholder="acme-inc" />
									</FormControl>
									<FormDescription className="text-xs">
										The URL-friendly name for your workspace
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						{$role === "owner" && (
							<div className="flex justify-end pt-2">
								<Button type="submit" disabled={updateOrgMutation.isPending}>
									{updateOrgMutation.isPending ? (
										<>
											<IconLoader2 className="mr-2 size-4 animate-spin" />
											Saving...
										</>
									) : (
										"Save Changes"
									)}
								</Button>
							</div>
						)}
					</form>
				</Form>
			</CardContent>
		</Card>
		</div>
	);
}

function FormDescription({
	children,
	className,
}: {
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<p className={`text-[0.8rem] text-muted-foreground ${className}`}>
			{children}
		</p>
	);
}
