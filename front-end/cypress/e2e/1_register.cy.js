/// <reference types="Cypress" />

describe('Register functionality', () => {

    beforeEach(() => {
        cy.visit('/register')
    });

    it('should register a user successfully using valid information, show the verify email message, and navigate back to login', () => {

        cy.get("[data-cy='emailInput']").type("test+test1@gmail.com");
        cy.get("[data-cy='passwordInput']").type("hG123f*e1");
        cy.get("[data-cy='confirmPasswordInput']").type("hG123f*e1");
        cy.get("[data-cy='firstNameInput']").type("FirstName");
        cy.get("[data-cy='lastNameInput']").type("LastName");
        cy.get("[data-cy='registerButton']").as("registerButton").should('be.enabled');
        cy.get("@registerButton").click();

        cy.location("pathname").should("equal", "/please-verify-email");
        cy.get("[data-cy='resendEmailButton']").click();
        cy.get("[data-cy='resendEmailMessage']").should('be.visible').invoke('text').should('equal', "Email verification link sent successfully.");

        cy.get("[data-cy='backToLoginButton']").click();
        cy.location("pathname").should("equal", "/login");
    });

    it('should show validation errors for each input and not let a user login unless all fields are valid', () => {
        cy.get("[data-cy='registerButton']").as('registerButton').and('be.disabled');

        cy.get("[data-cy='emailInput']").as('emailInput').type("test");
        cy.get("[data-cy='firstNameInput']").as('firstNameInput').type("1");
        cy.get("[data-cy='lastNameInput']").as('lastNameInput').type("2");
        cy.get("[data-cy='passwordInput']").as('passwordInput').type("password123");
        cy.get("[data-cy='confirmPasswordInput']").as('confirmPasswordInput').type("password1234");

        cy.get("[data-cy='notMatchingPasswordsMessage']").as('notMatchingPasswordsMessage').should('be.visible').invoke('text').should('eq', 'Passwords must match.');
        cy.get("@registerButton").should('be.disabled');

        cy.get("@confirmPasswordInput").type("{backspace}");
        cy.get("[data-cy='notMatchingPasswordsMessage']").should('not.exist');

        cy.get("[data-cy='failedUppercaseRequirement']").as('failedUppercaseRequirement').should('exist');
        cy.get("[data-cy='failedSpecialCharacterRequirement']").as('failedSpecialCharacterRequirement').should('exist');

        cy.get("@passwordInput").type("A$");
        cy.get("@confirmPasswordInput").type("A$");

        cy.get("@failedUppercaseRequirement").should('not.exist');
        cy.get("@failedSpecialCharacterRequirement").should('not.exist');
        cy.get("@registerButton").should('be.disabled');

        cy.get("[data-cy='invalidEmailMessage']").as('invalidEmailMessage').should('be.visible').invoke('text').should('eq', 'Please enter a valid email address.');
        cy.get("[data-cy='invalidFirstNameMessage']").as('invalidFirstNameMessage').should('be.visible').invoke('text').should('eq', 'First name must be at least 2 characters.');
        cy.get("[data-cy='invalidLastNameMessage']").as('invalidLastNameMessage').should('be.visible').invoke('text').should('eq', 'Last name must be at least 2 characters.');

        cy.get('@emailInput').type("+test1@gmail.com");
        cy.get('@firstNameInput').type("{backspace}FirstName");
        cy.get('@lastNameInput').type("{backspace}LastName");
        cy.get("@registerButton").should('be.enabled');

        cy.get('@passwordInput').should('have.attr', 'type', 'password');
        cy.get("[data-cy='togglePasswordTypeTextButton']")
            .should('be.visible')
            .click();
        cy.get('@passwordInput').should('have.attr', 'type', 'text');
        cy.get("[data-cy='togglePasswordTypePasswordButton']")
            .should('be.visible')
            .click();
        cy.get('@passwordInput').should('have.attr', 'type', 'password');

        cy.get('@confirmPasswordInput').should('have.attr', 'type', 'password');
        cy.get("[data-cy='toggleConfirmPasswordTypeTextButton']")
            .should('be.visible')
            .click();
        cy.get('@confirmPasswordInput').should('have.attr', 'type', 'text');
        cy.get("[data-cy='toggleConfirmPasswordTypePasswordButton']")
            .should('be.visible')
            .click();
        cy.get('@confirmPasswordInput').should('have.attr', 'type', 'password');
    });

    it("should navigate back to the login page with the link below the form", () => {
        cy.get("[data-cy='loginLink']").click();
        cy.location("pathname").should("equal", "/login");
    });
});