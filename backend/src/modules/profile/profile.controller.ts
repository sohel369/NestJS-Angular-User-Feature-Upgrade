import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { ProfileService } from './profile.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '../../database/entities/user.entity';

@ApiTags('Profiles')
@Controller('profiles')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user profile' })
  @ApiResponse({ status: 201, description: 'Profile created successfully.', type: User })
  @ApiResponse({ status: 400, description: 'Invalid input or user already exists.' })
  async createProfile(@Body() dto: CreateProfileDto): Promise<User> {
    return this.profileService.createProfile(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user profiles' })
  @ApiResponse({ status: 200, description: 'List of all profiles.' })
  async getAllProfiles(): Promise<User[]> {
    return this.profileService.getAllProfiles();
  }

  @Get(':userId')
  @ApiOperation({ summary: 'Get user profile by User UUID' })
  @ApiResponse({ status: 200, description: 'Profile details found.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async getProfile(@Param('userId', ParseUUIDPipe) userId: string): Promise<User> {
    return this.profileService.getProfileByUserId(userId);
  }

  @Patch(':userId')
  @ApiOperation({ summary: 'Update existing user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully.', type: User })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async updateProfile(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<User> {
    return this.profileService.updateProfile(userId, dto);
  }

  @Post(':userId/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload user profile avatar image' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid image format or file size exceeded.' })
  async uploadAvatar(
    @Param('userId', ParseUUIDPipe) userId: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ avatarUrl: string }> {
    return this.profileService.uploadAvatar(userId, file);
  }
}
