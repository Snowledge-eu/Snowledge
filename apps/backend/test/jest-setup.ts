import 'reflect-metadata';

// Configuration globale pour les tests Jest
beforeAll(() => {
  // S'assurer que reflect-metadata est chargé
  if (!Reflect || !Reflect.getMetadata) {
    throw new Error('reflect-metadata is required');
  }
});

// Configuration pour éviter les erreurs de console pendant les tests
const originalError = console.error;
const originalWarn = console.warn;

beforeEach(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  console.error = originalError;
  console.warn = originalWarn;
}); 