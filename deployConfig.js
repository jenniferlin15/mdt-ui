
var presets = {
  production: {
    baseUrl: '/metadatamanager/',
    apiBaseUrl: 'http://mdt.crossref.org/mdt/v1'
  },

  staging: {
    baseUrl: '/mmstaging',
    apiBaseUrl: 'https://apps.crossref.org/mdt-staging/'
  }
}

module.exports = presets.production