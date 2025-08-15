/// <reference types="Cypress" />

describe('Chat page functionality', () => {

  before(() => {
    cy.visit("/login");

    cy.get("[data-cy='loginButton']").as('loginButton').should('be.disabled')
    cy.get("[data-cy='emailInput']").type("test+test1@gmail.com");
    cy.get("[data-cy='passwordInput']").type("hG123f*e1");
    cy.get("@loginButton").should('be.enabled').click();
  });

  it('allows a user to create a group in two ways', () => {
    cy.get('[data-cy="noGroupsCreateButton"]').click();
    cy.get('[data-cy="createGroupInput"]').as('createGroupInput').type('Group A');
    cy.get('[data-cy="createGroupSubmitButton"]').as('createGroupSubmitButton').click();

    cy.get('[data-cy="toastMessage"]').as('toastMessage').invoke('text').should('equal', 'Group created.');

    cy.get('[data-cy="createGroupButtonSideBar"]').click();
    cy.get('@createGroupInput').type('Group B');
    cy.get('@createGroupSubmitButton').click();

    cy.get('[data-cy="toastMessage"]').as('toastMessage').invoke('text').should('equal', 'Group created.');
  });

  it('allows a user to join groups and send messages in each', () => {
    cy.visit("/");

    cy.get('[data-cy="group"]').eq(0).click();
    cy.get('[data-cy="groupNameHeader"]').as('groupNameHeader').invoke('text').should('eq', 'Group A');

    cy.get('[data-cy="sendMessageInput"]').as('sendMessageInput').type('Test message 1, group A');
    cy.get('[data-cy="sendMessageButton"]').as('sendMessageButton').click();

    cy.get('@sendMessageInput').type('Test message 2, group A');
    cy.get('@sendMessageButton').click();

    cy.get('[data-cy="messageSent"]').eq(0).invoke('text').should('eq', 'Test message 1, group A');
    cy.get('[data-cy="messageSent"]').eq(1).invoke('text').should('eq', 'Test message 2, group A');

    cy.get('[data-cy="group"]').eq(1).click();
    cy.get('@groupNameHeader').invoke('text').should('eq', 'Group B');

    cy.get('@sendMessageInput').type('Test message 1, group B');
    cy.get('@sendMessageButton').click();

    cy.get('[data-cy="messageSent"]').eq(0).invoke('text').should('eq', 'Test message 1, group B');
  });

  it('allows a user to search for a group, open it, and check two previously sent messages', () => {
    cy.visit("/");

    cy.get('[data-cy="searchGroupInput"]').type('A');
    cy.get('[data-cy="group"]').eq(0).as('group').invoke('text').should('eq', 'Group A');
    cy.get('@group').click();
    cy.get('[data-cy="groupNameHeader"]').invoke('text').should('eq', 'Group A');

    cy.get('[data-cy="messageSent"]').eq(0).invoke('text').should('eq', 'Test message 1, group A');
    cy.get('[data-cy="messageSent"]').eq(1).invoke('text').should('eq', 'Test message 2, group A');
  });

  it("shows current participants of a group, creates an invitation link, uses another user to join the group with the invitation, and checks group participants", () => {
    cy.visit("/");

    cy.get('[data-cy="group"]').eq(0).click();
    cy.get('[data-cy="groupParticipantsButton"]').click();
    cy.get('[data-cy="groupParticipantsList"]').should('be.visible');
    cy.get('[data-cy="groupParticipantName"]').eq(0).invoke('text').should('eq', 'FirstName LastName');

    cy.get('[data-cy="createInvitationButton"]').click();
    cy.get('[data-cy="invitationCreatedMessage"]').invoke('text').should('eq', 'Invitation link created: ');

    cy.get('[data-cy="invitationLink"]', { timeout: 30000 }).should('be.visible').invoke('text').should('not.be.empty').should('include', '/join-group/').as('invitationLink');

    cy.get('[data-cy="modalCloseButton"]').click();

    cy.get('[data-cy="groupParticipantsList"]').should('not.exist');

    //Logout current user
    cy.get("[data-cy='userProfileImage']").click();
    cy.get("[data-cy='logoutDropdownItem']").click();

    cy.visit('/register');

    cy.get("[data-cy='emailInput']").type("test+test1111@gmail.com");
    cy.get("[data-cy='passwordInput']").type("jdY32ncA(");
    cy.get("[data-cy='confirmPasswordInput']").type("jdY32ncA(");
    cy.get("[data-cy='firstNameInput']").type("FirstName1111");
    cy.get("[data-cy='lastNameInput']").type("LastName1111");
    cy.get("[data-cy='registerButton']").click();

    cy.get("[data-cy='backToLoginButton']").click();

    cy.location("pathname").should("equal", "/login");

    cy.get("[data-cy='emailInput']").type("test+test1111@gmail.com");
    cy.get("[data-cy='passwordInput']").type("jdY32ncA(");
    cy.get("[data-cy='loginButton']").should('not.be.disabled').click();

    cy.location("pathname").should("equal", "/");

    // Navigate to the invite link
    cy.get('@invitationLink').then((invitationLink) => {
      cy.log('Invitation link: ', invitationLink);

      expect(invitationLink).to.not.include('undefined');
      expect(invitationLink).to.include('/join-group');

      cy.visit(invitationLink.trim());
    });

    cy.location("pathname").should("include", "/join-group");

    cy.get('[data-cy="joinGroupText"]', { timeout: 60000 }).should('be.visible').invoke('text').should('eq', 'You have been invited to join a group.');

    cy.get('[data-cy="joinGroupButton"]').should('be.visible').click();

    cy.get('[data-cy="messageReceived"]').eq(0).invoke('text').should('eq', 'Test message 1, group A');
    cy.get('[data-cy="messageReceived"]').eq(1).invoke('text').should('eq', 'Test message 2, group A');

    cy.get('[data-cy="groupNameHeader"]').invoke('text').should('eq', 'Group A');

    cy.get('[data-cy="sendMessageInput"]').type('Test message 3, group A');
    cy.get('[data-cy="sendMessageButton"]').click();
    cy.get('[data-cy="messageSent"]').eq(0).invoke('text').should('eq', 'Test message 3, group A');

    cy.get('[data-cy="groupParticipantsButton"]').click();
    cy.get('[data-cy="groupParticipantsList"]').should('be.visible');
    cy.get('[data-cy="groupParticipantName"]').eq(0).invoke('text').should('eq', 'FirstName LastName');
    cy.get('[data-cy="groupParticipantName"]').eq(1).invoke('text').should('eq', 'FirstName1111 LastName1111');
    cy.get('[data-cy="modalCloseButton"]').click();

    cy.get("[data-cy='userProfileImage']").click();
    cy.get("[data-cy='logoutDropdownItem']").click();
  });

  it("should login as the group owner, change the name for Group A, and delete Group B", () => {
    cy.visit("/login");

    cy.get("[data-cy='emailInput']").type("test+test1@gmail.com");
    cy.get("[data-cy='passwordInput']").type("hG123f*e1");
    cy.get("[data-cy='loginButton']").click();

    cy.get('[data-cy="group"]').eq(0).click();
    cy.get("[data-cy='groupOptionsDropdown']").click();
    cy.get("[data-cy='changeGroupNameOption']").click();
    cy.get('[data-cy="changeGroupNameForm"]').should('be.visible');
    cy.get('[data-cy="changeGroupNameInput"]').clear().type('Group C');
    cy.get('[data-cy="changeGroupNameSaveButton"]').click();

    cy.get('[data-cy="toastMessage"]').as('toastMessage').invoke('text').should('equal', 'Group name saved.');

    cy.get('[data-cy="group"]').eq(1).click();

    cy.get("[data-cy='groupOptionsDropdown']").click();
    cy.get("[data-cy='deleteGroupOption']").click();
    cy.get("[data-cy='deleteGroupForm']").should('be.visible');
    cy.get("[data-cy='deleteGroupButton']").click();

    cy.get('@toastMessage').invoke('text').should('equal', 'Group deleted.');

    cy.get("[data-cy='userProfileImage']").click();
    cy.get("[data-cy='logoutDropdownItem']").click();
  })

  it("allows a user to leave a group they joined, showing only 1 participant in the group for another user in that group", () => {
    cy.visit("/login");

    cy.get("[data-cy='emailInput']").type("test+test1111@gmail.com");
    cy.get("[data-cy='passwordInput']").type("jdY32ncA(");
    cy.get("[data-cy='loginButton']").click();

    cy.location("pathname").should("equal", "/");

    cy.get('[data-cy="group"]').eq(0).as('group').should('exist').invoke('text').should('eq', 'Group C');
    cy.get('@group').click();
    cy.get("[data-cy='groupOptionsDropdown']").click();
    cy.get("[data-cy='leaveGroupOption']").click();

    cy.get('[data-cy="leaveGroupModalForm"]').should('be.visible');
    cy.get('[data-cy="leaveGroupButton"]').click();

    cy.get('[data-cy="toastMessage"]').invoke('text').should('equal', 'Left group.');

    cy.get('[data-cy="group"]').should('not.exist');

    cy.get("[data-cy='userProfileImage']").click();
    cy.get("[data-cy='logoutDropdownItem']").click();

    cy.get("[data-cy='emailInput']").type("test+test1@gmail.com");
    cy.get("[data-cy='passwordInput']").type("hG123f*e1");
    cy.get("[data-cy='loginButton']").click();

    cy.get('[data-cy="group"]').eq(0).click();

    cy.get('[data-cy="groupParticipantsButton"]').click();
    cy.get('[data-cy="groupParticipantsList"]').should('be.visible');
    cy.get('[data-cy="groupParticipantName"]').eq(0).invoke('text').should('eq', 'FirstName LastName');
    cy.get('[data-cy="groupParticipantName"]').eq(1).should('not.exist');
    cy.get('[data-cy="modalCloseButton"]').click();
  });
});