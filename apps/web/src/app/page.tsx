import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { Palette, Zap, Download, Github } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="container py-12">
      <div className="flex justify-end">
        <ThemeToggle />
      </div>
      <section className="max-w-3xl mx-auto text-center mt-8">
        <h1 className="text-5xl font-bold tracking-tight">Kitty Configurator</h1>
        <p className="mt-6 text-xl text-muted-foreground">
          A visual, browser-based configurator for the{' '}
          <a
            href="https://sw.kovidgoyal.net/kitty/"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            Kitty terminal emulator
          </a>
          . Pick a theme, tweak fonts and keybindings, and apply to your machine with one
          command.
        </p>
        <div className="mt-8 flex gap-3 justify-center flex-wrap">
          <Button asChild size="lg">
            <Link href="/editor">Open Editor</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <a
              href="https://github.com/Abdulwadood-zawity/kitty-configurator"
              target="_blank"
              rel="noreferrer"
            >
              <Github className="h-4 w-4 mr-2" /> View on GitHub
            </a>
          </Button>
        </div>
      </section>

      <section className="max-w-5xl mx-auto mt-20 grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          icon={<Palette className="h-6 w-6" />}
          title="Themes & colors"
          body="24 curated themes plus a full color editor for the 16 ANSI colors and the fg/bg/cursor/selection colors."
        />
        <FeatureCard
          icon={<Zap className="h-6 w-6" />}
          title="Live preview"
          body="See your changes instantly in a built-in terminal preview with the actual font, padding, and palette."
        />
        <FeatureCard
          icon={<Download className="h-6 w-6" />}
          title="One-line apply"
          body="We upload your config to a public URL. You run a single npx command. It backs up your existing kitty.conf first."
        />
      </section>

      <section className="max-w-3xl mx-auto mt-20">
        <h2 className="text-2xl font-semibold">Quick start</h2>
        <ol className="mt-4 space-y-3 text-muted-foreground list-decimal list-inside">
          <li>
            Open the <Link href="/editor" className="underline text-foreground">editor</Link> and
            customize your settings.
          </li>
          <li>Click <strong>Apply to my Kitty</strong> at the bottom of the editor.</li>
          <li>
            Copy the <code className="px-1 py-0.5 rounded bg-muted">npx kitty-configurator install …</code> command
            and run it in your terminal.
          </li>
          <li>
            Reload Kitty with <kbd className="px-1 py-0.5 rounded bg-muted">Ctrl+Shift+F5</kbd>.
          </li>
        </ol>
      </section>

      <footer className="mt-20 text-center text-sm text-muted-foreground">
        <p>
          Open source on{' '}
          <a
            href="https://github.com/Abdulwadood-zawity/kitty-configurator"
            target="_blank"
            rel="noreferrer"
            className="underline"
          >
            GitHub
          </a>
          . MIT licensed.
        </p>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}
