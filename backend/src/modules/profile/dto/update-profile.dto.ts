import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Alex Morgan' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'Senior Staff Engineer & DevOps Specialist' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: 'Updated bio highlighting NestJS and Angular expertise.' })
  @IsString()
  @IsOptional()
  bio?: string;

  @ApiPropertyOptional({ example: '+1 (555) 987-6543' })
  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @ApiPropertyOptional({ example: 'Architecture & Infrastructure' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ example: 'Austin, TX (Remote)' })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiPropertyOptional({
    example: {
      github: 'https://github.com/alexmorgan',
      linkedin: 'https://linkedin.com/in/alexmorgan',
      twitter: 'https://twitter.com/alexmorgan',
      website: 'https://alexmorgan.dev',
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
    example: { theme: 'system', emailNotifications: true, smsNotifications: true },
  })
  @IsObject()
  @IsOptional()
  preferences?: {
    theme?: string;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
  };
}
