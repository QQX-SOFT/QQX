import type { Metadata } from "next";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { deDE } from '@clerk/localizations'
import "./globals.css";

export const metadata: Metadata = {
    title: "QQX - Fleet Management SaaS",
    description: "Next-Gen Driver & Logistics Management",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ClerkProvider localization={deDE}>
            <html lang="de">
                <body className="antialiased font-sans bg-slate-50 text-slate-900">
                    <header className="flex justify-between items-center p-4 bg-white border-b shadow-sm sticky top-0 z-50">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">Q</div>
                            <h1 className="text-xl font-bold tracking-tight">QQX <span className="text-blue-600">Admin</span></h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Login</button>
                                </SignInButton>
                            </SignedOut>
                            <SignedIn>
                                <UserButton afterSignOutUrl="/" />
                            </SignedIn>
                        </div>
                    </header>
                    <main className="min-h-screen">
                        {children}
                    </main>
                </body>
            </html>
        </ClerkProvider>
    );
}
