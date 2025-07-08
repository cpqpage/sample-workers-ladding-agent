import {D1Database} from "@cloudflare/workers-types";
import type {UpgradeLog} from "./schema"

export interface Env {
    DB: D1Database;
}