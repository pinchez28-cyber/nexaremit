export function isMissingTableError(error) {
  return error?.code === "42P01" || String(error?.message || "").includes("schema cache");
}
