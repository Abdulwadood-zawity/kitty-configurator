import { describe, it, expect } from 'vitest';
import { parseItermColors } from './iterm.js';

const SAMPLE_PLIST = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Ansi 0</key>
    <dict>
        <key>Color Space</key>
        <string>sRGB</string>
        <key>Red Component</key>
        <real>0.0</real>
        <key>Green Component</key>
        <real>0.0</real>
        <key>Blue Component</key>
        <real>0.0</real>
    </dict>
    <key>Ansi 1</key>
    <dict>
        <key>Red Component</key>
        <real>1.0</real>
        <key>Green Component</key>
        <real>0.0</real>
        <key>Blue Component</key>
        <real>0.0</real>
    </dict>
    <key>Ansi 15</key>
    <dict>
        <key>Red Component</key>
        <real>1.0</real>
        <key>Green Component</key>
        <real>1.0</real>
        <key>Blue Component</key>
        <real>1.0</real>
    </dict>
    <key>Foreground Color</key>
    <dict>
        <key>Red Component</key>
        <real>0.9</real>
        <key>Green Component</key>
        <real>0.9</real>
        <key>Blue Component</key>
        <real>0.9</real>
    </dict>
    <key>Background Color</key>
    <dict>
        <key>Red Component</key>
        <real>0.1</real>
        <key>Green Component</key>
        <real>0.1</real>
        <key>Blue Component</key>
        <real>0.1</real>
    </dict>
</dict>
</plist>`;

describe('parseItermColors', () => {
  it('parses a sample plist into a Theme', () => {
    const theme = parseItermColors(SAMPLE_PLIST);
    expect(theme.palette.color0).toBe('#000000');
    expect(theme.palette.color1).toBe('#ff0000');
    expect(theme.palette.color15).toBe('#ffffff');
    expect(theme.foreground).toMatch(/^#[0-9a-f]{6}$/u);
    expect(theme.background).toMatch(/^#[0-9a-f]{6}$/u);
  });

  it('throws on invalid input', () => {
    expect(() => parseItermColors('not a plist')).toThrow();
  });
});
