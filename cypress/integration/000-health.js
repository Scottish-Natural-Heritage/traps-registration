describe('Heart beat', function () {
    it('successfully ticks', function () {
      cy.request('/health').its('body').should('deep.equal', {message: 'OK'});
    });
  });
  