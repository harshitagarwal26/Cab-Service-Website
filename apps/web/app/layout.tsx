import "./globals.css";
    import { getServerSession } from "next-auth";
    import SessionProvider from "../components/auth/SessionProvider";
    import UserNav from "../components/auth/UserNav";
    import Link from "next/link";

    export const metadata = { title: "CabPrime", description: "Book premium cabs easily" };

    export default async function RootLayout({ children }: { children: React.ReactNode }) {
      const session = await getServerSession();

      return (
        <html lang="en">
          <body className="min-h-screen bg-gray-50">
            <SessionProvider session={session}>
              <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                  <div className="flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">C</span>
                      </div>
                      <span className="text-xl font-bold text-gray-900 tracking-tight">CabPrime</span>
                    </Link>
                    
                    <div className="flex items-center gap-6">
                      <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                        <Link href="/" className="text-gray-600 hover:text-blue-600 transition">Home</Link>
                        <Link href="/about" className="text-gray-600 hover:text-blue-600 transition">About</Link>
                        <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition">Contact</Link>
                      </nav>
                      <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
                      <UserNav />
                    </div>
                  </div>
                </div>
              </header>
              <main>{children}</main>
            </SessionProvider>
          </body>
        </html>
      );
    }