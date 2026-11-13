// Regla no-restricted-syntax de eslint.config.js: controles nativos prohibidos en features/, pages/ y layout/.
import { describe, it, expect } from 'vitest';
import { ESLint } from 'eslint';

// cwd = frontend/ (donde corre vitest), así toma eslint.config.js
const eslint = new ESLint();

const messagesFor = async (code, filePath = 'src/pages/Fake.jsx') => {
  const [result] = await eslint.lintText(code, { filePath });
  return result.messages.filter((m) => m.ruleId === 'no-restricted-syntax').map((m) => m.message);
};

const wrap = (jsx) => `export default function Fake() { return (${jsx}); }\n`;

describe('ESLint — controles nativos prohibidos', () => {
  it.each([
    ['<select />', '@ui/Select'],
    ['<input type="date" />', '@ui/DateInput'],
    ['<input type="time" />', '@ui/TimeInput'],
    ['<input type="checkbox" />', '@ui/Checkbox'],
  ])('rechaza %s y sugiere %s', async (jsx, wrapper) => {
    const messages = await messagesFor(wrap(jsx));
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain(wrapper);
  });

  it.each(['src/components/features/x/Fake.jsx', 'src/layout/Fake.jsx'])('aplica también en %s', async (filePath) => {
    expect(await messagesFor(wrap('<select />'), filePath)).toHaveLength(1);
  });

  it('permite <input type="text"> y los nativos dentro de components/ui', async () => {
    expect(await messagesFor(wrap('<input type="text" />'))).toHaveLength(0);
    expect(await messagesFor(wrap('<input type="checkbox" />'), 'src/components/ui/Fake.jsx')).toHaveLength(0);
  });
});
