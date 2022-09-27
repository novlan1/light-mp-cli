const ci = require('miniprogram-ci');
const { version, desc, init, commit } = require('./cli');

console.log('------开始上传------');

async function uploadMp({
  appId,
  type,
  projectPath,
  privateKeyPath,
  ignores,
  uploadOptions = {

  },
}) {
  try {
    const projectCi = init({
      appId,
      type,
      projectPath,
      privateKeyPath,
      ignores,

    });
    const gitLogInfo = await commit();
    console.log('gitLogInfo:\n', gitLogInfo);

    const uploadResult = await ci.upload({
      project: projectCi,
      version,
      desc: `${desc}，开发分支：${gitLogInfo.branch}，描述：${gitLogInfo.message}，作者：${gitLogInfo.author}`,
      robot: 2, // 本地部署机器人为 2,Jenkins部署机器人为 1
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
  } catch (error) {
    console.log('------上传失败------');
    console.error(error);
  } finally {
    console.log('------上传完成------');
  }
}

module.exports = uploadMp;

