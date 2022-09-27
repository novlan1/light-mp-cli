const uploadMp = require('./src/upload');
const previewMp = require('./src/preview');

async function upload(args = {}) {
  await uploadMp(args);
}

async function preview(args = {}) {
  await previewMp(args);
}

module.exports = {
  upload,
  preview,
};

