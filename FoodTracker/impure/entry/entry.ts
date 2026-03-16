// database boundary

import { validateDto } from "../../dto/_shared.ts";
import { CreateEntryDto } from "../../dto/create-entry-dto.ts";
import { EntryDto } from "../../dto/entry-dto.ts";
import { EntryListDto } from "../../dto/entry-list-dto.ts";
import { ScorerDto } from "../../dto/scorer-dto.ts";
import { getKv } from "../../db.ts";

interface EntryRow {
  entryId: string;
  categoryId: string;
  date: string;
  restaurant: string;
  ordered: string;
  impressions: string;
  price: string;
  notes: string;
}

interface ScorerRow {
  person: string;
  rating: number;
}

export class Entry {
  // Value object fields — populated by Entry.build()
  categoryId?: string;
  date?: string;
  restaurant?: string;
  ordered?: string;
  impressions?: string;
  price?: string;
  notes?: string;
  scorers?: ScorerDto[];

  private async kv(): Promise<Deno.Kv> {
    return await getKv();
  }

  static build(input: CreateEntryDto): Entry {
    const e = new Entry();
    e.categoryId = input.categoryId;
    e.date = input.date;
    e.restaurant = input.restaurant;
    e.ordered = input.ordered;
    e.impressions = input.impressions;
    e.price = input.price;
    e.notes = input.notes;
    e.scorers = input.scorers ?? [];
    return e;
  }

  async insert(entry: Entry): Promise<EntryDto> {
    const kv = await this.kv();
    const entryId = crypto.randomUUID();
    const row: EntryRow = {
      entryId,
      categoryId: entry.categoryId!,
      date: entry.date!,
      restaurant: entry.restaurant!,
      ordered: entry.ordered!,
      impressions: entry.impressions!,
      price: entry.price!,
      notes: entry.notes!,
    };
    const scorerRows: ScorerRow[] = (entry.scorers ?? []).map((s) => ({
      person: s.person,
      rating: s.rating,
    }));

    // Use composite date+entryId key so list returns oldest-first
    const sortKey = `${entry.date!}_${entryId}`;

    await kv.atomic()
      .set(["entries", entryId], row)
      .set(["entry_scorers", entryId], scorerRows)
      .set(["category_entries", entry.categoryId!, sortKey], entryId)
      .commit();

    const scorers = scorerRows.map((s) => new ScorerDto({ person: s.person, rating: s.rating }));
    const dto = new EntryDto({ ...row, scorers });
    await validateDto(dto);
    return dto;
  }

  async listByCategory(categoryId: string): Promise<EntryListDto> {
    const kv = await this.kv();
    const iter = kv.list<string>({ prefix: ["category_entries", categoryId] });
    const dtos: EntryDto[] = [];

    for await (const { value: entryId } of iter) {
      const [rowResult, scorersResult] = await Promise.all([
        kv.get<EntryRow>(["entries", entryId]),
        kv.get<ScorerRow[]>(["entry_scorers", entryId]),
      ]);
      if (rowResult.value === null) continue;
      const scorers = (scorersResult.value ?? []).map(
        (s) => new ScorerDto({ person: s.person, rating: s.rating })
      );
      dtos.push(new EntryDto({ ...rowResult.value, scorers }));
    }

    const dto = new EntryListDto({ entrys: dtos });
    await validateDto(dto);
    return dto;
  }

  async get(entryId: string): Promise<EntryDto> {
    const kv = await this.kv();
    const [rowResult, scorersResult] = await Promise.all([
      kv.get<EntryRow>(["entries", entryId]),
      kv.get<ScorerRow[]>(["entry_scorers", entryId]),
    ]);
    if (rowResult.value === null) throw new Error("not-found");
    const scorers = (scorersResult.value ?? []).map(
      (s) => new ScorerDto({ person: s.person, rating: s.rating })
    );
    const dto = new EntryDto({ ...rowResult.value, scorers });
    await validateDto(dto);
    return dto;
  }
}
