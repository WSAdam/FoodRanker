import { createEntryCore, createEntry } from "./entry-create.ts";
import { CreateEntryDto } from "../../dto/create-entry-dto.ts";
import { CategoryDto } from "../../dto/category-dto.ts";
import { EntryDto } from "../../dto/entry-dto.ts";
import { ScorerDto } from "../../dto/scorer-dto.ts";
import { CreateCategoryDto } from "../../dto/create-category-dto.ts";
import { Category } from "../../impure/category/category.ts";
import { setKv } from "../../db.ts";
import { assertEquals, assertRejects } from "@std/assert";

async function freshKv(): Promise<Deno.Kv> {
  const kv = await Deno.openKv(":memory:");
  setKv(kv);
  return kv;
}

const sampleEntry = (categoryId: string) =>
  new CreateEntryDto({
    categoryId,
    date: "2024-01-15",
    restaurant: "Wing Stop",
    ordered: "Lemon Pepper 10pc",
    impressions: "Crispy",
    price: "$14",
    notes: "Great spot",
    scorers: [new ScorerDto({ person: "Adam", rating: 88 })],
  });

// Unit: pure core function
Deno.test("entry create core happy path", () => {
  const input = sampleEntry("cat-1");
  const catDto = new CategoryDto({ categoryId: "cat-1", name: "Wings" });
  const entryDto = new EntryDto({
    entryId: "e-1",
    categoryId: "cat-1",
    date: "2024-01-15",
    restaurant: "Wing Stop",
    ordered: "Lemon Pepper 10pc",
    impressions: "Crispy",
    price: "$14",
    notes: "Great spot",
    scorers: [new ScorerDto({ person: "Adam", rating: 88 })],
  });
  const result = createEntryCore(input, catDto, entryDto);
  assertEquals(result.entryId, "e-1");
  assertEquals(result.restaurant, "Wing Stop");
});

// E2E: full orchestration
Deno.test("entry create happy path", async () => {
  const kv = await freshKv();
  try {
    const category = new Category();
    const cat = await category.insert(new CreateCategoryDto({ name: "Wings" }));
    const result = await createEntry(sampleEntry(cat.categoryId));
    assertEquals(result.categoryId, cat.categoryId);
    assertEquals(result.restaurant, "Wing Stop");
    assertEquals(result.scorers[0].person, "Adam");
  } finally {
    kv.close();
  }
});

Deno.test("entry create handles not-found category", async () => {
  const kv = await freshKv();
  try {
    await assertRejects(
      () => createEntry(sampleEntry("nonexistent-category-id")),
      Error,
      "not-found"
    );
  } finally {
    kv.close();
  }
});
