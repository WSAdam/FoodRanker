import { Entry } from "../../impure/entry/entry.ts";
import { EntryIdDto } from "../../dto/entry-id-dto.ts";

export async function deleteEntry(input: EntryIdDto): Promise<void> {
  const entry = new Entry();
  await entry.delete(input.entryId);
}
