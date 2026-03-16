import { IsArray, ValidateNested } from "class-validator";
import { Type, plainToInstance } from "class-transformer";
import { EntryDto } from "./entry-dto.ts";

/** all entries for a category sorted oldest to newest */
export class EntryListDto {
  constructor(input: Partial<EntryListDto>) {
    Object.assign(this, plainToInstance(EntryListDto, input));
  }

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EntryDto)
  entrys!: EntryDto[];
}
