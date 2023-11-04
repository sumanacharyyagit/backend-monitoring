import express from "express";
import client from "prom-client"; // Metrics Collection
import { doHeavyTask } from "./util.js";

const app = express();
const PORT = process.env.PORT || 8080;

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ register: client.register });

app.get("/", (req, res) => {
    return res.status(200).json({ success: true, message: "Welcome Suman!" });
});

app.get("/api-slow", async (req, res) => {
    try {
        const timeTaken = await doHeavyTask();
        return res.status(200).json({
            success: true,
            message: "Fetch successfull!",
            data: { time: timeTaken },
        });
    } catch (error) {
        console.log();
        return res.status(500).json({
            success: false,
            error: "Internal server ERROR!",
        });
    }
});

app.get("/matrics", async (req, res) => {
    res.setHeader("Content-Type", client.register.contentType);
    const matrics = await client.register.metrics();
    return res.status(200).json({
        success: true,
        message: "Fetch successfull!",
        matrics,
    });
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});
