import pool from '../config/database.js';
import bcrypt from 'bcryptjs';

class User {
  static async createAdmin() {
    const connection = await pool.getConnection();
    try {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await connection.query(`
        INSERT INTO users (username, password, role, is_admin)
        VALUES ('admin', ?, 'admin', true)
        ON DUPLICATE KEY UPDATE password = ?
      `, [hashedPassword, hashedPassword]);
    } finally {
      connection.release();
    }
  }

  static async findByUsername(username) {
    const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    return rows[0];
  }

  static async createFamilyMember(username, password, name, avatar) {
    const connection = await pool.getConnection();
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await connection.query(`
        INSERT INTO users (username, password, name, avatar, role)
        VALUES (?, ?, ?, ?, 'member')
      `, [username, hashedPassword, name, avatar]);
      return result.insertId;
    } finally {
      connection.release();
    }
  }

  static async getPoints(userId) {
    const [rows] = await pool.query('SELECT points FROM users WHERE id = ?', [userId]);
    return rows[0]?.points || 0;
  }

  static async updatePoints(userId, points) {
    await pool.query('UPDATE users SET points = ? WHERE id = ?', [points, userId]);
  }
}

export default User;