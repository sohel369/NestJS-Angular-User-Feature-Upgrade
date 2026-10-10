import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, IsObject } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({ example: 'alex.morgan@company.io' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Alex Morgan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Lead Cloud Architect' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Passionate about distributed systems and cloud security.' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: '+1 (555) 234-5678' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Engineering' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ example: 'San Francisco, CA' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    example: {
      github: 'https://github.com/alexmorgan',
      linkedin: 'https://linkedin.com/in/alexmorgan',
    },
  })
  @IsObject()
  @IsOptional()
  socialLinks?: {
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };

  @ApiPropertyOptional({
    example: { theme: 'dark', emailNotifications: true, smsNotifications: false },
  })
  @IsObject()
  @IsOptional()
  preferences?: {
    theme?: string;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
  };
}
