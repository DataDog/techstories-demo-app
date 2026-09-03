export {};

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string, cbUrl?: string): Chainable<void>;
    }
  }
}
