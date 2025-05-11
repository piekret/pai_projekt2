import { Expose } from "class-transformer";
import { IsNotEmpty, IsString, MinLength, IsDateString, IsOptional } from "class-validator";

// tomasz zajac

export type Visit = {
    id: number;
    visitorName: string;
    visitDate: string;
}

export class CreateVisitDTO {
    @MinLength(2)
    @IsString()
    @IsNotEmpty()
    @Expose()
    visitorName!: string

    @IsDateString()
    @IsNotEmpty()
    @Expose()
    visitDate!: string
}

export class UpdateVisitDTO {
    @MinLength(2)
    @IsString()
    @IsOptional()
    @Expose()
    visitorName?: string

    @IsDateString()
    @IsOptional()
    @Expose()
    visitDate?: string
}