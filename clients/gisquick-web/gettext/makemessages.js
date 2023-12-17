const { GettextExtractor, JsExtractors, HtmlExtractors } = require('gettext-extractor')

let extractor = new GettextExtractor()

extractor
  .createJsParser([
    JsExtractors.callExpression(['[this].$gettext', '$gettext'], {
      arguments: {
        text: 0
      }
    }),
    JsExtractors.callExpression('[this].$ngettext', {
      arguments: {
        text: 0,
        textPlural: 1,
        context: 3
      }
    }),
    JsExtractors.callExpression('[this].$pgettext', {
      arguments: {
        text: 1,
        context: 0
      }
    })
  ])
  .parseFilesGlob('./src/**/*.@(js|ts|vue)')

extractor
  .createHtmlParser([
    HtmlExtractors.elementContent('translate', {
      attributes: {
        textPlural: 'translate-plural',
        context: 'translate-context',
        comment: 'translate-comment'
      }
    })
  ])
  .parseFilesGlob('./src/**/*.vue')

extractor.savePotFile('./i18n/messages.pot')

extractor.printStats()
