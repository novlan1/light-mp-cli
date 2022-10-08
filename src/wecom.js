const { sendWxRobotMarkdown } = require('t-comm');

async function sendRobotMsg({
  appName,
  version = '',
  developer = '',
  time = '',
  desc = '',
  webhookUrl,
  chatId,
}) {
  if (!webhookUrl) {
    return;
  }
  if (!chatId) {
    chatId = undefined;
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
    chatId,
  });
}

module.exports = {
  sendRobotMsg,
};

