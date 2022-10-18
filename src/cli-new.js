const path = require('path');
const fs = require('fs');
const ci = require('miniprogram-ci');

const {
  sendWxRobotMarkdown,
  timeStampFormat,
  getGitCommitInfo,
  addTextForImg,
  uploadCOSFile,
  saveBase64ImgToFile,
} = require('t-comm');

const { DEFAULT_BUILD_SETTING }  = require('./config');

class MpCLI {
  constructor(options = {}) {
    this.options = options;
    this.projectCI = null;
    this.savePreviewPath = path.resolve(process.cwd(), 'preview_destination.png');
    const {
      appId,
      projectPath,
      privateKeyPath,
      ignores,
      type,
      root,
      env,
      robotNumber,
      buildSetting,

      webhookUrl,
      chatId,
      cosInfo,
    } = options;

    this.appId = appId;
    this.type = type || 'miniProgram';

    this.root = root || process.cwd();
    this.ignores = ignores || ['node_modules/**/*'];
    this.pkgFile = path.resolve(this.root, './package.json');

    this.env = env || 'test';
    this.robotNumber = robotNumber || 30;

    this.webhookUrl = webhookUrl;
    this.chatId = chatId;

    this.buildSetting = {
      ...DEFAULT_BUILD_SETTING,
      ...(buildSetting || {}),

    };
    this.projectPath = projectPath;
    this.privateKeyPath = privateKeyPath;
    this.cosInfo = cosInfo || {};

    if (!this.projectPath) {
      this.projectPath = path.resolve(root, 'dist/build/mp-weixin');
    }
    if (!this.privateKeyPath) {
      this.privateKeyPath = path.resolve(root, 'private.key');
    }

    if (!fs.existsSync(this.privateKeyPath)) {
      throw new Error('ERROR: privateKeyPath 位置不存在');
    }
    if (!fs.existsSync(this.projectPath)) {
      throw new Error('ERROR: projectPath 位置不存在');
    }

    if (!fs.existsSync(this.pkgFile)) {
      throw new Error('ERROR: package.json 不存在');
    }

    this.init();
    this.commitInfo = getGitCommitInfo(this.root);
    this.buildDesc = this.getBuildDesc();
    this.buildTime = timeStampFormat(Date.now(), 'yyyy-MM-dd hh:mm:ss');
    this.version = this.getVersion();
  }

  init() {
    const { appId, projectPath, privateKeyPath, ignores, type } = this;

    this.projectCI = new ci.Project({
      appid: appId,
      type,
      projectPath,
      privateKeyPath,
      ignores,
    });
  }

  getPkgInfo() {
    return require(this.pkgFile) || {};
  }

  getVersion() {
    return this.getPkgInfo().version;
  }

  async getBuildDesc() {
    const { env, commitInfo } = this;
    const buildDesc = `环境：${env || ''}，分支：${commitInfo.branch}，Last Commit：${commitInfo.author} - ${commitInfo.message}`;
    return buildDesc;
  }

  async upload() {
    const { robotNumber, version, buildDesc } = this;

    const uploadResult = await ci.upload({
      project: this.projectCI,
      version,
      desc: buildDesc,
      robot: robotNumber,
      setting: this.buildSetting,
    });
    console.log('UploadResult:\n', uploadResult);
  }

  async preview() {
    const previewResult = await ci.preview({
      project: this.projectCI,
      desc: this.buildDesc,
      setting: this.buildSetting,
      qrcodeFormat: 'image',
      qrcodeOutputDest: this.savePreviewPath,
      // pagePath: 'pages/index/index', // 预览页面
      // searchQuery: 'a=1&b=2',  // 预览参数 [注意!]这里的`&`字符在命令行中应写成转义字符`&`
    });
    console.log('PreviewResult:\n', previewResult);

    await this.uploadPreviewImg();
  }

  async uploadPreviewImg() {
    const { robotNumber, env, buildTime, commitInfo, version } = this;
    const newPreviewImg = await addTextForImg({
      width: 300,
      height: 300,
      imgPath: this.savePreviewPath,
      textList: [
        '【赛宝小程序自动构建】',
        `版本：${version}，提交者：CI机器人${robotNumber}，环境：${env}`,
        `分支：${commitInfo.branch}`,
        `提交时间：${buildTime}`,
        `Commit：${commitInfo.author} - ${commitInfo.message}`,
      ].map((item) => {
        if (item.length > 35) return `${item.slice(0, 35)}...`;
        return item;
      }),

    });

    await saveBase64ImgToFile({
      imgUrl: newPreviewImg,
      savePath: this.savePreviewPath,
    });
    this.uploadFiles([
      {
        key: `${this.cosInfo.dir}/${commitInfo.branch.replace(/\//g, '-')}_${env}.png`,
        path: this.savePreviewPath,
      },
    ]);
  }

  async uploadAndPreview() {
    await this.upload();
    await this.preview();
  }

  async sendRobotMsg() {
    const { robotNumber, webhookUrl, version, buildDesc, buildTime } = this;
    let { chatId } = this;
    if (!webhookUrl) {
      return;
    }
    if (!chatId) {
      chatId = undefined;
    }

    const descList = [
      `版本：${version || ''}`,
      `提交者：CI机器人${robotNumber}`,
      buildDesc,
      `提交时间：${buildTime || ''}`,
    ];

    const template = `>【构建成功】${descList.join('，')}`;

    sendWxRobotMarkdown({
      webhookUrl,
      content: template,
      chatId,
    });
  }

  async uploadFiles(files) {
    const { secretId, secretKey, bucket, region } = this.cosInfo || {};
    await uploadCOSFile({
      files,
      secretId,
      secretKey,
      bucket,
      region,
    });
  }
}


module.exports = MpCLI;
