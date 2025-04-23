import { Expose } from "class-transformer";
import { IsNotEmpty, IsString, MinLength, IsOptional, IsDateString } from "class-validator";

export type Inmate = {
    id: number;
    name: string;
    crime: string;
    sentenceStart: string;
    sentenceEnd: string;
}

export class CreateInmateDTO {
    @MinLength(2)
    @IsString()
    @IsNotEmpty()
    @Expose()
    name!: string

    @MinLength(5)
    @IsString()
    @IsNotEmpty()
    @Expose()
    crime!: string;

    @IsDateString()
    @IsNotEmpty()
    @Expose()
    sentenceStart!: string;

    @IsDateString()
    @IsNotEmpty()
    @Expose()
    sentenceEnd!: string;
}

export class UpdateInmateDTO {
    @IsOptional()
    @MinLength(2)
    @IsString()
    @Expose()
    name?: string

    @IsOptional()
    @MinLength(5)
    @IsString()
    @Expose()
    crime?: string;

    @IsOptional()
    @IsDateString()
    @Expose()
    sentenceStart?: string;

    @IsOptional()
    @IsDateString()
    @Expose()
    sentenceEnd?: string;
}