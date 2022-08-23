const fs = require('fs');
const FormData = require('form-data');
const rfs = require('recursive-fs');
const basePathConverter = require('base-path-converter');
const got = require('got');

export default async function pinDirectory() {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const src = '../dist/';
  try {
    const { dirs, files } = await rfs.read(src);
    let data = new FormData();
    for (const file of files) {
      data.append(`file`, fs.createReadStream(file), {
        filepath: basePathConverter(src, file),
      });
    }
    const response = await got(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
        Authorization: process.env.PINATA_JWT,
      },
      body: data,
    }).on('uploadProgress', (progress) => {
      console.log(progress);
    });
    console.log(JSON.parse(response.body));
  } catch (error) {
    console.log(error);
  }
}
