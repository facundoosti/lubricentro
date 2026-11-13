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
    ['<input type="text" />', '@ui/Input'],
    ['<input type="number" />', '@ui/Input'],
    ['<input type="email" />', '@ui/Input'],
    ['<input type="password" />', '@ui/Input'],
    ['<input type="search" />', '@ui/Input'],
    ['<input type="tel" />', '@ui/Input'],
    ['<input type="url" />', '@ui/Input'],
    ['<input />', '@ui/Input'],
    ['<input type={kind} />', '@ui/Input'],
    ["<input type={show ? 'text' : 'password'} />", '@ui/Input'],
    ['<textarea />', '@ui/Textarea'],
  ])('rechaza %s y sugiere %s', async (jsx, wrapper) => {
    const messages = await messagesFor(wrap(jsx));
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain(wrapper);
  });

  it.each(['src/components/features/x/Fake.jsx', 'src/layout/Fake.jsx'])('aplica también en %s', async (filePath) => {
    expect(await messagesFor(wrap('<select />'), filePath)).toHaveLength(1);
    expect(await messagesFor(wrap('<input type="text" />'), filePath)).toHaveLength(1);
    expect(await messagesFor(wrap('<textarea />'), filePath)).toHaveLength(1);
  });

  it.each(['file', 'radio', 'hidden'])('permite <input type="%s">', async (type) => {
    expect(await messagesFor(wrap(`<input type="${type}" />`))).toHaveLength(0);
  });

  it('permite los nativos dentro de components/ui', async () => {
    expect(await messagesFor(wrap('<input type="text" />'), 'src/components/ui/Fake.jsx')).toHaveLength(0);
    expect(await messagesFor(wrap('<textarea />'), 'src/components/ui/Fake.jsx')).toHaveLength(0);
    expect(await messagesFor(wrap('<input type={kind} />'), 'src/components/ui/Fake.jsx')).toHaveLength(0);
    expect(await messagesFor(wrap('<input type="checkbox" />'), 'src/components/ui/Fake.jsx')).toHaveLength(0);
  });
});
