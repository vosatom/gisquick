/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//

import '@testing-library/cypress/add-commands'
import '@4tw/cypress-drag-drop'

declare global {
  namespace Cypress {
    interface Chainable {
      visitStory(storyId: string): Chainable
      findByFormLabel(text: string): Chainable<Element>
      dragElement(state: DragElementOptions): Chainable<Element>
      // login(email: string, password: string): Chainable<void>
      // drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      // dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
      // visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
    }
  }
}

Cypress.Commands.add('visitStory', (storyId) => {
  return cy.visit(
    `http://localhost:6006/iframe.html?id=${storyId}&viewMode=story`,
  )
})

Cypress.Commands.add('findByFormLabel', (label) => {
  cy.log('**findByFormLabel**')
  cy.contains('label', label)
    .parent()
    .then((element) => element.find('input'))
})

type DragElementPosition = 'top' | 'right' | 'bottom' | 'left' | 'center'

interface DragElementPart extends Partial<DocumentEventMap['pointermove']> {
  // x?: number
  // y?: number
  // targetSelector?: string
  // position?: DragElementPosition
  // options?: Cypress.TriggerOptions
}

interface DragElementOptions {
  source: DragElementPart
  target: DragElementPart
}

Cypress.Commands.add(
  'dragElement',
  { prevSubject: 'element' },
  (subject, options) => {
    const logInside = false

    const subjectEl = cy.wrap(subject, { log: logInside })
    subjectEl.trigger('pointermove', {
      ...options.source,
      log: logInside,
    })
    subjectEl.trigger('pointerdown', {
      ...options.source,
      log: logInside,
    })

    // cy.wait(1000, { log: logInside })
    subjectEl.trigger('pointermove', {
      ...options.source,
      log: logInside,
    })

    // cy.wait(1000, { log: logInside })
    subjectEl.trigger('pointermove', {
      ...options.target,
      log: logInside,
    })

    // cy.wait(1000, { log: logInside })
    subjectEl.trigger('pointerup', {
      ...options.target,
      log: logInside,
    })

    Cypress.log({
      name: 'drag',
      // shorter name for the Command Log
      displayName: 'drag',
      message: `from [${[options.source.x, options.source.y].join(
        ', ',
      )}] to [${[options.target.x, options.target.y].join(', ')}]`,
      consoleProps: () => ({
        options,
      }),
    })
  },
)

export {}
