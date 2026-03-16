import { CreateCategoryDto } from "../../dto/create-category-dto.ts";
import { CategoryDto } from "../../dto/category-dto.ts";
import { validateDto } from "../../dto/_shared.ts";
import { Category } from "../../impure/category/category.ts";

/** Pure core: validates input and returns the already-inserted CategoryDto */
export function createCategoryCore(
  _input: CreateCategoryDto,
  categoryDto: CategoryDto
): CategoryDto {
  return categoryDto;
}

/** createCategory - orchestrates boundary calls and core logic */
export async function createCategory(input: CreateCategoryDto): Promise<CategoryDto> {
  await validateDto(input);
  await Category.checkUnique(input.name);
  const category = new Category();
  const inserted = await category.insert(input);
  const result = createCategoryCore(input, inserted);
  await validateDto(result);
  return result;
}
