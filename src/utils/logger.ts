// src/utils/logger.ts
import pino from "pino";

// Создаём логгер с настройками
const logger = pino({
    // Уровень логирования: 
    // 'info' - показывать info, warn, error (но не debug)
    // 'debug' - показывать всё включая debug
    level: process.env.LOG_LEVEL || "info",
    
    // Добавляем время к каждому логу
    timestamp: pino.stdTimeFunctions.isoTime,
    
    // В разработке делаем красивый вывод
    // В production - компактный JSON (удобно для анализа)
    transport: process.env.NODE_ENV !== "production" 
        ? {
            target: "pino-pretty",
            options: {
                colorize: true,           // Цветной вывод
                translateTime: "yyyy-mm-dd HH:MM:ss", // Читаемое время
                ignore: "pid,hostname",   // Не показывать pid и hostname
            },
        }
        : undefined, // В production - просто JSON
});

export default logger;
