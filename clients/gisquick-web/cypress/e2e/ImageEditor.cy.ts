describe('basic attributes editing', () => {
  it('updates feature data', () => {
    cy.visitStory('components-image-image-editor--primary')

    cy.findByText('File')
      .parent()
      .get('input[type="file"]')
      .first()
      .selectFile('cypress/fixtures/icon.png', { force: true })

    cy.contains('span', '180x180')

    cy.findByLabelText('Edit file').click()

    cy.get('.canvas').dblclick()

    cy.findByLabelText('Crop').click()

    cy.get('.crop-point.bottom-left').drag('.crop-point.bottom-left', {
      source: { x: 0, y: 0 },
      target: { x: 100, y: -100 },
      force: true,
    })

    cy.contains('span', '113x113')

    cy.findByText('Apply').click()
  })
})
