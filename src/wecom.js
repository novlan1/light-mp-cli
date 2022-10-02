const { sendWxRobotMarkdown } = require('t-comm');

async function sendRobotMsg({
  appName,
  version = '',
  developer = '',
  time = '',
  desc = '',
  webhookUrl,
}) {
  if (!webhookUrl) {
    return;
  }

  const descList = [
    `版本: ${version || ''}`,
    `提交者: ${developer || ''}`,
    `${desc || ''}`,
    `提交时间: ${time || ''}`,
  ];
  const template = `>【${appName}自动化构建成功】${descList.join('，')}`;

  sendWxRobotMarkdown({
    webhookUrl,
    content: template,
  });
}

module.exports = sendRobotMsg;

// sendRobotMsg({
//   appName: '王者赛宝小程序',
//   version: '1.0.0',
//   developer: 'ci机器人2',
//   time: '2022-09-27 13:20:07',
//   desc: '小程序环境：upload，开发分支：feature/cross ，描述： 增加监控，作者：xx',
// });
