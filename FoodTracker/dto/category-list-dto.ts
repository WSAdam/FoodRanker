import { IsArray, ValidateNested } from "class-validator";
import { Type, plainToInstance } from "class-transformer";
import { CategoryDto } from "./category-dto.ts";

/** all food categories for rendering the tab bar */
export class CategoryListDto {
  constructor(input: Partial<CategoryListDto>) {
    Object.assign(this, plainToInstance(CategoryListDto, input));
  }

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CategoryDto)
  categorys!: CategoryDto[];
}
