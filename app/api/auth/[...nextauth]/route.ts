import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Ambil data dari .env
        const adminEmail = process.env.KEISLAMAN_ADMIN_EMAIL;
        const adminPassword = process.env.KEISLAMAN_ADMIN_PASSWORD;

        // Cek apakah inputan user cocok dengan yang ada di .env
        if (
          credentials?.email === adminEmail &&
          credentials?.password === adminPassword
        ) {
          // Kalau cocok, kasih akses login
          return {
            id: "admin-keislaman",
            name: "Admin Keislaman",
            email: adminEmail,
            role: "ADMIN"
          };
        }
        
        // Kalau salah, tolak loginnya
        return null;
      }
    })
  ],
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };