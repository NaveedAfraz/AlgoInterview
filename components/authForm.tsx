"use client";

import { object, z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import React from "react";
import Image from "next/image";
import FormFields from "./formFields";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/firebase/client";
import { signUp } from "@/lib/actions/auth.action";
import { signIn } from "@/lib/actions/auth.action";

type authProps = {
  type: string;
};

const authFormSchema = (type: string) => {
  console.log(type);
  return z.object({
    name:
      type === "sign-up" ? z.string().min(2).max(50) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(6),
  });
};

function AuthForm({ type }: authProps) {
  const router = useRouter();
  const isSignin = type === "sign-in";
  const formSchema = authFormSchema(type);
  console.log(formSchema);
  // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    console.log(type);
    try {
      if (type === "sign-in") {
        console.log("Sign in", values);
        const { email, password } = values;
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const idToken = await userCredential.user?.getIdToken();
        console.log(idToken);
        if (!idToken) {
          toast.error("Sign in failed");
          return;
        }
        const result = await signIn(email, idToken);
        console.log(result);
        if (!result?.success) {
          toast.error(result?.message);
          return;
        }
        toast("Sign in successfully");
        router.push("/");
      } else {
        const { name, email, password } = values;
        console.log("Sign up", values);

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const result = await signUp({
          uid: userCredential.user?.uid,
          name: name || "",
          email,
          password,
        });
        console.log(result);

        if (!result?.success) {
          toast.error(result?.message);
          return;
        }
        toast("Sign up successfully");
        router.push("/signIn");
      }
    } catch (error) {
      console.log(error);
      toast.error(`There was an error : ${error}`);
    }
  }
  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-6 card py-14 px-10">
        <div className="flex felx-row gap-2 justify-center">
          <Image src="/logo.svg" alt="logo" width={38} height={32} />
          <h2 className="text-primary-100 font-bold text-2xl">Ai Interview</h2>
        </div>
        <h3 className="text-center text-primary-100">
          Pratice job interview questions
        </h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignin && (
              <FormFields
                control={form.control}
                name="name"
                label="Name"
                type="text"
                placeholder="Enter your name"
              />
            )}
            <FormFields
              control={form.control}
              name="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
            />
            <FormFields
              control={form.control}
              name="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
            />

            <Button className="btn" type="submit">
              {isSignin ? "Sign In" : "Create an Account"}
            </Button>
          </form>
          <p className="text-center">
            {isSignin ? "No Account yet" : "have a account?"}
            <Link
              href={!isSignin ? "/signIn" : "/signUp"}
              className="font-bold text-user-primary ml-1"
            >
              {!isSignin ? "Sign In" : "Create an Account"}
            </Link>
          </p>
        </Form>
      </div>
    </div>
  );
}

export default AuthForm;
