import { test, expect } from '@playwright/test';

test.describe('Kitty Configurator', () => {
  test('home page loads with hero and CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'Kitty Configurator' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Open Editor' })).toBeVisible();
  });

  test('editor loads all 5 tabs and at least 24 preset themes', async ({ page }) => {
    await page.goto('/editor');
    await expect(page.getByRole('tab', { name: 'Theme' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Font' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Window/ })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Keybindings' })).toBeVisible();
    await expect(page.getByRole('tab', { name: /Mouse/ })).toBeVisible();
    const themeButtons = page.locator('[data-testid^="theme-"]');
    await expect(themeButtons).toHaveCount(24);
  });

  test('clicking a preset theme updates the live preview', async ({ page }) => {
    await page.goto('/editor');
    await page.locator('[data-testid="theme-dracula"]').click();
    // At full opacity the window background is the theme's background color.
    const win = page.getByTestId('terminal-window');
    const bg = await win.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgb(40, 42, 54)'); // Dracula background
  });

  test('changing font size updates the preview', async ({ page }) => {
    await page.goto('/editor');
    await page.getByRole('tab', { name: 'Font' }).click();
    // The live preview is a real xterm.js terminal; the rows element carries
    // the configured font size.
    const term = page.locator('.xterm-rows');
    await expect(term).toBeVisible();
    const before = await term.evaluate((el) => getComputedStyle(el).fontSize);
    // Use keyboard to change the slider
    const slider = page.getByTestId('font-size').locator('[role="slider"]');
    await slider.focus();
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('ArrowRight');
    }
    const after = await term.evaluate((el) => getComputedStyle(el).fontSize);
    expect(after).not.toBe(before);
  });

  test('apply dialog opens with a Generate button', async ({ page }) => {
    await page.goto('/editor');
    await page.getByTestId('apply-button').click();
    await expect(page.getByTestId('apply-dialog')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Generate one-liner' })).toBeVisible();
  });

  test('keybindings editor: add a binding, edit, conflict detection', async ({ page }) => {
    await page.goto('/editor');
    await page.getByRole('tab', { name: 'Keybindings' }).click();
    await page.getByTestId('new-keys').fill('ctrl+shift+a');
    await page.getByTestId('new-action').fill('reload_config');
    await page.getByTestId('add-keybinding').click();
    // Reset to defaults clears the list, so add a conflicting one
    await page.getByRole('button', { name: 'Reset to defaults' }).click();
    await page.getByTestId('new-keys').fill('ctrl+shift+c');
    await page.getByTestId('new-action').fill('paste_from_clipboard');
    await page.getByTestId('add-keybinding').click();
    // Now ctrl+shift+c is bound twice → conflict warning (may render twice)
    await expect(page.getByText(/bound to multiple actions/i).first()).toBeVisible();
  });

  test('export downloads a kitty.conf file', async ({ page }) => {
    await page.goto('/editor');
    const downloadPromise = page.waitForEvent('download');
    await page.getByTestId('export-button').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe('kitty.conf');
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream!) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    const text = Buffer.concat(chunks).toString('utf8');
    expect(text).toContain('foreground #cdd6f4');
    expect(text).not.toContain('foreground "#cdd6f4"');
    expect(text).toContain('font_family "JetBrains Mono"');
    expect(text).not.toContain('font_family "\\"JetBrains Mono\\""');
    expect(text).toContain('line_height 1.0');
  });

  test('layout mode renders multiple terminal panes', async ({ page }) => {
    await page.goto('/editor');
    await page.getByTestId('preview-mode-layout').click();
    // The layout switcher shows the enabled layouts; pick "grid" for 4 panes.
    await page.getByTestId('layout-grid').click();
    await expect(page.getByTestId('pane-0')).toBeVisible();
    await expect(page.getByTestId('pane-3')).toBeVisible();
    // Each pane is a real xterm terminal.
    await expect(page.locator('.xterm')).toHaveCount(4);
  });

  test('lowering opacity makes the preview window translucent over a wallpaper', async ({ page }) => {
    await page.goto('/editor');
    await page.getByRole('tab', { name: /Window/ }).click();
    const win = page.getByTestId('terminal-window');
    // A desktop wallpaper sits behind the window so transparency is visible.
    await expect(page.getByTestId('preview-desktop')).toBeVisible();
    // Drag opacity to its minimum → the window background becomes translucent.
    const slider = page.getByTestId('opacity').locator('[role="slider"]');
    await slider.focus();
    await page.keyboard.press('Home');
    const bg = await win.evaluate((el) => getComputedStyle(el).backgroundColor);
    // Translucent backgrounds are reported as rgba(...) with alpha < 1.
    expect(bg).toMatch(/rgba\([^)]+,\s*0?\.\d+\)/);
    await expect(page.getByTestId('transparency-hint')).toBeVisible();
  });

  test('customizing the active tab font style updates the preview tab', async ({ page }) => {
    await page.goto('/editor');
    await page.getByRole('tab', { name: /Window/ }).click();
    const activeTab = page.getByTestId('tab-0');
    // Default active tab font style is bold.
    expect(await activeTab.evaluate((el) => getComputedStyle(el).fontWeight)).toBe('700');
    // Switch to italic → no longer bold, now italic.
    await page.getByTestId('active-tab-font-style').click();
    await page.getByRole('option', { name: 'italic', exact: true }).click();
    expect(await activeTab.evaluate((el) => getComputedStyle(el).fontStyle)).toBe('italic');
    expect(await activeTab.evaluate((el) => getComputedStyle(el).fontWeight)).toBe('400');
  });

  test('theme toggle switches dark/light mode', async ({ page }) => {
    await page.goto('/');
    const initial = await page.locator('html').evaluate((el) => el.classList.contains('dark'));
    await page.getByRole('button', { name: /Switch to (light|dark) mode/ }).click();
    await expect(page.locator('html')).toHaveClass(initial ? '' : 'dark');
  });
});
