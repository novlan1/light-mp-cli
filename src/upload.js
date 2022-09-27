const ci = require('miniprogram-ci');
const { timeStampFormat } = require('t-comm');
const { getVersion, init, commit } = require('./cli');
const sendRobotMsg = require('./wecom');

console.log('------开始上传------');

async function uploadMp({
  appId,
  appName,
  webhookUrl,
  env,
  type,
  projectPath,
  privateKeyPath,
  ignores,
  workSpace = process.cwd(),
  uploadOptions = {
  },
}) {
  try {
    const projectCi = await init({
      appId,
      type,
      projectPath,
      privateKeyPath,
      ignores,
      workSpace,
    });
    let robot;
    if (env === 'production') {
      robot = 3;
    } else {
      robot = 2;
    }
    const gitLogInfo = await commit();
    const version = getVersion();
    const fullDesc = `小程序环境：${env || ''}，开发分支：${gitLogInfo.branch}，描述：${gitLogInfo.message}，作者：${gitLogInfo.author}`;
    console.log('gitLogInfo:\n', gitLogInfo);

    const uploadResult = await ci.upload({
      project: projectCi,
      version,
      desc: fullDesc,
      robot,
      setting: {
        autoPrefixWXSS: false,
        es7: true,
        es6: true,
        minify: true,
        minifyJS: true,
        // minifyWXML: true,
        minifyWXSS: true,
        ...uploadOptions,
      },
    });
    console.log('------上传成功------');
    console.log('uploadResult:\n', uploadResult);
    sendRobotMsg({
      appName,
      version,
      developer: `ci机器人${robot}`,
      time: timeStampFormat(Date.now(), 'yyyy-MM-dd hh:mm:ss'),
      desc: fullDesc,
      webhookUrl,
    });
  } catch (error) {
    console.log('------上传失败------');
    console.error(error);
  } finally {
    console.log('------上传完成------');
  }
}

module.exports = uploadMp;

