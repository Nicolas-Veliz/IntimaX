import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const requiredEnv = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const v of requiredEnv) {
  if (!process.env[v]) {
    console.error(`Missing required env var ${v}. Aborting startup.`);
    process.exit(1);
  }
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4',
  timezone: 'Z'
});

const ensureColumn = async (tableName, columnName, definition) => {
  const [columns] = await pool.execute(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = ? AND table_name = ? AND column_name = ?`,
    [process.env.DB_NAME, tableName, columnName]
  );

  if (columns.length === 0) {
    await pool.execute(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
};

const ensureSessionSchema = async () => {
  await ensureColumn('users', 'last_login', 'DATETIME NULL');
  await ensureColumn('users', 'last_logout', 'DATETIME NULL');
  await ensureColumn('users', 'session_duration', 'INT NULL');

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NULL,
      action VARCHAR(20) NOT NULL,
      timestamp DATETIME NOT NULL,
      session_duration INT NULL,
      ip_address VARCHAR(45) NULL,
      INDEX idx_activity_logs_user_timestamp (user_id, timestamp)
    )
  `);

  await ensureColumn('activity_logs', 'session_duration', 'INT NULL');
  await ensureColumn('activity_logs', 'ip_address', 'VARCHAR(45) NULL');
  await ensureActivityLogUserForeignKey();
  await ensureColumn('rooms', 'extended_price', 'DECIMAL(10, 2) NOT NULL DEFAULT 0');
  await ensureColumn('rooms', 'price_per_extra_hour', 'DECIMAL(10, 2) NOT NULL DEFAULT 0');
  await ensureColumn('rooms', 'cleaning_time_minutes', 'INT NOT NULL DEFAULT 20');
};

const ensureActivityLogUserForeignKey = async () => {
  const [columns] = await pool.execute(
    `SELECT column_type AS column_type, is_nullable AS is_nullable
     FROM information_schema.columns
     WHERE table_schema = ? AND table_name = 'activity_logs' AND column_name = 'user_id'`,
    [process.env.DB_NAME]
  );
  const userIdColumn = columns[0];

  if (!userIdColumn) {
    throw new Error('No se encontró activity_logs.user_id');
  }

  const [foreignKeys] = await pool.execute(
    `SELECT kcu.constraint_name AS constraint_name, rc.delete_rule AS delete_rule
     FROM information_schema.key_column_usage kcu
     JOIN information_schema.referential_constraints rc
       ON rc.constraint_schema = kcu.constraint_schema
       AND rc.table_name = kcu.table_name
       AND rc.constraint_name = kcu.constraint_name
     WHERE kcu.constraint_schema = ?
       AND kcu.table_name = 'activity_logs'
       AND kcu.column_name = 'user_id'
       AND kcu.referenced_table_name = 'users'`,
    [process.env.DB_NAME]
  );

  if (
    userIdColumn.is_nullable === 'YES' &&
    foreignKeys.length === 1 &&
    foreignKeys[0].delete_rule === 'SET NULL'
  ) {
    return;
  }

  for (const foreignKey of foreignKeys) {
    const constraintName = foreignKey.constraint_name.replace(/`/g, '``');
    await pool.execute(`ALTER TABLE activity_logs DROP FOREIGN KEY \`${constraintName}\``);
  }

  if (userIdColumn.is_nullable !== 'YES') {
    await pool.execute(
      `ALTER TABLE activity_logs MODIFY COLUMN user_id ${userIdColumn.column_type} NULL`
    );
  }

  await pool.execute(`
    ALTER TABLE activity_logs
    ADD CONSTRAINT fk_activity_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  `);
};

export const databaseReady = ensureSessionSchema().catch((error) => {
  console.error('No se pudo preparar el esquema de sesiones:', error.message);
  throw error;
});

console.log('📊 Conexión a base de datos establecida');

export default pool;