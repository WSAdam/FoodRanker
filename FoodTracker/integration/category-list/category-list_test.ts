import { listCategoryCore, listCategory } from "./category-list.ts";
import { CategoryDto } from "../../dto/category-dto.ts";
import { CategoryListDto } from "../../dto/category-list-dto.ts";
import { CreateCategoryDto } from "../../dto/create-category-dto.ts";
import { Category } from "../../impure/category/category.ts";
import { setKv } from "../../db.ts";
import { assertEquals } from "@std/assert";

async function freshKv(): Promise<Deno.Kv> {
  const kv = await Deno.openKv(":memory:");
  setKv(kv);
  return kv;
}

// Unit: pure core function
Deno.test("category list core happy path", () => {
  const dtos = [new CategoryDto({ categoryId: "c1", name: "Wings" })];
  const listDto = new CategoryListDto({ categorys: dtos });
  const result = listCategoryCore({}, listDto);
  assertEquals(result.categorys.length, 1);
  assertEquals(result.categorys[0].name, "Wings");
});

// E2E: full orchestration
Deno.test("category list happy path", async () => {
  const kv = await freshKv();
  try {
    const category = new Category();
    await category.insert(new CreateCategoryDto({ name: "Wings" }));
    await category.insert(new CreateCategoryDto({ name: "Pizza" }));
    const result = await listCategory({});
    assertEquals(result.categorys.length, 2);
  } finally {
    kv.close();
  }
});
