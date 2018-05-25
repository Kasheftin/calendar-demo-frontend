let velocity = (el, properties, callback) => {
  console.error('velocity error, this should not be triggered because this is a server side only placeholder')
}

if (process.browser) {
  velocity = require('velocity-animate')
}

export default velocity
