import AWS from 'aws-sdk';
import responseMessages from '../utils/responseMsgs.js';

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_ACCOUNT_EMAIL_REGION,
  signatureVersion: 'v4'
});

export const uploadFilePublic = (fileContent, filename, folder) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `${folder}/${filename}`,
    Body: fileContent
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) return reject(err);
      resolve(data.Location);
    });
  });
};

export const uploadImageToS3 = async (filePath, fileContent, contentType = 'image/jpeg') => {
  const params = {
    Bucket: process.env.AWS_PUBLIC_PROD_BUCKET_NAME,
    Key: filePath,
    Body: fileContent,
    ContentType: contentType
  };

  try {
    const data = await s3.upload(params).promise();
    const awsFileUrl = `https://${process.env.AWS_PUBLIC_PROD_BUCKET_NAME}.s3.${process.env.AWS_ACCOUNT_EMAIL_REGION}.amazonaws.com/${filePath}`;
    return {
      status_code: 200,
      status_message: responseMessages.file_upload_success,
      result: awsFileUrl,
      data
    };
  } catch (error) {
    return {
      status_code: 500,
      error: responseMessages.file_upload_failed_message,
      reason: error.code
    };
  }
};

export const uploadPdfBufferToS3 = async (filePath, pdfBuffer, contentType = 'application/pdf') => {
  const params = {
    Bucket: process.env.AWS_PUBLIC_PROD_BUCKET_NAME,
    Key: filePath,
    Body: pdfBuffer,
    ContentType: contentType
  };

  try {
    const data = await s3.putObject(params).promise();
    const awsFileUrl = `https://${process.env.AWS_PUBLIC_PROD_BUCKET_NAME}.s3.${process.env.AWS_ACCOUNT_EMAIL_REGION}.amazonaws.com/${filePath}`;
    return {
      status_code: 200,
      status_message: responseMessages.file_upload_success,
      result: awsFileUrl,
      data,
      awsFileUrl
    };
  } catch (error) {
    return {
      status_code: 500,
      error: responseMessages.file_upload_failed_message,
      reason: error.code
    };
  }
};

export const getFileFromS3 = async (filePath) => {
  const params = {
    Bucket: process.env.AWS_PUBLIC_PROD_BUCKET_NAME,
    Key: filePath
  };

  try {
    const data = await s3.getObject(params).promise();
    return {
      status_code: 200,
      status_message: responseMessages.file_upload_success,
      data
    };
  } catch (error) {
    return {
      status_code: 500,
      error: responseMessages.file_upload_failed_message,
      reason: error.code
    };
  }
};

export const deleteFileFromS3 = async (fileName) => {
  const params = {
    Bucket: process.env.AWS_PUBLIC_PROD_BUCKET_NAME,
    Key: fileName
  };

  try {
    await s3.deleteObject(params).promise();
    return {
      status_code: 200,
      status_message: responseMessages.file_delete_success
    };
  } catch (error) {
    return {
      status_code: 500,
      error: responseMessages.file_not_deleted_msg,
      reason: error
    };
  }
};
