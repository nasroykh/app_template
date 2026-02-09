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
	FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { IconLoader2 } from "@tabler/icons-react";
import { orpc } from "@/lib/orpc";
import { toast } from "sonner";
import { userAtom } from "@/atoms/auth";
import { useAtomValue } from "jotai";
import { useMutation } from "@tanstack/react-query";

const profileSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.email("Invalid email address"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileTab() {
	const user = useAtomValue(userAtom);

	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			name: user?.name || "",
			email: user?.email || "",
		},
	});

	useEffect(() => {
		if (user) {
			form.reset({
				name: user.name,
				email: user.email,
			});
		}
	}, [user, form]);

	const updateProfileMutation = useMutation(
		orpc.auth.updateProfile.mutationOptions({
			onSuccess: () => {
				toast.success("Profile updated successfully");
			},
			onError: (error: any) => {
				toast.error(error.message || "Failed to update profile");
			},
		}),
	);

	const onSubmit = (values: ProfileFormValues) => {
		updateProfileMutation.mutate({ name: values.name });
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile Information</CardTitle>
				<CardDescription>
					Update your account details and how others see you
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
									<FormLabel>Full Name</FormLabel>
									<FormControl>
										<Input {...field} placeholder="Your name" />
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
										<Input {...field} disabled placeholder="Your email" />
									</FormControl>
									<FormDescription className="text-xs">
										Email cannot be changed directly. Contact support for
										assistance.
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex justify-end pt-2">
							<Button type="submit" disabled={updateProfileMutation.isPending}>
								{updateProfileMutation.isPending ? (
									<>
										<IconLoader2 className="mr-2 size-4 animate-spin" />
										Saving...
									</>
								) : (
									"Save Changes"
								)}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
