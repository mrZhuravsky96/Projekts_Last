"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const projects_repository_1 = require("./repositories/projects.repository");
const tasks_repository_1 = require("./repositories/tasks.repository");
const project_with_tasks_repository_1 = require("./repositories/project-with-tasks.repository");
const app = (0, express_1.default)();
const port = Number(process.env.PORT) || 3000;
const HTTP = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
};
app.use(express_1.default.json());
app.use((0, cors_1.default)());
// Пинг
app.get("/", (_req, res) => {
    res.status(HTTP.OK).json({ message: "Projects API is up" });
});
// GET /projects?name=...
app.get("/projects", async (req, res) => {
    const { name, status } = req.query;
    const rows = await (0, projects_repository_1.listProjects)({ name, status });
    res.status(HTTP.OK).json(rows);
});
// GET /projects/:id
app.get("/projects/:id", async (req, res) => {
    const idNum = Number(req.params.id);
    if (isNaN(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }
    const row = await (0, projects_repository_1.getProjectById)(idNum);
    if (!row) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.status(HTTP.OK).json(row);
});
// POST /projects   { name, description?, status? }
app.post("/projects", async (req, res) => {
    const { name, description, status } = req.body;
    if (!name) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Name is required" });
        return;
    }
    const created = await (0, projects_repository_1.createProject)({
        name,
        description,
        status,
    });
    res.status(HTTP.CREATED).json(created);
});
// PUT /projects/:id   { name, description?, status? }
app.put("/projects/:id", async (req, res) => {
    const idNum = Number(req.params.id);
    if (isNaN(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }
    const { name, description, status } = req.body;
    if (!name || !description || !status) {
        res.status(HTTP.BAD_REQUEST).json({ error: "name, description, status are required" });
        return;
    }
    const updated = await (0, projects_repository_1.updateProject)(idNum, {
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
app.delete("/projects/:id", async (req, res) => {
    const idNum = Number(req.params.id);
    if (isNaN(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }
    const ok = await (0, projects_repository_1.deleteProject)(idNum);
    if (!ok) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.sendStatus(HTTP.NO_CONTENT);
});
//POST /projects/:projectId/tasks — создать задачу. Body: { "title": ... }
app.post("/projects/:projectId/tasks", async (req, res) => {
    const projectIdNum = Number(req.params.projectId);
    if (isNaN(projectIdNum) || projectIdNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }
    const { title } = req.body;
    // if (!title) {
    //     res.status(HTTP.BAD_REQUEST).json({ error: "title is required" });
    //     return;
    // }
    const task = await (0, tasks_repository_1.createTask)({ project_id: projectIdNum, title });
    res.status(HTTP.CREATED).json(task);
});
// GET /projects/:projectId/tasks — получить список задач проекта
app.get("/projects/:projectId/tasks", async (req, res) => {
    const projectIdNum = Number(req.params.projectId);
    if (isNaN(projectIdNum) || projectIdNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }
    const tasks = await (0, tasks_repository_1.listTasks)(projectIdNum);
    res.status(HTTP.OK).json(tasks);
});
// PUT /tasks/:id — полная замена задачи. Body: { "title": ..., "is_done": ... }
app.put("/tasks/:id", async (req, res) => {
    const idNum = Number(req.params.id);
    if (isNaN(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid task ID" });
        return;
    }
    const { title, is_done } = req.body;
    if (!title || is_done === undefined) {
        res.status(HTTP.BAD_REQUEST).json({ error: "title and is_done are required" });
        return;
    }
    const task = await (0, tasks_repository_1.updateTask)({ id: idNum, title, is_done });
    if (!task) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.status(HTTP.OK).json(task);
});
// DELETE /tasks/:id
app.delete("/tasks/:id", async (req, res) => {
    const idNum = Number(req.params.id);
    if (isNaN(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid task ID" });
        return;
    }
    const task = await (0, tasks_repository_1.deleteTask)(idNum);
    if (!task) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.status(HTTP.NO_CONTENT).json(task);
});
// GET /projects/:id/with-tasks — получить проект с задачами
app.get("/projects/:id/with-tasks", async (req, res) => {
    const idNum = Number(req.params.id);
    if (isNaN(idNum) || idNum <= 0) {
        res.status(HTTP.BAD_REQUEST).json({ error: "Invalid project ID" });
        return;
    }
    const project = await (0, project_with_tasks_repository_1.getProjectWithTasksJoin)(idNum);
    if (!project) {
        res.sendStatus(HTTP.NOT_FOUND);
        return;
    }
    res.status(HTTP.OK).json(project);
});
app.listen(port, () => console.log(`✅ http://localhost:${port}`));
//# sourceMappingURL=index.js.map