import { describe, it, expect } from 'vitest';

// Los buscadores no deben disparar el autocompletado del navegador: con "email"
// en el placeholder, Brave/Chrome abren su popup de correos y tapa los resultados.
// Chromium ignora autoComplete="off" en campos que su heurística clasifica como
// email (verificado con --show-autofill-type-predictions), así que además el
// placeholder de un buscador no puede decir "email"/"e-mail".
const sources = import.meta.glob(['/src/**/*.jsx', '!/src/**/__tests__/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

const searchInputsWithoutAutocompleteOff = () =>
  Object.entries(sources).flatMap(([file, code]) =>
    (code.match(/<[iI]nput\b[\s\S]*?\/>/g) || [])
      .filter((tag) => /placeholder=[\s\S]*Buscar/.test(tag) || /value=\{\w*[sS]earch/.test(tag) || (/Search[^/]*\.jsx$/.test(file) && /placeholder=/.test(tag)))
      .filter((tag) => !/autoComplete="off"/.test(tag))
      .map((tag) => `${file}: ${tag.match(/placeholder=[^\n]*/)[0]}`),
  );

describe('inputs de búsqueda', () => {
  it('desactivan el autocompletado del navegador', () => {
    expect(searchInputsWithoutAutocompleteOff()).toEqual([]);
  });

  it('los inputs de las primitivas de búsqueda (Combobox/Autocomplete de Base UI) traen autoComplete="off"', () => {
    const offenders = Object.entries(sources).flatMap(([file, code]) =>
      (code.match(/<(?:Combobox|Autocomplete)Primitive\.Input\b[\s\S]*?\/>/g) || [])
        .filter((tag) => !/autoComplete="off"/.test(tag))
        .map(() => file),
    );
    expect(offenders).toEqual([]);
    expect(sources['/src/components/ui/primitives/autocomplete.jsx']).toMatch(/AutocompletePrimitive\.Input[\s\S]*?autoComplete="off"/);
  });

  it('no dicen "email" en el placeholder (Chromium los toma como campo de email)', () => {
    const offenders = Object.entries(sources).flatMap(([file, code]) =>
      (code.match(/placeholder\s*=\s*\{?\s*["'][^"']*Buscar[^"']*["']/g) || [])
        .filter((ph) => /e.?mail/i.test(ph))
        .map((ph) => `${file}: ${ph}`),
    );
    expect(offenders).toEqual([]);
  });
});
