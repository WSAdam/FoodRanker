import { IsString } from "class-validator";
import { plainToInstance } from "class-transformer";
import type { categoryId } from "./types.ts";

/** input for scoping a query to a specific food category */
export class CategoryIdDto {
  constructor(input: Partial<CategoryIdDto>) {
    Object.assign(this, plainToInstance(CategoryIdDto, input));
  }

  @IsString()
  categoryId!: categoryId;
}
