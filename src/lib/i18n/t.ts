import fr from './fr';
import en from './en';

export const locale = 'fr';

const dicts: Record<string, Record<string, string>> = {
  fr,
  en,
};

export function t(key: string, vars?: Record<string, string | number>) {
  const dict = dicts[locale] || {};
  let str = (dict as any)[key] ?? key;
  if (vars) {
    Object.keys(vars).forEach((k) => {
      const v = String(vars[k]);
      str = str.replace(new RegExp(`\{${k}\}`, 'g'), v);
    });
  }
  return str;
}

export default t;
