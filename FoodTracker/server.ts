import { createCategory } from "./integration/category-create/category-create.ts";
import { listCategory } from "./integration/category-list/category-list.ts";
import { createEntry } from "./integration/entry-create/entry-create.ts";
import { listEntry } from "./integration/entry-list/entry-list.ts";
import { getEntry } from "./integration/entry-get/entry-get.ts";
import { CreateCategoryDto } from "./dto/create-category-dto.ts";
import { CreateEntryDto } from "./dto/create-entry-dto.ts";
import { CategoryIdDto } from "./dto/category-id-dto.ts";
import { EntryIdDto } from "./dto/entry-id-dto.ts";

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function err(message: string, status = 400): Response {
  return json({ error: message }, status);
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const { pathname } = url;
  const method = req.method;

  try {
    // GET /
    if (method === "GET" && pathname === "/") {
      const html = await Deno.readTextFile(
        new URL("./public/index.html", import.meta.url),
      );
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // POST /categories
    if (method === "POST" && pathname === "/categories") {
      const body = await req.json();
      const result = await createCategory(new CreateCategoryDto(body));
      return json(result, 201);
    }

    // GET /categories
    if (method === "GET" && pathname === "/categories") {
      const result = await listCategory({});
      return json(result);
    }

    // POST /entries
    if (method === "POST" && pathname === "/entries") {
      const body = await req.json();
      const result = await createEntry(new CreateEntryDto(body));
      return json(result, 201);
    }

    // GET /entries?categoryId=...
    if (method === "GET" && pathname === "/entries") {
      const categoryId = url.searchParams.get("categoryId");
      if (!categoryId) return err("categoryId query param required");
      const result = await listEntry(new CategoryIdDto({ categoryId }));
      return json(result);
    }

    // GET /entries/:entryId
    const entryMatch = pathname.match(/^\/entries\/([^/]+)$/);
    if (method === "GET" && entryMatch) {
      const entryId = entryMatch[1];
      const result = await getEntry(new EntryIdDto({ entryId }));
      return json(result);
    }

    return err("Not found", 404);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (message === "not-found") return err("Not found", 404);
    if (message === "duplicate-name") return err("Name already exists", 409);
    console.error("❌ Unhandled error:", message);
    return err("Internal server error", 500);
  }
});
