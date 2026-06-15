import readline from 'node:readline';

/**
 * Prompt the user for free-form input on stdin.
 * Returns the trimmed answer, or empty string if stdin is not a TTY.
 */
export async function prompt(question: string): Promise<string> {
  if (!process.stdin.isTTY) {
    return '';
  }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise<string>((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/**
 * Ask a yes/no question. Returns true for "y" or "yes", false otherwise.
 */
export async function promptYesNo(question: string): Promise<boolean> {
  const answer = await prompt(`${question} [y/N] `);
  return /^y(es)?$/iu.test(answer);
}
