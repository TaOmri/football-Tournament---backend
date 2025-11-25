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
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
app.get('/', (_req, res) => {
    res.json({ ok: true, message: 'Football backend TS running' });
});
app.use('/api/auth', auth_1.default);
app.use('/api/matches', matches_1.default);
app.use('/api/predictions', predictions_1.default);
app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}`);
});
