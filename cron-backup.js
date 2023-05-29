/* 

  * * * * * *
  | | | | | |
  | | | | | day of week
  | | | | month
  | | | day of month
  | | hour
  | minute
  second ( optional )
  
  */

import cron from 'node-cron'
import sequelize from './util/database.mjs'
import {createBackup} from './services/backup.mjs'
import { getAllMessages, truncateMessageDB } from './services/message.mjs';

  cron.schedule('59 23 * * *', async function() {
    console.log('---------------------');
    console.log('Running Cron Job: Backing up messages');
    const t = await sequelize.transaction();
    const messages = await getAllMessages(t);
    await truncateMessageDB(t);
    await createBackup(messages,t);
  });
  