import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export default NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Add your authentication logic here
        if (credentials?.username === "admin" && credentials?.password === "admin") {
          return { id: "1", name: "Admin" };
        }
        return null;
      }
    })
  ],
}); 