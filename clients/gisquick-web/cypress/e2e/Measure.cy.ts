describe('Measure', () => {
  it('Location', () => {
    cy.visitStory('tools-measure--location')

    cy.findAllByText('No measurements yet')

    cy.findByTestId('the-canvas')
      .click(100, 100)
      .click(300, 200)
      .click(110, 300)

    cy.findAllByLabelText('Zoom to').its('length').should('eq', 3)

    cy.findByText('1600828.79 m').click()

    cy.findAllByLabelText('Menu').eq(0).click()

    cy.findByText('EPSG:4326 (HDMS)').click()

    cy.findByText('50° 06′ 42″ N').click()

    cy.findAllByLabelText('Delete').eq(0).click()

    cy.findAllByLabelText('Zoom to').its('length').should('eq', 2)

    cy.findAllByLabelText('Menu').filter('button:visible').click()

    cy.findByText('Clear').click()

    cy.findAllByText('No measurements yet')
  })

  it('Distance', () => {
    cy.visitStory('tools-measure--distance')

    cy.findAllByText('No measurements yet')

    cy.findByTestId('the-canvas').click(100, 100).click(300, 200)

    cy.findByTestId('the-canvas').dragElement({
      source: { x: 110, y: 300 },
      target: { x: 300, y: 200 },
    })

    cy.findByTestId('the-canvas').click(110, 300)

    cy.findByText('1.34 km').click()

    cy.findAllByLabelText('Menu').filter('button:visible').click()

    cy.findByText('Imperial - UK, US').click()

    cy.findByText('1465.86 yd').click()

    // double click
    cy.findByTestId('the-canvas').dblclick(110, 300)

    cy.findByTestId('the-canvas')
      .click(250, 150)
      .click(225, 100)
      .click(300, 175)

    cy.findAllByLabelText('Zoom to').its('length').should('eq', 2)
  })

  it.only('Area', () => {
    cy.visitStory('tools-measure--area')

    cy.findAllByText('No measurements yet')

    cy.findByTestId('the-canvas').click(100, 100).click(300, 200)

    cy.findByTestId('the-canvas').dragElement({
      source: { x: 110, y: 300 },
      target: { x: 300, y: 200 },
    })

    cy.findByTestId('the-canvas').click(110, 300)

    cy.findByText('1.95 km')
    cy.findByText('182460 m²')

    cy.findAllByLabelText('Menu').filter('button:visible').click()

    cy.findByText('Imperial - UK, US').click()

    cy.findByText('1465.86 yd').click()

    // double click
    cy.findByTestId('the-canvas').dblclick(110, 300)

    cy.findByTestId('the-canvas')
      .click(250, 150)
      .click(225, 100)
      .click(300, 175)

    cy.findAllByLabelText('Zoom to').its('length').should('eq', 2)
  })
})
