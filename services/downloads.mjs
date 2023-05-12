import Downloads from '../models/downloads.mjs';

export const createDownload = async params => {
  try {
    return new Promise((resolve, reject) => {
      Downloads.create(params).then(data => resolve(data)).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

/* export const findOneDownload = async (params) => {
  try {
    return new Promise((resolve, reject) => {
      Downloads.findOne(params).then(user => resolve(user)).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
};

export const findAllDownloads = async (params) => {
  try {
    return new Promise((resolve, reject) => {
      Downloads.findAll(params).then(data => resolve(data)).catch(err => reject(err));
    });
  } catch (err) {
    return new Promise((resolve, reject) => reject(err));
  }
}; */
