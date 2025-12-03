import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    // Check if user is authenticated
    if (!session?.user) {
        redirect('/login');
    }

    // Check if user is admin
    // You can also use process.env.ADMIN_EMAIL if you want to make it configurable
    if (session.user.email !== 'huldil@icloud.com') {
        redirect('/dashboard');
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-black">
            {/* Admin Navigation could go here */}
            <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-8 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="font-bold text-xl">DomainLiq Admin</div>
                    <div className="flex gap-4 text-sm">
                        <a href="/admin/pending-domains" className="hover:text-blue-500">Pending Domains</a>
                        <a href="/admin/messages" className="hover:text-blue-500">Messages</a>
                        <a href="/dashboard" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">Exit to Dashboard</a>
                    </div>
                </div>
            </nav>
            <main>
                {children}
            </main>
        </div>
    );
}
