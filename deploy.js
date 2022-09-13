const { PowerShell } = require('node-powershell');
const auth = require('./auth.json');

(async () => {
  if (!auth) {
    console.error('`auth.jsonを作成し、kintoneの権限情報を設定してください。`');
    return;
  }
  console.log('⏫ deploying ===================');
  await PowerShell.$`node ./node_modules/@kintone/customize-uploader/bin/cli manifest.json --domain ${auth.domain} --username ${auth.username} --password ${auth.password}`;
  console.log('✅ deployed  ===================');
})();