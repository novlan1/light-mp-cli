const path = require('path');
const { getGitCommitInfo } = require('t-comm');

const pkg = require(path.resolve(process.cwd(), './package.json'));

function getVersion() {
  return pkg.version;
}


function getProjectName() {
  return pkg.name;
}

async function getBuildDesc(env = '', author = '') {
  const commitInfo = getGitCommitInfo();

  console.log('commitInfo:\n', commitInfo);

  const fullDesc = `环境：${env || ''}，分支：${commitInfo.branch}，描述：${commitInfo.message}，作者：${author || commitInfo.author}`;
  return fullDesc;
}


module.exports = {
  getVersion,
  getProjectName,
  getBuildDesc,
};

