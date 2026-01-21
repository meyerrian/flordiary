import type { Metadata } from 'next';
import './globals.css';
import Notifications from '@/components/Notifications';
import { createClient } from '@/utils/supabase/server';
import { ThemeProvider } from '@/components/ThemeProvider';

export const metadata: Metadata = {
  title: 'Flor Diary',
  description: 'A private daily diary.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  let profile = null

  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    profile = data
  }

  return (



    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {profile && <Notifications reminderTime={profile.reminder_time_local} enabled={profile.reminder_enabled} />}
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
