// src/index.ts
import express, { Request, Response } from "express";
import cors from "cors";
import {
    listProjects,
    getProjectById,
    createProject,
    updateProject,
    deleteProject,
    ProjectFilter,
    NewProjectInput,
    UpdateProjectInput,

} from "./repositories/projects.repository";
import {
    createTask,
    TaskRowDb,
    NewTaskInput,
    UpdateTaskInput,
    deleteTask,
    listTasks,
    updateTask,

} from "./repositories/tasks.repository";
import {
    getProjectWithTasksJoin,
}
    from "./repositories/project-with-tasks.repository";
const app = express();
const port = Number(process.env.PORT) || 3000;

const HTTP = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
} as const;

app.use(express.json());
app.use(cors());

// Пинг
app.get("/", (_req: Request, res: Response) => {
    res.status(HTTP.OK).json({ message: "Projects API is up" });
});

// GET /projects?name=...
app.get("/projects", async (req: Request, res: Response) => {
    const { name, status } = req.query as ProjectFilter;
    const rows = await listProjects({ name, status });
    res.status(HTTP.OK).json(rows);
});

// GET /projects/:id
app.get("/projects/:id", async (req: Request, res: Response) => {
    const idNum = Number(req.params.id);
    if (isNaN(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }

    const row = await getProjectById(idNum);
    if (!row) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.status(HTTP.OK).json(row);
});

// POST /projects   { name, description?, status? }
app.post("/projects", async (req: Request, res: Response) => {
    const { name, description, status } = req.body as NewProjectInput;

    if (!name) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Name is required" });
        return;
    }

    const created = await createProject({
        name,
        description,
        status,
    });
    res.status(HTTP.CREATED).json(created);
});

// PUT /projects/:id   { name, description?, status? }
app.put("/projects/:id", async (req: Request, res: Response) => {
    const idNum = Number(req.params.id);
    if (isNaN(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }

    const { name, description, status } = req.body as UpdateProjectInput;

    if (!name || !description || !status) {
        res.status(HTTP.BAD_REQUEST).json({ error: "name, description, status are required" });
        return;
    }

    const updated = await updateProject(idNum, {
        name: name.trim(),
        description,
        status,
    });
    if (!updated) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.status(HTTP.OK).json(updated); // (можно 204 No Content)
});

// DELETE /projects/:id
app.delete("/projects/:id", async (req: Request, res: Response) => {
    const idNum = Number(req.params.id);
    if (isNaN(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }

    const ok = await deleteProject(idNum);
    if (!ok) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.sendStatus(HTTP.NO_CONTENT);
});

//POST /projects/:projectId/tasks — создать задачу. Body: { "title": ... }
app.post("/projects/:projectId/tasks", async (req: Request, res: Response) => {
    const projectIdNum = Number(req.params.projectId);
    if (isNaN(projectIdNum) || projectIdNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }

    const { title } = req.body as NewTaskInput;
    if (!title) {
        res.status(HTTP.BAD_REQUEST).json({ error: "title is required" });
        return;
    }

    const task = await createTask({ project_id: projectIdNum, title });
    res.status(HTTP.CREATED).json(task);
});

// GET /projects/:projectId/tasks — получить список задач проекта
app.get("/projects/:projectId/tasks", async (req: Request, res: Response) => {
    const projectIdNum = Number(req.params.projectId);
    if (isNaN(projectIdNum) || projectIdNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }
    const tasks = await listTasks(projectIdNum);
    res.status(HTTP.OK).json(tasks);
});

// PUT /tasks/:id — полная замена задачи. Body: { "title": ..., "is_done": ... }
app.put("/tasks/:id", async (req: Request, res: Response) => {
    const idNum = Number(req.params.id);
    if (isNaN(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid task ID" });
        return;
    }
    const { title, is_done } = req.body as UpdateTaskInput;
    const task = await updateTask({ id: idNum, title, is_done });
    if (!task) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.status(HTTP.OK).json(task);
});

// DELETE /tasks/:id
app.delete("/tasks/:id", async (req: Request, res: Response) => {
    const idNum = Number(req.params.id);
    if (isNaN(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid task ID" });
        return;
    }
    const task = await deleteTask(idNum);
    if (!task) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.status(HTTP.OK).json(task);
});
// GET /projects/:id/with-tasks — получить проект с задачами
app.get("/projects/:id/with-tasks", async (req: Request, res: Response) => {
    const idNum = Number(req.params.id);
    if (isNaN(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }
    const project = await getProjectWithTasksJoin(idNum);
    if (!project) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.status(HTTP.OK).json(project);
})
app.listen(port, () => console.log(`✅ http://localhost:${port}`));

