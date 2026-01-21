import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import { exit } from 'process';
import errorHandler from './controllers/error.js';
import scheduleJobs from './tasks/ingestion.js';
import { getRouterPath } from './util/util-functions.js';


const PORT = +process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL;

const app = express();

app.use(express.json());
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(cookieParser());


async function setupRoutes() {
  const routesPath = path.join(import.meta.dirname, 'routes');

  try {
    const routeFiles = fs.readdirSync(routesPath).filter(file => file.endsWith('.js'));

    for (const file of routeFiles) {
      const module = await import(`./routes/${file}`);
      const fileRouter = module.default;

      if (typeof fileRouter !== 'function') {
        console.warn(`File ${file} does not provide valid router as export.`);
        continue;
      }

      const [filename] = file.split('.');
      const routerPath = getRouterPath(filename);      
      app.use(routerPath, fileRouter);
    }
  } catch (err) {
    console.log("Failed to load routes dinamically.");
    console.error(err);
    console.log("Exiting server...");
    exit(1);
  }
}

await setupRoutes();
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}...`);

  // schedule the jobs defined in the tasks folder
  scheduleJobs();
});
