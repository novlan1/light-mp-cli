const ci = require('miniprogram-ci');
const { timeStampFormat } = require('t-comm');

const { init } = require('./cli');
const { getVersion, getBuildDesc } = require('./util');
const { sendRobotMsg } = require('./wecom');


const DEFAULT_MAX_TRY_TIMES = 3;
let tryTimes = 1;


async function realUpload({
  appId,
  appName,
  webhookUrl,
  env,
  robot,
  author,

  type,
  projectPath,
  privateKeyPath,
  ignores,
  uploadOptions,
}) {
  const projectCi = await init({
    appId,
    type,
    projectPath,
    privateKeyPath,
    ignores,
  });

  const version = await getVersion();
  const fullDesc = await getBuildDesc(env, author);

  const uploadResult = await ci.upload({
    project: projectCi,
    version,
    desc: fullDesc,
    robot,
    setting: {
      autoPrefixWXSS: false,
      es7: false,
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
    developer: `CI机器人${robot}`,
    time: timeStampFormat(Date.now(), 'yyyy-MM-dd hh:mm:ss'),
    desc: fullDesc,
    webhookUrl,
  });
}

async function uploadMp({
  appId,
  appName,
  webhookUrl,
  env,
  robot,
  tryTimes: maxTryTimes = DEFAULT_MAX_TRY_TIMES,
  author = '',


  type,
  projectPath,
  privateKeyPath,
  ignores,
  uploadOptions = {
  },
}) {
  console.log('------开始上传------');
  const args = {
    appId,
    appName,
    webhookUrl,
    env,
    robot,
    author,

    type,
    projectPath,
    privateKeyPath,
    ignores,
    uploadOptions,
  };

  try {
    await realUpload(args);
  } catch (error) {
    console.log('------上传失败------');
    console.error(error);

    if (tryTimes <= maxTryTimes) {
      console.log('正在重试，重试次数：', tryTimes);
      tryTimes += 1;

      await uploadMp(args);
    }
  } finally {
    // console.log('------上传完成------');
  }
}

module.exports = uploadMp;

