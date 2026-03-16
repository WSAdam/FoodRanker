import { Entry } from "../../impure/entry/entry.ts";
import { CreateEntryDto } from "../../dto/create-entry-dto.ts";
import { EntryDto } from "../../dto/entry-dto.ts";
import { EntryIdDto } from "../../dto/entry-id-dto.ts";

export async function updateEntry(
  id: EntryIdDto,
  input: CreateEntryDto,
): Promise<EntryDto> {
  const entry = new Entry();
  return await entry.update(id.entryId, input);
}
