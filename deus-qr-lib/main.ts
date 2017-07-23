import App from './app'

const config = require('../../configs/deus-qr-lib');

new App(config.user, config.password).listen(8159);