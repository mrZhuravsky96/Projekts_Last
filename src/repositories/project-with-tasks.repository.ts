import { pool } from "../db";
import { ProjectRowDb } from "./projects.repository";
import { TaskRowDb } from "./tasks.repository";
export type ProjectWithTasks = {
    project: ProjectRowDb;
    tasks: TaskRowDb[];
};

export async function getProjectWithTasksJoin(projectId: number): Promise<ProjectWithTasks | null> {
    const query = `
        SELECT
            p.*,
            t.id          AS t_id,
            t.project_id  AS t_project_id,
            t.title       AS t_title,
            t.is_done     AS t_is_done,
            t.created_at  AS t_created_at
        FROM projects p
        LEFT JOIN tasks t ON t.project_id = p.id
        WHERE p.id = $1
        ORDER BY t.id DESC
    `;

    const { rows } = await pool.query(query, [projectId]);

    if (rows.length === 0) {
        return null;
    }

    const project = {
        id: rows[0].id,
        name: rows[0].name,
        description: rows[0].description,
        status: rows[0].status,
        created_at: rows[0].created_at,
    };

    const tasks = rows.reduce<ProjectWithTasks["tasks"]>((tasks, row) => {
        if (row.t_id !== null) {
            tasks.push({
                id: row.t_id,
                project_id: row.t_project_id,
                title: row.t_title,
                is_done: row.t_is_done,
                created_at: row.t_created_at,
            });
        }
        return tasks;
    }, []);

    return { project, tasks };
}