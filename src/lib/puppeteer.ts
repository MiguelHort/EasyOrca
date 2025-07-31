// src/lib/puppeteer.ts
import puppeteer, { Browser } from 'puppeteer';

let _browser: Browser | null = null;

/**
 * Mantém um browser vivo enquanto o processo existir.
 * Evita custo de launch() a cada requisição (bom para Railway).
 */
export async function getBrowser(): Promise<Browser> {
  if (_browser && _browser.process() && !_browser.process()?.killed) {
    return _browser;
  }

  _browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  return _browser;
}
