const ci = require('miniprogram-ci');
const { timeStampFormat } = require('t-comm');

const { getVersion, init, getDesc } = require('./cli');
const sendRobotMsg = require('./wecom');


const MAX_TRY_TIMES = 3;
let tryTimes = 1;


async function realUpload({
  appId,
  appName,
  webhookUrl,
  env,
  robot,

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
  const fullDesc = await getDesc(env);

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

    if (tryTimes <= MAX_TRY_TIMES) {
      console.log('正在重试，重试次数：', tryTimes);
      tryTimes += 1;

      await uploadMp(args);
    }
  } finally {
    // console.log('------上传完成------');
  }
}

module.exports = uploadMp;

