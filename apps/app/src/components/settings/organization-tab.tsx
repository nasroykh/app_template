import { useEffect } from "react";
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
import { IconLoader2 } from "@tabler/icons-react";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { roleAtom } from "@/atoms/auth";
import { useAtomValue } from "jotai";
import { useMutation, useQuery } from "@tanstack/react-query";

const orgSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	slug: z.string().min(2, "Slug must be at least 2 characters"),
});

type OrgFormValues = z.infer<typeof orgSchema>;

export function OrganizationTab() {
	const $role = useAtomValue(roleAtom);

	const form = useForm<OrgFormValues>({
		resolver: zodResolver(orgSchema),
		defaultValues: {
			name: "",
			slug: "",
		},
	});

	// Fetch current organization
	const orgQuery = useQuery(
		orpc.organization.getFullOrganization.queryOptions(),
	);

	useEffect(() => {
		if (orgQuery.data) {
			form.reset({
				name: orgQuery.data.name,
				slug: orgQuery.data.slug,
			});
		}
	}, [orgQuery.data, form]);

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

	return (
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
