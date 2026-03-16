import { Category } from "./category.ts";
import { CreateCategoryDto } from "../../dto/create-category-dto.ts";
import { setKv } from "../../db.ts";
import { assertEquals, assertRejects } from "@std/assert";

async function freshKv(): Promise<Deno.Kv> {
  const kv = await Deno.openKv(":memory:");
  setKv(kv);
  return kv;
}

Deno.test("Category checkUnique happy path", async () => {
  const kv = await freshKv();
  try {
    await Category.checkUnique("Wings");
    // no error = unique
  } finally {
    kv.close();
  }
});

Deno.test("Category checkUnique throws on duplicate-name", async () => {
  const kv = await freshKv();
  try {
    const category = new Category();
    await category.insert(new CreateCategoryDto({ name: "Wings" }));
    await assertRejects(
      () => Category.checkUnique("Wings"),
      Error,
      "duplicate-name"
    );
  } finally {
    kv.close();
  }
});

Deno.test("Category insert happy path", async () => {
  const kv = await freshKv();
  try {
    const category = new Category();
    const result = await category.insert(new CreateCategoryDto({ name: "Wings" }));
    assertEquals(result.name, "Wings");
    assertEquals(typeof result.categoryId, "string");
  } finally {
    kv.close();
  }
});

Deno.test("Category insert throws on duplicate-name", async () => {
  const kv = await freshKv();
  try {
    const category = new Category();
    await category.insert(new CreateCategoryDto({ name: "Wings" }));
    await assertRejects(
      () => category.insert(new CreateCategoryDto({ name: "Wings" })),
      Error,
      "duplicate-name"
    );
  } finally {
    kv.close();
  }
});

Deno.test("Category list happy path", async () => {
  const kv = await freshKv();
  try {
    const category = new Category();
    await category.insert(new CreateCategoryDto({ name: "Wings" }));
    await category.insert(new CreateCategoryDto({ name: "Pizza" }));
    const result = await category.list();
    assertEquals(result.categorys.length, 2);
    // sorted alphabetically
    assertEquals(result.categorys[0].name, "Pizza");
    assertEquals(result.categorys[1].name, "Wings");
  } finally {
    kv.close();
  }
});

Deno.test("Category get happy path", async () => {
  const kv = await freshKv();
  try {
    const category = new Category();
    const inserted = await category.insert(new CreateCategoryDto({ name: "Wings" }));
    const result = await category.get(inserted.categoryId);
    assertEquals(result.categoryId, inserted.categoryId);
    assertEquals(result.name, "Wings");
  } finally {
    kv.close();
  }
});

Deno.test("Category get throws on not-found", async () => {
  const kv = await freshKv();
  try {
    const category = new Category();
    await assertRejects(
      () => category.get("nonexistent-id"),
      Error,
      "not-found"
    );
  } finally {
    kv.close();
  }
});
