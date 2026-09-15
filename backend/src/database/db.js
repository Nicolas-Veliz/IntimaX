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
      user_id INT NOT NULL,
      action VARCHAR(20) NOT NULL,
      timestamp DATETIME NOT NULL,
      session_duration INT NULL,
      ip_address VARCHAR(45) NULL,
      INDEX idx_activity_logs_user_timestamp (user_id, timestamp)
    )
  `);

  await ensureColumn('activity_logs', 'session_duration', 'INT NULL');
  await ensureColumn('activity_logs', 'ip_address', 'VARCHAR(45) NULL');
  await ensureColumn('rooms', 'extended_price', 'DECIMAL(10, 2) NOT NULL DEFAULT 0');
  await ensureColumn('rooms', 'price_per_extra_hour', 'DECIMAL(10, 2) NOT NULL DEFAULT 0');
  await ensureColumn('rooms', 'cleaning_time_minutes', 'INT NOT NULL DEFAULT 20');
};

export const databaseReady = ensureSessionSchema().catch((error) => {
  console.error('No se pudo preparar el esquema de sesiones:', error.message);
  throw error;
});

console.log('📊 Conexión a base de datos establecida');

export default pool;