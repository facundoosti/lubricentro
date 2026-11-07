// QA visual — zoom + carrusel de imágenes en el listado de productos.
// Plan: docs/qa/2026-11-07-zoom-imagenes-productos.md
//
// La base local no tiene productos con imagen: se interceptan las respuestas de
// GET /api/v1/products para inyectar image_url en los primeros 3 productos y se sirven
// SVGs generados. No se escribe nada en la base.

const IMG_PREFIX = '/__qa-img/';
const COLORS = ['#7c3aed', '#0891b2', '#ea580c'];

const svgFor = (i) => `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <rect width="1200" height="900" fill="${COLORS[i % COLORS.length]}"/>
  <g fill="#fff" fill-opacity="0.25">${Array.from({ length: 12 }, (_, k) => `<rect x="${k * 100}" y="0" width="50" height="900"/>`).join('')}</g>
  <circle cx="300" cy="225" r="80" fill="#fff"/>
  <text x="600" y="480" font-size="160" font-family="sans-serif" text-anchor="middle" fill="#fff">IMG ${i + 1}</text>
</svg>`;

async function mockImages(page) {
  await page.route((url) => url.pathname.startsWith(IMG_PREFIX), (route) => {
    const i = Number(new URL(route.request().url()).pathname.slice(IMG_PREFIX.length));
    return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: svgFor(i) });
  });
  await page.route((url) => url.pathname === '/api/v1/products', async (route) => {
    const res = await route.fetch();
    const json = await res.json();
    json.data.products.slice(0, 3).forEach((p, i) => { p.image_url = `${IMG_PREFIX}${i}`; });
    return route.fulfill({ response: res, json });
  });
}

async function openProducts(page, { mock = true } = {}) {
  if (mock) await mockImages(page);
  await page.goto('/products');
  await page.waitForLoadState('networkidle');
  await page.locator('tbody tr').first().waitFor();
}

const dialog = (page) => page.getByRole('dialog');
const counter = async (page) => (await dialog(page).locator('span.tabular-nums').textContent())?.trim();
const zoomBtns = (page) => page.getByRole('button', { name: /^Ampliar imagen de / });

async function openFirst(page) {
  await openProducts(page);
  await zoomBtns(page).first().click();
  await dialog(page).waitFor();
  await page.waitForTimeout(250);
}

const imgState = (page) => dialog(page).locator('img').first().evaluate((el) => {
  const r = el.getBoundingClientRect();
  return {
    alt: el.alt,
    transform: el.style.transform,
    origin: el.style.transformOrigin,
    loaded: el.complete && el.naturalWidth > 0,
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
  };
});

export default {
  slug: 'zoom-imagenes-productos',
  combos: ['desktop-dark'],
  cases: [
    {
      id: 'TC-01',
      combos: ['desktop-dark', 'desktop-light'],
      steps: async (page) => {
        await openProducts(page);
      },
      check: async (page) => {
        const buttons = await zoomBtns(page).count();
        const firstName = (await page.locator('tbody tr').first().locator('span.font-medium').first().textContent())?.trim();
        await zoomBtns(page).first().click();
        await dialog(page).waitFor();
        await page.waitForTimeout(250);
        const img = await imgState(page);
        const vp = page.viewportSize();
        const fits = img.rect.x >= 0 && img.rect.y >= 0 && img.rect.x + img.rect.w <= vp.width && img.rect.y + img.rect.h <= vp.height;
        const count = await counter(page);
        const thumbs = await dialog(page).getByRole('button', { name: /^Ver / }).count();
        const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
        const pass = buttons === 3 && img.loaded && img.alt === firstName && fits && count === '1 / 3' && thumbs === 3 && bodyOverflow === 'hidden';
        return {
          pass,
          reason: pass ? undefined : 'el visor no abrió con la imagen esperada / no entra en pantalla',
          facts: { buttons, firstName, img, count, thumbs, bodyOverflow },
        };
      },
    },
    {
      id: 'TC-02',
      steps: openFirst,
      check: async (page) => {
        const seq = [await counter(page)];
        await dialog(page).getByRole('button', { name: 'Imagen siguiente' }).click();
        seq.push(await counter(page));
        await page.keyboard.press('ArrowRight');
        seq.push(await counter(page));
        await page.keyboard.press('ArrowRight'); // wrap 3 → 1
        seq.push(await counter(page));
        await page.keyboard.press('ArrowLeft'); // wrap 1 → 3
        seq.push(await counter(page));
        await dialog(page).getByRole('button', { name: /^Ver / }).nth(1).click();
        seq.push(await counter(page));
        const activeThumb = await dialog(page).locator('[aria-current="true"]').getAttribute('aria-label');
        const img = await imgState(page);
        const expected = ['1 / 3', '2 / 3', '3 / 3', '1 / 3', '3 / 3', '2 / 3'];
        const pass = JSON.stringify(seq) === JSON.stringify(expected) && img.loaded && activeThumb?.includes(img.alt);
        return { pass, reason: pass ? undefined : `secuencia ${seq.join(' → ')}`, facts: { seq, activeThumb, alt: img.alt } };
      },
    },
    {
      id: 'TC-03',
      steps: openFirst,
      check: async (page) => {
        const img = dialog(page).locator('img').first();
        const before = await imgState(page);
        // clic en el cuarto superior izquierdo
        const { x, y, w, h } = before.rect;
        await page.mouse.click(x + w * 0.25, y + h * 0.25);
        await page.waitForTimeout(300);
        const zoomed = await imgState(page);
        await page.mouse.move(x + w * 0.75, y + h * 0.75);
        const panned = await imgState(page);
        const cursorZoomed = await img.evaluate((el) => getComputedStyle(el).cursor);
        await page.screenshot({ path: 'tmp/qa/zoom-imagenes-productos/TC-03-zoomed.jpg', type: 'jpeg', quality: 60 });
        await page.mouse.click(x + w * 0.75, y + h * 0.75);
        await page.waitForTimeout(300);
        const unzoomed = await imgState(page);
        // zoom y luego navegar: debe resetear
        await page.mouse.click(x + w * 0.5, y + h * 0.5);
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(100);
        const afterNav = await imgState(page);
        const near = (o, px, py) => {
          const [ox, oy] = o.split(' ').map(parseFloat);
          return Math.abs(ox - px) < 3 && Math.abs(oy - py) < 3;
        };
        const pass = before.transform === 'scale(1)'
          && zoomed.transform === 'scale(2.5)' && near(zoomed.origin, 25, 25)
          && near(panned.origin, 75, 75) && cursorZoomed === 'zoom-out'
          && unzoomed.transform === 'scale(1)'
          && afterNav.transform === 'scale(1)' && afterNav.alt !== before.alt;
        return {
          pass,
          reason: pass ? undefined : 'el zoom/pan/reset no se comportó como se esperaba',
          facts: { zoomed: [zoomed.transform, zoomed.origin], panned: panned.origin, cursorZoomed, unzoomed: unzoomed.transform, afterNav: [afterNav.transform, afterNav.alt] },
        };
      },
    },
    {
      id: 'TC-04',
      steps: openFirst,
      check: async (page) => {
        const closed = {};
        await page.keyboard.press('Escape');
        closed.esc = (await dialog(page).count()) === 0;

        await zoomBtns(page).first().click();
        await dialog(page).getByRole('button', { name: 'Cerrar' }).click();
        closed.x = (await dialog(page).count()) === 0;

        // costado de la foto: entre la flecha ◀ (x 24–68) y la imagen (x ≥ 229)
        await zoomBtns(page).first().click();
        await page.mouse.click(150, 450);
        closed.besideImage = (await dialog(page).count()) === 0;

        // franja de miniaturas, fuera de ellas
        await zoomBtns(page).first().click();
        await page.mouse.click(300, 860);
        closed.thumbsStrip = (await dialog(page).count()) === 0;

        // clic sobre la imagen NO cierra (hace zoom)
        await zoomBtns(page).first().click();
        await page.mouse.click(720, 450);
        const openAfterImageClick = (await dialog(page).count()) === 1;
        await page.keyboard.press('Escape');
        closed.backdrop = closed.besideImage && closed.thumbsStrip && openAfterImageClick;

        const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
        // la tabla sigue usable: el botón Editar abre su modal
        await page.locator('tbody tr').first().getByRole('button', { name: 'Editar' }).click().catch(() => {});
        const pass = closed.esc && closed.x && closed.backdrop && bodyOverflow !== 'hidden';
        return { pass, reason: pass ? undefined : 'no cerró por alguna vía o quedó el scroll bloqueado', facts: { closed, openAfterImageClick, bodyOverflow } };
      },
    },
    {
      id: 'TC-05',
      steps: async (page) => {
        await openProducts(page, { mock: false });
      },
      check: async (page) => {
        const rows = await page.locator('tbody tr').count();
        const buttons = await zoomBtns(page).count();
        const icons = await page.locator('tbody tr').first().locator('svg').count();
        const pass = rows > 0 && buttons === 0 && icons > 0;
        return { pass, reason: pass ? undefined : 'regresión en productos sin imagen', facts: { rows, buttons, icons } };
      },
    },
  ],
};
