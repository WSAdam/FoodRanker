import { createCategoryCore, createCategory } from "./category-create.ts";
import { CreateCategoryDto } from "../../dto/create-category-dto.ts";
import { CategoryDto } from "../../dto/category-dto.ts";
import { setKv } from "../../db.ts";
import { assertEquals, assertRejects } from "@std/assert";

async function freshKv(): Promise<Deno.Kv> {
  const kv = await Deno.openKv(":memory:");
  setKv(kv);
  return kv;
}

// Unit: pure core function
Deno.test("category create core happy path", () => {
  const input = new CreateCategoryDto({ name: "Wings" });
  const dto = new CategoryDto({ categoryId: "cat-1", name: "Wings" });
  const result = createCategoryCore(input, dto);
  assertEquals(result.categoryId, "cat-1");
  assertEquals(result.name, "Wings");
});

// E2E: full orchestration
Deno.test("category create happy path", async () => {
  const kv = await freshKv();
  try {
    const result = await createCategory(new CreateCategoryDto({ name: "Wings" }));
    assertEquals(result.name, "Wings");
    assertEquals(typeof result.categoryId, "string");
  } finally {
    kv.close();
  }
});

Deno.test("category create handles duplicate-name", async () => {
  const kv = await freshKv();
  try {
    await createCategory(new CreateCategoryDto({ name: "Wings" }));
    await assertRejects(
      () => createCategory(new CreateCategoryDto({ name: "Wings" })),
      Error,
      "duplicate-name"
    );
  } finally {
    kv.close();
  }
});
