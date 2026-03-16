import { getEntryCore, getEntry } from "./entry-get.ts";
import { EntryIdDto } from "../../dto/entry-id-dto.ts";
import { EntryDto } from "../../dto/entry-dto.ts";
import { ScorerDto } from "../../dto/scorer-dto.ts";
import { CreateEntryDto } from "../../dto/create-entry-dto.ts";
import { CreateCategoryDto } from "../../dto/create-category-dto.ts";
import { Category } from "../../impure/category/category.ts";
import { Entry } from "../../impure/entry/entry.ts";
import { setKv } from "../../db.ts";
import { assertEquals, assertRejects } from "@std/assert";

async function freshKv(): Promise<Deno.Kv> {
  const kv = await Deno.openKv(":memory:");
  setKv(kv);
  return kv;
}

// Unit: pure core function
Deno.test("entry get core happy path", () => {
  const input = new EntryIdDto({ entryId: "e-1" });
  const entryDto = new EntryDto({
    entryId: "e-1",
    categoryId: "cat-1",
    date: "2024-01-15",
    restaurant: "Wing Stop",
    ordered: "Lemon Pepper",
    impressions: "Crispy",
    price: "$14",
    notes: "",
    scorers: [],
  });
  const result = getEntryCore(input, entryDto);
  assertEquals(result.entryId, "e-1");
  assertEquals(result.restaurant, "Wing Stop");
});

// E2E: full orchestration
Deno.test("entry get happy path", async () => {
  const kv = await freshKv();
  try {
    const category = new Category();
    const cat = await category.insert(new CreateCategoryDto({ name: "Wings" }));
    const entryRepo = new Entry();
    const inserted = await entryRepo.insert(
      Entry.build(
        new CreateEntryDto({
          categoryId: cat.categoryId,
          date: "2024-01-15",
          restaurant: "Wing Stop",
          ordered: "Lemon Pepper",
          impressions: "Crispy",
          price: "$14",
          notes: "",
          scorers: [new ScorerDto({ person: "Adam", rating: 88 })],
        })
      )
    );
    const result = await getEntry(new EntryIdDto({ entryId: inserted.entryId }));
    assertEquals(result.entryId, inserted.entryId);
    assertEquals(result.restaurant, "Wing Stop");
    assertEquals(result.scorers[0].rating, 88);
  } finally {
    kv.close();
  }
});

Deno.test("entry get handles not-found", async () => {
  const kv = await freshKv();
  try {
    await assertRejects(
      () => getEntry(new EntryIdDto({ entryId: "nonexistent" })),
      Error,
      "not-found"
    );
  } finally {
    kv.close();
  }
});
