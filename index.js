import express, { Route } from "express";
import client from "prom-client"; // Metrics Collection
import responseTime from "response-time";
import { createLogger, transports } from "winston";
import LokiTransport from "winston-loki";
import { doHeavyTask } from "./util.js";

const app = express();
const PORT = process.env.PORT || 8080;

const options = {
    transports: [
        new LokiTransport({
            labels: { appName: "http_express" },
            host: "http://127.0.0.1:3100",
        }),
    ],
};
const logger = createLogger(options);

const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ register: client.register });

//? Custom Metrics ======>

const reqResTotalTime = new client.Histogram({
    name: "http_express_req_res_time",
    help: "This tells how much time request and response has taken.",
    labelNames: ["method", "route", "status_code"],
    buckets: [1, 50, 100, 200, 400, 500, 800, 1000, 2000],
});

const totalRequestCounter = new client.Counter({
    name: "total_request_count",
    help: "Tells total requests",
});

app.use(
    responseTime((req, res, time) => {
        totalRequestCounter.inc();
        reqResTotalTime
            .labels({
                method: req.method,
                route: req.path,
                status_code: res.statusCode,
            })
            .observe(time);
    })
);

app.get("/", (req, res) => {
    logger.info("Request on /route");
    return res.status(200).json({ success: true, message: "Welcome Suman!" });
});

app.get("/api-slow", async (req, res) => {
    try {
        logger.info("Request on /route/slow");

        const timeTaken = await doHeavyTask();
        return res.status(200).json({
            success: true,
            message: "Fetch successfull!",
            data: { time: timeTaken },
        });
    } catch (error) {
        logger.error(`${error.message}`);
        return res.status(500).json({
            success: false,
            error: "Internal server ERROR!",
        });
    }
});

app.get("/metrics", async (req, res) => {
    res.setHeader("Content-Type", client.register.contentType);
    const metrics = await client.register.metrics();
    return res.send(metrics);
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}`);
});
