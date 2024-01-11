import * as stories from './Button.stories.js'

it('works', () => {
  // cy.visitStory(decorator)
  // cy.visitStory('ui-components-button--primary')

  cy.contains('Content').click()
})