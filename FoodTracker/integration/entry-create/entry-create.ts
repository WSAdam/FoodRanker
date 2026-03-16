import { CreateEntryDto } from "../../dto/create-entry-dto.ts";
import { CategoryDto } from "../../dto/category-dto.ts";
import { EntryDto } from "../../dto/entry-dto.ts";
import { validateDto } from "../../dto/_shared.ts";
import { Category } from "../../impure/category/category.ts";
import { Entry } from "../../impure/entry/entry.ts";

/** Pure core: validates category exists and returns the inserted EntryDto */
export function createEntryCore(
  _input: CreateEntryDto,
  _categoryDto: CategoryDto,
  entryDto: EntryDto
): EntryDto {
  return entryDto;
}

/** createEntry - orchestrates boundary calls and core logic */
export async function createEntry(input: CreateEntryDto): Promise<EntryDto> {
  await validateDto(input);
  const category = new Category();
  const categoryDto = await category.get(input.categoryId);
  const builtEntry = Entry.build(input);
  const entryRepo = new Entry();
  const inserted = await entryRepo.insert(builtEntry);
  const result = createEntryCore(input, categoryDto, inserted);
  await validateDto(result);
  return result;
}
