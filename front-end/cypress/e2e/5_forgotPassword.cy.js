describe('Forgot password page functionality', () => {

  it('allows a user to navigate to the forgot password page and request a link to reset their password, showing the email sent message, and navigate back to login', () => {
    cy.visit('/login');

    cy.get("[data-cy='forgotPasswordLink']").click();
    cy.get("[data-cy='forgotPasswordEmailInput']").type('test+test1@gmail.com');
    cy.get("[data-cy='forgotPasswordSubmitButton']").click();

    cy.get("[data-cy='emailSentMessage']").invoke('text').should('equal', 'Password reset link sent successfully. Check your inbox.');

    cy.get("[data-cy='forgotPasswordBackButton']").click();

    cy.location("pathname").should("equal", "/login");
  });
});