export function createPageUrl(pageName) {
  if (!pageName || pageName === "Dashboard") return "/Dashboard";
  return `/${pageName}`;
}
