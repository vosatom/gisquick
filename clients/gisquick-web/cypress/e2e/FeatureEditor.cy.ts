function intercept(action) {
  let response = ''
  if (action === 'update') {
    response = `<TransactionSummary><totalUpdated>1</totalUpdated></TransactionSummary>
<TransactionResults><Action locator="Update:mnk_pois"><Message>Update features failed on layer 'mnk_pois'</Message></Action></TransactionResults>`
  } else if (action === 'insert') {
    response = `<TransactionSummary><totalInserted>1</totalInserted></TransactionSummary>
<UpdateResults><Feature><ogc:FeatureId fid="mnk_pois.0"/></Feature></UpdateResults>`
  } else if (action === 'delete') {
    response = `<TransactionSummary><totalDeleted>1</totalDeleted></TransactionSummary>
<DeleteResults><Feature><ogc:FeatureId fid="mnk_pois.0"/></Feature></DeleteResults>`
  }

  response = `<TransactionResponse xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" version="1.1.0" xmlns="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">${response}</TransactionResponse>`

  cy.intercept('/api/map/ows/*/osm?VERSION=1.1.0&SERVICE=WFS*', response).as(
    'wfs',
  )
}
function interceptError(action) {
  let response = ''
  if (action === 'update') {
    response = `<TransactionSummary><totalUpdated>0</totalUpdated></TransactionSummary>`
  } else if (action === 'insert') {
    response = `<TransactionSummary><totalUpdated>0</totalUpdated></TransactionSummary>`
  } else if (action === 'delete') {
    response = `<TransactionSummary><totalUpdated>0</totalUpdated></TransactionSummary>`
  }

  response += `<TransactionResults><Action locator="Update:mnk_pois"><Message>Update features failed on layer 'mnk_pois'</Message></Action></TransactionResults>`

  response = `<TransactionResponse xsi:schemaLocation="http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd" version="1.1.0" xmlns="http://www.opengis.net/wfs" xmlns:ogc="http://www.opengis.net/ogc" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">${response}</TransactionResponse>`

  cy.intercept('/api/map/ows/*/osm?VERSION=1.1.0&SERVICE=WFS*', response).as(
    'wfs',
  )
}

function interceptFileUpload() {
  cy.intercept('POST', '/api/project/media_file/**', {
    filename: 'icon.png',
    data: {
      path: '/path/icon.png',
      hash: '9426abe30913b5eb83d93eae0a9c7ae5',
      size: 1236,
      mtime: '2023-01-01T12:53:10.000Z',
    },
  }).as('api/upload')

  cy.intercept('DELETE', '/api/project/media_file/**', (req) => {
    req.reply({ statusCode: 200, body: {} })
  }).as('api/delete')
}

describe('basic attributes editing', () => {
  it('updates feature data', () => {
    intercept('update')
    interceptFileUpload()

    cy.visitStory('feature-editor-feature-editor--point-edit')
    cy.findByFormLabel('Name').type('{selectAll}Hello')
    cy.findByLabelText('Discard changes').click()
    cy.findByFormLabel('Name')
      .should('have.value', 'Czech Rep.')
      .type('{selectAll}Hello')
    cy.findByFormLabel('GDP').type('{downArrow}')
    cy.findByText('Abbreviation')
      .parent()
      .get('input[type="file"]')
      .first()
      .selectFile('cypress/fixtures/icon.png', { force: true })

    // Need to wait for Vue to update state
    cy.wait(1)

    cy.findByLabelText('Save changes').click()
    cy.findByText('Data updated')
  })

  it('fails to update feature data', () => {
    interceptError('update')
    cy.visitStory('feature-editor-feature-editor--point-edit')
    cy.findByFormLabel('Name').type('{selectAll}Hello')

    cy.findByLabelText('Save changes').click()
    cy.findByText('Data update error')
  })

  it('can delete feature', () => {
    intercept('delete')
    cy.visitStory('feature-editor-feature-editor--point-edit')
    cy.findByLabelText('Delete object').click()
    cy.findByText('Yes').click()
    cy.findByText('Data updated')
  })

  it('fails to delete feature', () => {
    interceptError('delete')
    cy.visitStory('feature-editor-feature-editor--point-edit')
    cy.findByLabelText('Delete object').click()
    cy.findByText('Yes').click()
    cy.findByText('Data update error')
  })

  it('can create new feature', () => {
    intercept('insert')
    interceptFileUpload()

    cy.visitStory('feature-editor-feature-editor--new-feature')

    cy.findByFormLabel('Name').type('{selectAll}Hello')
    cy.findByText('Abbreviation')
      .parent()
      .get('input[type="file"]')
      .first()
      .selectFile('cypress/fixtures/icon.png', { force: true })

    cy.findByLabelText('Add geometry').click()

    cy.findByTestId('the-canvas').click(100, 100)

    cy.findByLabelText('Save changes').click()
    cy.findByText('Data updated')
  })

  it('fails to create new feature', () => {
    interceptError('insert')
    interceptFileUpload()

    cy.visitStory('feature-editor-feature-editor--new-feature')

    cy.findByFormLabel('Name').type('{selectAll}Hello')
    cy.findByText('Abbreviation')
      .parent()
      .get('input[type="file"]')
      .first()
      .selectFile('cypress/fixtures/icon.png', { force: true })

    cy.findByLabelText('Add geometry').click()

    cy.findByTestId('the-canvas').click(100, 100)

    cy.findByLabelText('Save changes').click()
    cy.findByText('Data update error')
  })
})

describe('geometry creation', () => {
  function geometryEdit(testName: string, storyId: string, callback: Function) {
    it(testName, () => {
      intercept('update')
      cy.visitStory(storyId)

      cy.findByLabelText('Edit geometry').click()
      cy.findByLabelText('Add geometry').click()

      callback(cy.findByTestId('the-canvas'))

      cy.findByLabelText('Save changes').click()

      cy.findByText('Data updated')
    })
  }

  geometryEdit(
    'handles Point',
    'feature-editor-feature-editor--point-edit',
    (chain) => chain.click(100, 100),
  )
  geometryEdit(
    'handles LineString',
    'feature-editor-feature-editor--line-string-edit',
    (chain) => chain.click(100, 100).click(150, 100).dblclick(100, 150),
  )

  geometryEdit(
    'handles Polygon',
    'feature-editor-feature-editor--polygon-edit',
    (chain) => chain.click(100, 100).click(150, 100).dblclick(100, 150),
  )

  geometryEdit(
    'handles MultiPoint',
    'feature-editor-feature-editor--multi-point-edit',
    (chain) => chain.click(100, 100),
  )

  geometryEdit(
    'handles MultiLineString',
    'feature-editor-feature-editor--multi-line-string-edit',
    (chain) =>
      chain
        .click(100, 100)
        .click(150, 100)
        .dblclick(100, 150)
        .click(200, 200)
        .click(250, 200)
        .dblclick(200, 250),
  )

  geometryEdit(
    'handles MultiPolygon',
    'feature-editor-feature-editor--multi-polygon-edit',
    (chain) =>
      chain
        .click(100, 100)
        .click(150, 100)
        .dblclick(100, 150)
        .click(200, 200)
        .click(250, 200)
        .dblclick(200, 250),
  )
})
