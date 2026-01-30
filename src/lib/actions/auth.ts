import prisma from "@/lib/actions/prisma";
import bcrypt from "bcryptjs";

export async function signupUser(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Name is required." };
  if (!email) return { error: "Email is required." };
  if (!password || password.length < 6)
    return { error: "Password must be at least 6 characters." };

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists." };

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: { name, email, passwordHash: hashedPassword },
  });

  return { success: true };
}