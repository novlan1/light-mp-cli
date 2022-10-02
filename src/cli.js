const path = require('path');
const fs = require('fs');
const shell = require('shelljs');
const ci = require('miniprogram-ci');

const pkg = require(path.resolve(process.cwd(), './package.json'));


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


async function commit() {
  const gitLogInfo = await getLog();
  return Object.assign({}, gitLogInfo, {
    message:
      gitLogInfo.message.split(':')[1] || gitLogInfo.message.split('：')[1] || '',
  });
}

async function getDesc(env, author) {
  const gitLogInfo = await commit();
  console.log('gitLogInfo:\n', gitLogInfo);

  const fullDesc = `环境: ${env || ''}，分支: ${gitLogInfo.branch}，描述: ${gitLogInfo.message}，作者: ${author || gitLogInfo.author}`;
  return fullDesc;
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
  return pkg.version;
}

function getProjectName() {
  return pkg.name;
}

module.exports = {
  getProjectName,
  getVersion,
  getDesc,
  init,
  commit,
};

