const path = require('path');
const fs = require('fs');
const ci = require('miniprogram-ci');


async function init({
  appId,
  type = 'miniProgram',
  projectPath = path.resolve(process.cwd(), 'dist/build/mp-weixin'),
  privateKeyPath = path.resolve(process.cwd(), 'private.key'),
  ignores = ['node_modules/**/*'],
}) {
  if (!fs.existsSync(privateKeyPath)) {
    throw new Error('privateKeyPath 位置不存在');
  }
  if (!fs.existsSync(projectPath)) {
    throw new Error('projectPath 位置不存在');
  }

  const projectCi = new ci.Project({
    appid: appId,
    type,
    projectPath,
    privateKeyPath,
    ignores,
  });
  return projectCi;
}


module.exports = {
  init,
};

