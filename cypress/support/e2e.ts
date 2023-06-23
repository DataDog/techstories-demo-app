// Your code can be before this line
// require('./commands')
import "dd-trace/ci/cypress/support";
// Also supported:
// import 'dd-trace/ci/cypress/support'
// Your code can also be after this line
// Cypress.Commands.add('login', (email, pw) => {})
Cypress.Commands.add(
  "login",
  (email: string, password: string, cbUrl?: string) => {
    cy.visit("/auth/signin");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should("include", `${cbUrl || "/"}`);
  }
);
