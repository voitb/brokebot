"use client";

import React, { useActionState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/providers/AuthProvider";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
});

type FormValues = z.infer<typeof formSchema>;
type State = {
  error: string;
  success: boolean;
  submittedEmail: string;
};

export function ForgotPasswordForm({ className }: React.ComponentProps<"div">) {
  const { sendPasswordReset } = useAuth();

  const sendPasswordResetAction = async (
    _state: State,
    values: FormValues
  ): Promise<State> => {
    try {
      await sendPasswordReset(values.email);
      return { success: true, error: "", submittedEmail: values.email };
    } catch (err) {
      if (err instanceof Error) {
        return { success: false, error: err.message, submittedEmail: "" };
      }
      return {
        success: false,
        error: "An unexpected error occurred.",
        submittedEmail: "",
      };
    }
  };

  const [state, formAction, isPending] = useActionState(
    sendPasswordResetAction,
    {
      error: "",
      success: false,
      submittedEmail: "",
    }
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    formAction(values);
  };

  if (state.success) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-xl font-bold">Check your inbox</h1>
        <p className="text-muted-foreground">
          We've sent a password reset link to{" "}
          <strong>{state.submittedEmail}</strong>. Please follow the
          instructions in the email to reset your password.
        </p>
        <Button asChild>
          <Link to="/login">Back to Login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col items-center gap-2">
                  <Link to="/" className="flex items-center gap-2 font-semibold">
            <Logo showText size="md" />
          </Link>
        <p className="text-sm text-muted-foreground">
          Enter your email to reset your password.
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="m@example.com"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {state.error && <p className="text-sm text-red-500">{state.error}</p>}
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
      </Form>
      <div className="text-center text-sm">
        <Link
          to="/login"
          className="underline underline-offset-4 hover:text-primary"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}
