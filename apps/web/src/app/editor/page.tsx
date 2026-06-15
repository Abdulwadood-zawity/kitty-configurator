import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function EditorPage() {
  return (
    <main className="container py-12">
      <div className="flex justify-between items-center">
        <Link href="/" className="text-sm text-muted-foreground hover:underline">
          ← Home
        </Link>
        <ThemeToggle />
      </div>
      <h1 className="mt-4 text-3xl font-bold">Editor</h1>
      <p className="mt-2 text-muted-foreground">Editor coming soon…</p>
    </main>
  );
}
