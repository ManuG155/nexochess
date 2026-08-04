import { waitUntil } from "cloudflare:workers";

import { sendAccountEmail } from "./email.mjs";

export function queueAccountEmail(options) {
    const task = sendAccountEmail(options).catch(error => {
        console.error("NexoChess account email delivery failed", error);
    });

    waitUntil(task);
}
