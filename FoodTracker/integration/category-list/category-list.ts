import { CategoryListDto } from "../../dto/category-list-dto.ts";
import { validateDto } from "../../dto/_shared.ts";
import { Category } from "../../impure/category/category.ts";

/** Pure core: returns the already-fetched CategoryListDto */
export function listCategoryCore(
  _input: Record<string, never>,
  categoryListDto: CategoryListDto
): CategoryListDto {
  return categoryListDto;
}

/** listCategory - orchestrates boundary calls and core logic */
export async function listCategory(_input: Record<string, never>): Promise<CategoryListDto> {
  const category = new Category();
  const fetched = await category.list();
  const result = listCategoryCore({}, fetched);
  await validateDto(result);
  return result;
}
