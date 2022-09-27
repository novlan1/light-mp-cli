// index.js
const path = require('path');
const shell = require('shelljs');
const ci = require('miniprogram-ci');

const desc = '小程序上传';
const args = process.argv.splice(2);
console.log('------小程序环境------', args[0]);


let gWorkSpace = process.cwd();

async function init({
  appId,
  type = 'miniProgram',
  projectPath,
  privateKeyPath,
  ignores = ['node_modules/**/*'],
  workSpace = process.cwd(),
}) {
  console.log('workSpace: ', workSpace);
  gWorkSpace = workSpace;
  if (!projectPath) {
    projectPath = path.resolve(workSpace, 'dist/build/mp-weixin');
  }
  if (!privateKeyPath) {
    privateKeyPath = path.resolve(workSpace, 'private.key');
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

function getVersion() {
  const pkg = require(path.resolve(gWorkSpace, './package.json'));
  return pkg.version;
}

function getProjectName() {
  const pkg = require(path.resolve(gWorkSpace, './package.json'));
  return pkg.name;
}

module.exports = {
  desc: `小程序环境：${args[0] || ''}`, // 上传备注信息
  getProjectName, // 项目名，用于后台设置的账号密码匹配
  getVersion,
  init,
  commit,
};

