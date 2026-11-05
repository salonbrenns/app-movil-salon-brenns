export function saludoDeSesion(name?: string | null): string {
  const firstName = name?.trim().split(/\s+/u)[0];
  if (!firstName) return 'Hola';
  const normalized = firstName.toLocaleLowerCase('es-MX').replace(/(^|[-'’])(\p{L})/gu,
    (_, separator: string, letter: string) => separator + letter.toLocaleUpperCase('es-MX'));
  return `Hola, ${normalized}`;
}
