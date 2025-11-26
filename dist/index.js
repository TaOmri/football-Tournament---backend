"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const matches_1 = __importDefault(require("./routes/matches"));
const predictions_1 = __importDefault(require("./routes/predictions"));
const users_1 = __importDefault(require("./routes/users"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// CORS – ל־localhost ול־Netlify
app.use((0, cors_1.default)({
    origin: [
        "https://iridescent-tulumba-1d1840.netlify.app",
        "http://localhost:5173"
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}));
app.options('*', (0, cors_1.default)());
app.use(express_1.default.json());
app.get('/', (_req, res) => {
    res.json({ ok: true, message: 'Football backend TS running' });
});
// ROUTES
app.use('/api/auth', auth_1.default);
app.use('/api/matches', matches_1.default);
app.use('/api/predictions', predictions_1.default);
app.use("/api/users", users_1.default); // ✔️ מתוקן ומונח במקום הנכון
// START SERVER
app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
});
