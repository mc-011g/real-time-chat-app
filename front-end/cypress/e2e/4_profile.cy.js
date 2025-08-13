describe('Profile page functionality', () => {

  it('should allow a user to update their first name and last name', () => {
    cy.visit('/login');

    cy.get("[data-cy='loginButton']").as('loginButton').should('be.disabled')
    cy.get("[data-cy='emailInput']").type("test+test1@gmail.com");
    cy.get("[data-cy='passwordInput']").type("hG123f*e1");
    cy.get("@loginButton").should('be.enabled').click();

    cy.get("[data-cy='userName']").invoke('text').should('eq', 'FirstName LastName');

    cy.get("[data-cy='userProfileImage']").click();
    cy.get("[data-cy='userProfileDropdownItem']").click();

    cy.location("pathname").should("equal", "/profile");

    cy.get("[data-cy='profileFirstNameInput']").as('profileFirstNameInput').invoke('val').should('eq', 'FirstName');
    cy.get('@profileFirstNameInput').clear();
    cy.get("[data-cy='profileLastNameInput']").as('profileLastNameInput').invoke('val').should('eq', 'LastName');
    cy.get('@profileLastNameInput').clear();

    cy.get('@profileFirstNameInput').type('TestFirstName2');
    cy.get('@profileLastNameInput').type('TestLastName2');

    cy.get("[data-cy='profileSaveChangesButton']").click();

    cy.get("[data-cy='toastMessage']").invoke('text').should('eq', 'Profile saved.');

    cy.get('@profileFirstNameInput').invoke('val').should('eq', 'TestFirstName2');
    cy.get('@profileLastNameInput').invoke('val').should('eq', 'TestLastName2');

    cy.get("[data-cy='profileBackButton']").click();
    cy.get("[data-cy='userName']").invoke('text').should('eq', 'TestFirstName2 TestLastName2');
  });

  it('allows a user to use the reset password button and shows the email sent message', () => {
    cy.visit('/');

    cy.get("[data-cy='userProfileImage']").click();
    cy.get("[data-cy='userProfileDropdownItem']").click();
    cy.location("pathname").should("equal", "/profile");

    cy.get("[data-cy='profileResetPasswordButton']").click();
    cy.get("[data-cy='profileMessage']").invoke('text').should('eq', 'Password reset link sent successfully.');
  });

  it('allows a user to update their email address', () => {
    cy.visit('/');

    cy.get("[data-cy='userProfileImage']").click();
    cy.get("[data-cy='userProfileDropdownItem']").click();

    cy.location("pathname").should("equal", "/profile");

    cy.get("[data-cy='profileUpdateEmailButton']").click();
    cy.get("[data-cy='profileChangeEmailModal']").should('be.visible');
    cy.get("[data-cy='profileSubmitEmailChangeButton']").as('profileSubmitEmailChangeButton').should('be.disabled');
    cy.get("[data-cy='profileChangeEmailInput']").clear().type('test+test11@gmail.com');
    cy.get("@profileSubmitEmailChangeButton").should('be.enabled').click();

    cy.get("[data-cy='profileChangeEmailMessage']").invoke('text').should('eq', 'A verification email has been sent to the new email. Please check your inbox and log in again.');

    cy.get("[data-cy='modalCloseButton']").click();

    cy.get("[data-cy='profileChangeEmailModal']").should('not.exist');
  });

  it('allows a user to logout and unable to access pages that require authentication', () => {
    cy.visit('/');

    cy.get("[data-cy='userProfileImage']").click();
    cy.get("[data-cy='userProfileDropdownItem']").click();

    cy.location("pathname").should("equal", "/profile");

    cy.get("[data-cy='profileLogoutButton']").click();
    cy.location("pathname").should("equal", "/login");

    cy.visit('/profile');
    cy.location("pathname").should("equal", "/login");

    cy.visit('/');
    cy.location("pathname").should("equal", "/login");
  });

});