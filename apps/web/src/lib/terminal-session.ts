/**
 * A realistic terminal "session" expressed as raw ANSI escape sequences.
 *
 * This is fed verbatim to xterm.js (which interprets the escapes exactly like a
 * real terminal would) so the live preview exercises true terminal rendering:
 * the 16 ANSI colors, bold / dim / italic / underline / reverse attributes, and
 * a themed prompt. The same bytes can be piped to a real kitty for comparison.
 */

const ESC = '\u001b';
const C = (n: string) => `${ESC}[${n}m`;

const reset = C('0');
const bold = C('1');
const dim = C('2');
const italic = C('3');
const underline = C('4');
const reverse = C('7');

// Foreground ANSI colors (map to palette color0..15 in kitty).
const fg = (n: number) => C(String(n < 8 ? 30 + n : 82 + n)); // 30-37, 90-97
const bg = (n: number) => C(String(n < 8 ? 40 + n : 92 + n)); // 40-47, 100-107

const CRLF = '\r\n';

function powerlinePrompt(branch: string): string {
  // A two-segment prompt with colored background blocks. We avoid Nerd-Font
  // powerline arrow glyphs (U+E0B0) because the browser may not have a patched
  // font — colored segments render correctly in every monospace font.
  return (
    `${bg(4)}${fg(0)}${bold} ~/dev/kitty-configurator ${reset}` +
    `${bg(2)}${fg(0)}${bold} ${branch} ${reset} `
  );
}

const lines: string[] = [
  // neofetch-style banner
  `${fg(4)}${bold}    _.._${reset}     ${fg(7)}${bold}user${reset}@${fg(4)}${bold}kitty${reset}   ${fg(2)}OS${reset}    kitty 0.47.3`,
  `${fg(4)}${bold}  .'    '.${reset}   ${fg(8)}${'-'.repeat(11)}${reset}   ${fg(2)}Shell${reset} zsh 5.9`,
  `${fg(4)}${bold}  | ${fg(3)}o  o${fg(4)} |${reset}                ${fg(2)}Term${reset}  xterm-kitty`,
  `${fg(4)}${bold}  '.____.'${reset}                ${fg(2)}Theme${reset} live-preview`,
  '',
  // ls --color output
  `${powerlinePrompt('main')}ls`,
  `${fg(4)}${bold}apps${reset}  ${fg(4)}${bold}packages${reset}  ${fg(6)}README.md${reset}  ` +
    `${fg(2)}${bold}build.sh${reset}  ${fg(7)}package.json${reset}  ${fg(5)}kitty.conf${reset}`,
  '',
  // git status
  `${powerlinePrompt('main')}git status`,
  `On branch ${fg(2)}main${reset}`,
  'Changes to be committed:',
  `  ${fg(2)}new file:   src/preview/terminal.tsx${reset}`,
  'Changes not staged for commit:',
  `  ${fg(1)}modified:   src/stores/config-store.ts${reset}`,
  `  ${fg(1)}deleted:    legacy/old-preview.tsx${reset}`,
  '',
  // text-attribute showcase
  `${powerlinePrompt('main')}styles`,
  `${bold}bold${reset}  ${dim}dim${reset}  ${italic}italic${reset}  ` +
    `${underline}underline${reset}  ${reverse} reverse ${reset}  ` +
    `${bold}${underline}${fg(3)}all${reset}`,
  // 16-color palette swatches (uses every palette entry)
  `${bg(0)}  ${bg(1)}  ${bg(2)}  ${bg(3)}  ${bg(4)}  ${bg(5)}  ${bg(6)}  ${bg(7)}  ${reset} normal  ` +
    `${bg(8)}  ${bg(9)}  ${bg(10)}  ${bg(11)}  ${bg(12)}  ${bg(13)}  ${bg(14)}  ${bg(15)}  ${reset} bright`,
  '',
  powerlinePrompt('main'),
];

/** The full demo session as a single CRLF-joined ANSI string. */
export const DEMO_SESSION = lines.join(CRLF);

// A compact prompt for the small split panes (no long path) so content fits
// in narrow columns without ugly wrapping.
const p = `${fg(2)}${bold}❯${reset} `;

/**
 * Short, distinct sessions for the individual panes shown in the multi-window
 * layout preview (kitty splits). Each is small enough to read inside a pane.
 */
export const PANE_SESSIONS: string[] = [
  // editor-ish
  [
    `${fg(4)}${bold}nvim${reset} ${dim}app.ts${reset}`,
    `${fg(8)} 1${reset} ${fg(5)}import${reset} { run }`,
    `${fg(8)} 2${reset} ${fg(5)}export${reset} ${fg(5)}fn${reset} ${fg(4)}main${reset}() {`,
    `${fg(8)} 3${reset}   ${fg(6)}run${reset}()`,
    `${fg(8)} 4${reset} }`,
    `${p}`,
  ].join(CRLF),
  // logs / server
  [
    `${p}pnpm dev`,
    `${fg(2)}ready${reset} on ${fg(4)}:3000${reset}`,
    `${fg(6)}GET${reset} /        ${fg(2)}200${reset}`,
    `${fg(6)}GET${reset} /editor  ${fg(2)}200${reset}`,
    `${fg(3)}warn${reset} slow 412ms`,
    `${p}`,
  ].join(CRLF),
  // git / status
  [
    `${p}git status -s`,
    `${fg(2)}A${reset}  layout.tsx`,
    `${fg(1)} M${reset} config.ts`,
    `${p}top`,
    `cpu ${fg(2)}12%${reset} mem ${fg(3)}48%${reset}`,
    `${p}`,
  ].join(CRLF),
  // misc / files
  [
    `${p}ls -la`,
    `${fg(4)}${bold}.${reset} ${fg(4)}${bold}..${reset} ${fg(6)}.gitignore${reset}`,
    `${fg(7)}README.md${reset}`,
    `${fg(5)}kitty.conf${reset}`,
    `${p}`,
  ].join(CRLF),
];
