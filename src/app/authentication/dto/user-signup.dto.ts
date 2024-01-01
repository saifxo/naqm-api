import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsEmail, IsEnum, IsString } from "class-validator";
import { ROLE } from "src/shared/constants";

export class SignupDto {
    @ApiProperty()
    @IsString()
    name:string

    @ApiProperty()
    @IsEmail()
    @Transform(({ value }) => value.toLowerCase())
    email: string;

    @ApiProperty({ description: 'Required' })
    @IsString()
    password: string;

    @IsEnum(ROLE)
    @ApiProperty({
    description: 'Required',
    default: ROLE.USER,
    examples: [ROLE.ADMIN, ROLE.USER]})
    role: ROLE;

}