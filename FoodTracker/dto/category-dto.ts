import { IsString } from "class-validator";
import { plainToInstance } from "class-transformer";
import type { categoryId, name } from "./types.ts";

/** a resolved food category with its ID and display name */
export class CategoryDto {
  constructor(input: Partial<CategoryDto>) {
    Object.assign(this, plainToInstance(CategoryDto, input));
  }

  @IsString()
  categoryId!: categoryId;

  @IsString()
  name!: name;
}
