import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class CreateUserDto {

    @ApiProperty({ example: 'John Doe', description: 'User name' })
    @IsString()
    name: string;

    @ApiProperty({ example: 'john@example.com', description: 'User email' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: '12345678', minLength: 8, description: 'User password' })
    @IsString()
    @MinLength(8)
    password: string;
}
