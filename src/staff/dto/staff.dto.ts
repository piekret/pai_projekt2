import { Expose } from "class-transformer";
import { IsNotEmpty, IsString, IsEmail, MinLength, IsEnum, IsOptional } from "class-validator";

export type Staff = {
    id: number;
    name: string;
    email: string;
    password: string;
    role: "guard" | "admin" | "medic";
    joinDate: string;
}

export class CreateStaffDTO {
    @MinLength(2)
    @IsString()
    @IsNotEmpty()
    @Expose()
    name!: string

    @IsEmail()
    @IsNotEmpty()
    @Expose()
    email!: string

    @MinLength(8)
    @IsString()
    @IsNotEmpty()
    @Expose()
    password!: string

    @IsEnum(['guard', 'admin', 'medic'])
    @IsNotEmpty()
    @Expose()
    role!: 'guard' | 'admin' | 'medic';
}

export class UpdateStaffDTO {
    @IsOptional()
    @MinLength(2)
    @IsString()
    @Expose()
    name?: string

    @IsOptional()
    @IsEmail()
    @Expose()
    email?: string

    @IsOptional()
    @IsEnum(['guard', 'admin', 'medic'])
    @Expose()
    role?: 'guard' | 'admin' | 'medic';
}

export class LoginStaffDTO {
    @IsEmail()
    @IsNotEmpty()
    @Expose()
    email!: string;
  
    @IsString()
    @MinLength(8)
    @IsNotEmpty()
    @Expose()
    password!: string;
  }