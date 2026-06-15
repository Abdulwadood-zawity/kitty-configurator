import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

export default function HomePage() {
  return (
    <main className="container py-12">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>
      <h1 className="text-5xl font-bold tracking-tight">Kitty Configurator</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        A visual configurator for the Kitty terminal emulator.
      </p>
      <div className="mt-8">
        <Button asChild>
          <Link href="/editor">Open Editor</Link>
        </Button>
      </div>
    </main>
  );
}
