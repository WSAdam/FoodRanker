import { Entry } from "./entry.ts";
import { CreateEntryDto } from "../../dto/create-entry-dto.ts";
import { ScorerDto } from "../../dto/scorer-dto.ts";
import { setKv } from "../../db.ts";
import { assertEquals, assertRejects } from "@std/assert";

async function freshKv(): Promise<Deno.Kv> {
  const kv = await Deno.openKv(":memory:");
  setKv(kv);
  return kv;
}

const sampleInput = () =>
  new CreateEntryDto({
    categoryId: "cat-1",
    date: "2024-01-15",
    restaurant: "Wing Stop",
    ordered: "Lemon Pepper 10pc",
    impressions: "Crispy and saucy",
    price: "$14",
    notes: "Great game day spot",
    scorers: [new ScorerDto({ person: "Adam", rating: 88 })],
  });

Deno.test("Entry build happy path", async () => {
  const kv = await freshKv();
  try {
    const entry = Entry.build(sampleInput());
    assertEquals(entry.categoryId, "cat-1");
    assertEquals(entry.restaurant, "Wing Stop");
    assertEquals(entry.scorers?.length, 1);
    assertEquals(entry.scorers?.[0].rating, 88);
  } finally {
    kv.close();
  }
});

Deno.test("Entry insert happy path", async () => {
  const kv = await freshKv();
  try {
    const built = Entry.build(sampleInput());
    const entryRepo = new Entry();
    const result = await entryRepo.insert(built);
    assertEquals(result.categoryId, "cat-1");
    assertEquals(result.restaurant, "Wing Stop");
    assertEquals(result.scorers.length, 1);
    assertEquals(typeof result.entryId, "string");
  } finally {
    kv.close();
  }
});

Deno.test("Entry listByCategory happy path", async () => {
  const kv = await freshKv();
  try {
    const entryRepo = new Entry();
    const built1 = Entry.build(
      new CreateEntryDto({ ...sampleInput(), date: "2024-01-10" })
    );
    const built2 = Entry.build(
      new CreateEntryDto({ ...sampleInput(), date: "2024-01-20" })
    );
    await entryRepo.insert(built1);
    await entryRepo.insert(built2);
    const result = await entryRepo.listByCategory("cat-1");
    assertEquals(result.entrys.length, 2);
    // oldest first
    assertEquals(result.entrys[0].date, "2024-01-10");
    assertEquals(result.entrys[1].date, "2024-01-20");
  } finally {
    kv.close();
  }
});

Deno.test("Entry get happy path", async () => {
  const kv = await freshKv();
  try {
    const entryRepo = new Entry();
    const built = Entry.build(sampleInput());
    const inserted = await entryRepo.insert(built);
    const result = await entryRepo.get(inserted.entryId);
    assertEquals(result.entryId, inserted.entryId);
    assertEquals(result.restaurant, "Wing Stop");
    assertEquals(result.scorers[0].person, "Adam");
  } finally {
    kv.close();
  }
});

Deno.test("Entry get throws on not-found", async () => {
  const kv = await freshKv();
  try {
    const entryRepo = new Entry();
    await assertRejects(
      () => entryRepo.get("nonexistent-id"),
      Error,
      "not-found"
    );
  } finally {
    kv.close();
  }
});
