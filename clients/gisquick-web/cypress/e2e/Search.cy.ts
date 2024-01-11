describe('search', () => {
  it('handles search interaction', () => {
    cy.visitStory('modules-search--search')

    cy.findByPlaceholderText('Search...').type('First{downArrow}{enter}')

    cy.findByText('First').click()

    cy.findByLabelText('Clear search').click()

    cy.findByPlaceholderText('Search...').should('be.empty')
  })
})
