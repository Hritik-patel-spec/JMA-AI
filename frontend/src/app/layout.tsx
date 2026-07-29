import type { Metadata } from "next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "JMA.AI Portal",
  description: "Jesus and Mary Academy AI Assistant",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Yahan Google Cloud Console se mila Client ID daalein
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID.1063841222163-3h977f0oe19c6men109jr2m1s36th8tj.apps.googleusercontent.com";

  return (
    <html lang="en">
      <body>
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}