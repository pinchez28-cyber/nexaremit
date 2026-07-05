import { getRequestUser, readJson, requireMethod, sendJson } from "./_lib/http.js";
import { getTransferRecordById, listTransferRecords, saveTransferRecord } from "./_lib/transferRecords.js";

export default async function handler(request, response) {
  if (!requireMethod(request, response, ["GET", "POST"])) return;

  try {
    const user = getRequestUser(request);

    if (request.method === "GET") {
      const url = new URL(request.url, `https://${request.headers.host || "nexaremit.com"}`);
      const id = url.searchParams.get("id");
      const result = id
        ? await getTransferRecordById(user, id)
        : await listTransferRecords(user);

      sendJson(response, 200, result);
      return;
    }

    const body = await readJson(request);
    const result = await saveTransferRecord(user, body);
    sendJson(response, result.configured ? 201 : 202, result);
  } catch (error) {
    sendJson(response, error.code === "invalid_json" ? 400 : 500, {
      error: error.code || "transfer_records_failed",
      message: error.message
    });
  }
}
