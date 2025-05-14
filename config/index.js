import mailer from './smtp.js';
import connection from './rethinkdb.js';

export default connection;

export { mailer, connection };