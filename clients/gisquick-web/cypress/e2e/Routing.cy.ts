// OpenLayers takes any click under 250ms as doubleclick
const OPENLAYERS_CLICK_DELAY = 250

describe('basic route interactions', () => {
  it('handles default routing', () => {
    cy.visitStory('modules-routing--routing-empty')

    cy.findByTestId('the-canvas')
      .click(100, 100)
      .wait(OPENLAYERS_CLICK_DELAY)
      .click(300, 200)
      .wait(OPENLAYERS_CLICK_DELAY)
      .click(100, 300)
      .wait(OPENLAYERS_CLICK_DELAY)

    cy.findAllByLabelText('Waypoint').its('length').should('eq', 1)
    cy.findAllByTitle('Remove waypoint').its('length').should('eq', 3)

    // change active path
    cy.findByLabelText('Select path').click()

    // create new point dragging on path
    cy.findByTestId('the-canvas').dragElement({
      source: { x: 200, y: 150 },
      target: { x: 100, y: 200 },
    })

    cy.findAllByLabelText('Waypoint').its('length').should('eq', 2)
    cy.findAllByTitle('Remove waypoint').its('length').should('eq', 4)

    // move existing point
    cy.findByTestId('the-canvas').dragElement({
      source: { x: 100, y: 70, button: 0, isPrimary: true },
      target: { x: 300, y: 70, button: 0, isPrimary: true },
    })

    // remove existing points
    cy.findAllByTitle('Remove waypoint').first().click()
    cy.findAllByTitle('Remove waypoint').first().click()

    cy.findByLabelText('Waypoint').should('not.exist')
    cy.findAllByTitle('Remove waypoint').its('length').should('eq', 2)

    cy.findAllByLabelText('Zoom to').eq(1).trigger('mouseover', { force: true })
  })

  it.only('handles default roundtrip', () => {
    cy.visitStory('modules-routing--routing-roundtrip')

    cy.findByTitle('Clear').click()

    cy.findByTestId('the-canvas').click(100, 100)

    cy.findByText('Roundtrip').click()

    // Change back to standard routing
    cy.findByTestId('the-canvas').click(300, 200)
  })
})
