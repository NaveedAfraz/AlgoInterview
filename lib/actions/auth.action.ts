"use server";
import { db, auth } from "@/firebase/admin";
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7;

export async function signUp(params: SignUpParams) {
  const { uid, email, password, name } = params;
  try {
    const userCredential = await db.collection("users").doc(uid).get();
    if (userCredential.exists) {
      return {
        success: false,
        message: "User already exists",
      };
    }
    await db.collection("users").doc(uid).set({
      name,
      email,
    });
    return {
      success: true,
      message: "User created successfully",
    };
  } catch (error: any) {
    if (error.code === "auth/email-already-in-use") {
      return {
        success: false,
        message: "Email already in use",
      };
    }
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function signIn(email: string, idToken: string) {
  try {
    const userRecord = await auth.verifyIdToken(idToken);
    console.log(userRecord);

    if (!userRecord) {
      return {
        success: false,
        message: "User not found",
      };
    }
    await setSessionCookie(idToken);

    return {
      success: true,
      message: "User signed in successfully",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Something went wrong",
    };
  }
}

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();
  const seesionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000,
  });
  cookieStore.set("session", seesionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_WEEK,
  });
}

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session")?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    //method to decoded the tokend and verfiy
    const userRecord = await auth.verifySessionCookie(sessionCookie, true);
    const user = await db.collection("users").doc(userRecord.uid).get();

    if (!user.exists) {
      return null;
    }

    return {
      name: user.data()?.name,
      email: user.data()?.email,
      id: userRecord.uid,
    } as User;
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user; //  "" -> !"" -> true -> !true -> false
}
