// index.js
const path = require('path');
const shell = require('shelljs');
const ci = require('miniprogram-ci');
const pkg = require('./package.json');

const desc = '小程序上传';
const args = process.argv.splice(2);
console.log('------小程序环境------', args[0]);


async function init({
  appId,
  type = 'miniProgram',
  projectPath = path.resolve(process.cwd(), 'dist/build/mp-weixin'),
  privateKeyPath = path.resolve(process.cwd(), 'private.key'),
  ignores = ['node_modules/**/*'],
}) {
  const projectCi = new ci.Project({
    appid: appId,
    type,
    projectPath,
    privateKeyPath,
    ignores,
  });
  return projectCi;
}


async function commit() {
  const gitLogInfo = await getLog();
  return Object.assign({}, gitLogInfo, {
    message:
      gitLogInfo.message.split(':')[1] || gitLogInfo.message.split('：')[1] || desc,
  });
}

function getLog() {
  const command = 'git log --no-merges -1 \
  --date=iso --pretty=format:\'{"author": "%aN","message": "%s"},\' \
  $@ | \
  perl -pe \'BEGIN{print "["}; END{print "]\n"}\' | \
  perl -pe \'s/},]/}]/\'';
  return new Promise((resolve, reject) => {
    shell.exec(command, (code, stdout, stderr) => {
      if (code) {
        reject(stderr);
      } else {
        const obj = Object.assign({}, JSON.parse(stdout)[0], {
          branch: shell.exec('git symbolic-ref --short -q HEAD').stdout,
        });
        resolve(obj);
      }
    });
  });
}

module.exports = {
  projectName: pkg.name, // 项目名，用于后台设置的账号密码匹配
  version: pkg.version, // 本次发布的版本号
  desc: `小程序环境：${args[0]}`, // 上传备注信息
  init,
  commit,
};

