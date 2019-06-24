import App from './app';

const port = Number(process.env.PORT || 80);
new App('', '').listen(port);
