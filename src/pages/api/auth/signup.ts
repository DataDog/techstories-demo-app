// pages/api/auth/signup.ts
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { prisma } from "~/server/db";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { firstName, lastName, email, password } = req.body;

  // Check if the user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({ message: 'User already exists' }); // Conflict
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create the new user
  const newUser = await prisma.user.create({
    data: {
      name: `${firstName} ${lastName}`,
      email,
      password: hashedPassword,
    },
  });

  return res.status(201).json(newUser); 
};