import { IsString } from "class-validator";
import { plainToInstance } from "class-transformer";
import type { entryId } from "./types.ts";

/** input for fetching a single food entry by ID */
export class EntryIdDto {
  constructor(input: Partial<EntryIdDto>) {
    Object.assign(this, plainToInstance(EntryIdDto, input));
  }

  @IsString()
  entryId!: entryId;
}
