import pool from '../config/database.js';

class Task {
  static async create(task) {
    const [result] = await pool.query(`
      INSERT INTO tasks (title, description, type, due_date, assigned_to, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [task.title, task.description, task.type, task.dueDate, task.assignedTo, task.createdBy]);
    return result.insertId;
  }

  static async getByUser(userId) {
    const [rows] = await pool.query(`
      SELECT * FROM tasks 
      WHERE assigned_to = ? OR created_by = ?
      ORDER BY due_date ASC
    `, [userId, userId]);
    return rows;
  }

  static async complete(taskId, userId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      
      await connection.query(`
        UPDATE tasks 
        SET completed = true, completed_at = NOW() 
        WHERE id = ? AND assigned_to = ?
      `, [taskId, userId]);

      const points = 5; // Base points for completing a task
      await connection.query(`
        UPDATE users 
        SET points = points + ? 
        WHERE id = ?
      `, [points, userId]);

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

export default Task;