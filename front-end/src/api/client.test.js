import { apiUrl, validatePhoto } from './client';

describe('apiUrl', () => {
  it('returns path with leading slash when given path without slash', () => {
    expect(apiUrl('api/missing-persons')).toBe('/api/missing-persons');
  });
  it('keeps path when already has leading slash', () => {
    expect(apiUrl('/api/matches')).toBe('/api/matches');
  });
});

describe('validatePhoto', () => {
  it('returns error when file is missing and required', () => {
    expect(validatePhoto(null, true)).toBe('Foto é obrigatória.');
    expect(validatePhoto(undefined, true)).toBe('Foto é obrigatória.');
  });
  it('returns null when file is missing and not required', () => {
    expect(validatePhoto(null, false)).toBe(null);
  });
  it('returns error when file is not an image type', () => {
    expect(validatePhoto({ type: 'application/pdf', size: 100 }, true)).toBe('Envie uma imagem (JPG, PNG, etc.).');
  });
  it('returns error when file exceeds 10 MB', () => {
    const big = 10 * 1024 * 1024 + 1;
    expect(validatePhoto({ type: 'image/jpeg', size: big }, true)).toBe('Imagem muito grande. Máximo 10 MB.');
  });
  it('returns null for valid image file', () => {
    expect(validatePhoto({ type: 'image/jpeg', size: 1024 }, true)).toBe(null);
    expect(validatePhoto({ type: 'image/png', size: 5 * 1024 * 1024 }, true)).toBe(null);
  });
});
