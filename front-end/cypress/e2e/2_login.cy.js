/// <reference types="Cypress" />

describe('Login functionality', () => {

  it('should login a test/verified user with valid credentials successfully', () => {
    cy.visit('/login');

    cy.get("[data-cy='loginButton']").as('loginButton').should('be.disabled')
    cy.get("[data-cy='emailInput']").type("test+test1@gmail.com");
    cy.get("[data-cy='passwordInput']").type("hG123f*e1");
    cy.get("@loginButton").should('be.enabled').click();

    cy.location("pathname").should("equal", "/");
  });

  it('should show an error for trying to login a user with invalid credentials', () => {
    cy.visit('/login');

    cy.get("[data-cy='loginButton']").as('loginButton').should('be.disabled')
    cy.get("[data-cy='emailInput']").type("test+test1@gmail.com");
    cy.get("[data-cy='passwordInput']").type("password123");
    cy.get("[data-cy='loginButton']").click();
    cy.get("@loginButton").should('be.enabled').click();

    cy.get("[data-cy='errorMessage']").should("be.visible").invoke('text').should('equal', 'Invalid username or password.');
  });

  it("should register and login an unverified user, navigate to the email verification page, and resend the verification link", () => {

    //Register an unverified test user
    cy.visit('/register');
    cy.get("[data-cy='emailInput']").type("test+test2@gmail.com");
    cy.get("[data-cy='passwordInput']").type("jdY32ncA(");
    cy.get("[data-cy='confirmPasswordInput']").type("jdY32ncA(");
    cy.get("[data-cy='firstNameInput']").type("FirstName");
    cy.get("[data-cy='lastNameInput']").type("LastName");
    cy.get("[data-cy='registerButton']").click();
    cy.get("[data-cy='backToLoginButton']").click();

    //Login unverified user
    cy.get("[data-cy='loginButton']").as('loginButton').should('be.disabled')
    cy.get("[data-cy='emailInput']").type("test+test2@gmail.com");
    cy.get("[data-cy='passwordInput']").type("jdY32ncA(");
    cy.get("[data-cy='loginButton']").click();

    cy.location("pathname").should("equal", "/please-verify-email");
    cy.get("[data-cy='resendEmailButton']").click();
    cy.get("[data-cy='resendEmailMessage']").should('be.visible').invoke('text').should('equal', "Email verification link sent successfully.");
  });

});