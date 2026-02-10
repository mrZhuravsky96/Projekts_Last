"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./db");
// Поле	Тип	Обязательность / Значение по умолчанию	Ограничения / Примечания
// id	SERIAL(INT)	NOT NULL, автоинкремент	PRIMARY KEY
// project_id	INTEGER	NOT NULL	FOREIGN KEY → projects(id), ON DELETE CASCADE
// title	TEXT	NOT NULL	Название задачи
// is_done	BOOLEAN	NOT NULL DEFAULT false	Статус выполнения (false/true)
// created_at	TIMESTAMPTZ	NOT NULL DEFAULT NOW()	Время создания в UTC (timestamp with time zone)
async function init() {
    await db_1.pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      is_done BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT tasks_status_check CHECK (is_done IN (true, false))
    );
  `);
    console.log("✅ Таблица tasks готова");
    await db_1.pool.end();
}
init();
//# sourceMappingURL=tasks-init-db.js.map