import { listEntryCore, listEntry } from "./entry-list.ts";
import { CategoryIdDto } from "../../dto/category-id-dto.ts";
import { CategoryDto } from "../../dto/category-dto.ts";
import { EntryListDto } from "../../dto/entry-list-dto.ts";
import { CreateEntryDto } from "../../dto/create-entry-dto.ts";
import { ScorerDto } from "../../dto/scorer-dto.ts";
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
Deno.test("entry list core happy path", () => {
  const input = new CategoryIdDto({ categoryId: "cat-1" });
  const catDto = new CategoryDto({ categoryId: "cat-1", name: "Wings" });
  const listDto = new EntryListDto({ entrys: [] });
  const result = listEntryCore(input, catDto, listDto);
  assertEquals(result.entrys.length, 0);
});

// E2E: full orchestration
Deno.test("entry list happy path", async () => {
  const kv = await freshKv();
  try {
    const category = new Category();
    const cat = await category.insert(new CreateCategoryDto({ name: "Wings" }));
    const entryRepo = new Entry();
    await entryRepo.insert(
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
    const result = await listEntry(new CategoryIdDto({ categoryId: cat.categoryId }));
    assertEquals(result.entrys.length, 1);
    assertEquals(result.entrys[0].restaurant, "Wing Stop");
  } finally {
    kv.close();
  }
});

Deno.test("entry list handles not-found category", async () => {
  const kv = await freshKv();
  try {
    await assertRejects(
      () => listEntry(new CategoryIdDto({ categoryId: "nonexistent" })),
      Error,
      "not-found"
    );
  } finally {
    kv.close();
  }
});
