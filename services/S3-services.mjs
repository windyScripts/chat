import AWS from 'aws-sdk';

const { S3 } = AWS;

export const uploadtoS3 = async (data, fileName) => {
  try {
    const s3Bucket = new S3({
      accessKeyId: process.env.IAM_USER_KEY,
      secretAccessKey: process.env.IAM_USER_SECRET,
    });

    var params = {
      Bucket: process.env.BUCKET_NAME,
      Key: fileName,
      Body: data,
      ACL: 'public-read',
    };
    return new Promise((resolve, reject) => {
      s3Bucket.upload(params, (err, s3response) => {
        if (err) {
          console.log('Something went wrong', err);
          reject(err);
        } else {
          console.log('Success');
          resolve(s3response.Location);
        }
      });
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

