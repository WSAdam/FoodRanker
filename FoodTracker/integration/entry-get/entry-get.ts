import { EntryIdDto } from "../../dto/entry-id-dto.ts";
import { EntryDto } from "../../dto/entry-dto.ts";
import { validateDto } from "../../dto/_shared.ts";
import { Entry } from "../../impure/entry/entry.ts";

/** Pure core: returns the fetched EntryDto */
export function getEntryCore(
  _input: EntryIdDto,
  entryDto: EntryDto
): EntryDto {
  return entryDto;
}

/** getEntry - orchestrates boundary calls and core logic */
export async function getEntry(input: EntryIdDto): Promise<EntryDto> {
  await validateDto(input);
  const entryRepo = new Entry();
  const fetched = await entryRepo.get(input.entryId);
  const result = getEntryCore(input, fetched);
  await validateDto(result);
  return result;
}
