const AWS = require('aws-sdk');
const S3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.REGION,
 });
 
const uploadToS3 = (req, fileName) => {
  return new Promise((resolve, reject) => {
    const params = {
      Key: fileName,
      Bucket: process.env.S3_BUCKET,
      Body: req,
    };
    S3.upload(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve({status: "success"});
      }
    });
  });
};



module.exports = { uploadToS3 };