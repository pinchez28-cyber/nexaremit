import { requireMethod, sendJson } from "./_lib/http.js";
import { listReviewQueue } from "./_lib/reviewQueue.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["GET"])) return;

  try {
    const queue = await listReviewQueue();
    sendJson(response, 200, queue);
  } catch (error) {
    sendJson(response, 500, {
      error: "review_queue_failed",
      message: error.message
    });
  }
}
