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
    `版本：${version || ''}`,
    `提交者：${developer || ''}`,
    `${desc || ''}`,
    `提交时间：${time || ''}`,
  ];
  const template = `>【${appName}自动化构建成功】${descList.join('，')}`;

  sendWxRobotMarkdown({
    webhookUrl,
    content: template,
  });
}

module.exports = {
  sendRobotMsg,
};

