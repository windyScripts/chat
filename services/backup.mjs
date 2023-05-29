import Backup from '../models/backup.mjs'

export const createBackup = (messages,transaction=null) => {
    return Backup.create(messages,{transaction});
}