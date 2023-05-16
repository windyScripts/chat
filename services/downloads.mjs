import Downloads from '../models/downloads.mjs';

export const createDownload = async (params, transaction = null) => {
  return Downloads.create(params, { transaction });
};
