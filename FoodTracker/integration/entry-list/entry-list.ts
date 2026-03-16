import { CategoryIdDto } from "../../dto/category-id-dto.ts";
import { CategoryDto } from "../../dto/category-dto.ts";
import { EntryListDto } from "../../dto/entry-list-dto.ts";
import { validateDto } from "../../dto/_shared.ts";
import { Category } from "../../impure/category/category.ts";
import { Entry } from "../../impure/entry/entry.ts";

/** Pure core: validates category exists and returns the fetched EntryListDto */
export function listEntryCore(
  _input: CategoryIdDto,
  _categoryDto: CategoryDto,
  entryListDto: EntryListDto
): EntryListDto {
  return entryListDto;
}

/** listEntry - orchestrates boundary calls and core logic */
export async function listEntry(input: CategoryIdDto): Promise<EntryListDto> {
  await validateDto(input);
  const category = new Category();
  const categoryDto = await category.get(input.categoryId);
  const entryRepo = new Entry();
  const fetched = await entryRepo.listByCategory(input.categoryId);
  const result = listEntryCore(input, categoryDto, fetched);
  await validateDto(result);
  return result;
}
