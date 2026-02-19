"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTask = exports.deleteTask = exports.updateTask = exports.listTasks = void 0;
const db_1 = require("../db");
// GET /projects/:projectId/tasks
const listTasks = async (projectId) => {
    const { rows } = await db_1.pool.query(`
        SELECT id, project_id, title, is_done, created_at
        FROM tasks
        WHERE project_id = $1
    `, [projectId]);
    return rows;
};
exports.listTasks = listTasks;
// PUT /tasks/:id — полная замена задачи. Body: { "title": ..., "is_done": ... }
const updateTask = async (data) => {
    const { id, title, is_done } = data;
    const { rows } = await db_1.pool.query(`
        UPDATE tasks
        SET title = COALESCE($2, title), is_done = COALESCE($3, is_done)
        WHERE id = $1
        RETURNING id, project_id, title, is_done, created_at
    `, [id, title ?? null, is_done ?? null]);
    return rows[0];
};
exports.updateTask = updateTask;
// DELETE /tasks/:id
const deleteTask = async (id) => {
    const { rows } = await db_1.pool.query(`
        DELETE FROM tasks
        WHERE id = $1 RETURNING id, project_id, title, is_done, created_at
    `, [id]);
    return rows[0];
};
exports.deleteTask = deleteTask;
// POST /projects/:projectId/tasks — создать задачу. Body: { "title": ... }
const createTask = async (data) => {
    const { rows } = await db_1.pool.query(`
        INSERT INTO tasks (project_id, title, is_done)
        VALUES ($1, $2, COALESCE($3, false)) RETURNING id, project_id, title, is_done, created_at
    `, [data.project_id, data.title ?? null, data.is_done ?? null]);
    return rows[0];
};
exports.createTask = createTask;
//# sourceMappingURL=tasks.repository.js.map