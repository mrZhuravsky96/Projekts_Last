import { pool } from "../db";
import { ProjectRowDb } from "./projects.repository";

export type TaskRowDb = {
    id: number;
    project_id: number;
    title: string;
    is_done: boolean;
    created_at: Date;
};

export type NewTaskInput = {
    project_id: number;
    title?: string;
    is_done?: boolean;
};

export type UpdateTaskInput = {
    id: number;
    title?: string;
    is_done?: boolean;
};



// GET /projects/:projectId/tasks
export const listTasks = async (projectId: number): Promise<TaskRowDb[]> => {
    const { rows } = await pool.query<TaskRowDb>(`
        SELECT id, project_id, title, is_done, created_at
        FROM tasks
        WHERE project_id = $1
    `, [projectId]);
    return rows;
};

// PUT /tasks/:id — полная замена задачи. Body: { "title": ..., "is_done": ... }
export const updateTask = async (data: UpdateTaskInput) => {
    const { id, title, is_done } = data;
    const { rows } = await pool.query(`
        UPDATE tasks
        SET title = COALESCE($2, title), is_done = COALESCE($3, is_done)
        WHERE id = $1
        RETURNING id, project_id, title, is_done, created_at
    `, [id, title ?? null, is_done ?? null]);
    return rows[0];
};

// DELETE /tasks/:id
export const deleteTask = async (id: number) => {
    const { rows } = await pool.query(`
        DELETE FROM tasks
        WHERE id = $1 RETURNING id, project_id, title, is_done, created_at
    `, [id]);
    return rows[0];
};

// POST /projects/:projectId/tasks — создать задачу. Body: { "title": ... }
export const createTask = async (data: NewTaskInput) => {
    const { rows } = await pool.query(`
        INSERT INTO tasks (project_id, title, is_done)
        VALUES ($1, $2, COALESCE($3, false)) RETURNING id, project_id, title, is_done, created_at
    `, [data.project_id, data.title ?? null, data.is_done ?? null]);
    return rows[0];
};


