import { IsString } from "class-validator";
import { plainToInstance } from "class-transformer";
import type { name } from "./types.ts";

/** input for creating a new food category tab */
export class CreateCategoryDto {
  constructor(input: Partial<CreateCategoryDto>) {
    Object.assign(this, plainToInstance(CreateCategoryDto, input));
  }

  @IsString()
  name!: name;
}
