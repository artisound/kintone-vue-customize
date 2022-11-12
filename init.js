const fse = require('fs-extra');
fse.copyFileSync('./.env.sample', `./.env`);
fse.copyFileSync('./auth.json.sample', `./auth.json`);
fse.copyFileSync('./manifest.json.sample', `./manifest.json`);
fse.copyFileSync('./manifest-dev.json.sample', `./manifest-dev.json`);
