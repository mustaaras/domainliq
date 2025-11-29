import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

async function getUser(email: string) {
    try {
        const user = await db.user.findUnique({ where: { email } });
        return user;
    } catch (error) {
        console.error('Failed to fetch user:', error);
        throw new Error('Failed to fetch user.');
    }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                console.log('Authorize called with:', credentials?.email);
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    console.log('Credentials parsed successfully for:', email);

                    const user = await getUser(email);
                    if (!user) {
                        console.log('User not found:', email);
                        return null;
                    }

                    console.log('User found, verifying password...');
                    const passwordsMatch = await bcrypt.compare(password, user.password);

                    if (passwordsMatch) {
                        console.log('Password verified for:', email);
                        return user;
                    } else {
                        console.log('Password mismatch for:', email);
                    }
                } else {
                    console.log('Invalid credentials format');
                }

                console.log('Invalid credentials');
                return null;
            },
        }),
    ],
});
