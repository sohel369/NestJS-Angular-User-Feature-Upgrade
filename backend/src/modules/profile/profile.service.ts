import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole, UserStatus } from '../../database/entities/user.entity';
import { Profile } from '../../database/entities/profile.entity';
import { ActivityLog, ActivityType } from '../../database/entities/activity-log.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { StorageService } from '../../common/storage/storage.service';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(ActivityLog)
    private readonly activityRepository: Repository<ActivityLog>,
    private readonly storageService: StorageService,
  ) {}

  async createProfile(dto: CreateProfileDto): Promise<User> {
    const existing = await this.userRepository.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException(`User with email '${dto.email}' already exists.`);
    }

    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
    });
    const savedUser = await this.userRepository.save(user);

    const profile = this.profileRepository.create({
      userId: savedUser.id,
      title: dto.title,
      bio: dto.bio,
      phoneNumber: dto.phoneNumber,
      department: dto.department,
      location: dto.location,
      socialLinks: dto.socialLinks || {},
      preferences: dto.preferences || { theme: 'light', emailNotifications: true },
    });
    await this.profileRepository.save(profile);

    // Log activity
    await this.activityRepository.save(
      this.activityRepository.create({
        userId: savedUser.id,
        activityType: ActivityType.PROFILE_UPDATE,
        description: `Profile initialized for ${savedUser.name}`,
      }),
    );

    return this.getProfileByUserId(savedUser.id);
  }

  async getProfileByUserId(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });
    if (!user) {
      throw new NotFoundException(`User with ID '${userId}' was not found.`);
    }
    return user;
  }

  async getProfileByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['profile'],
    });
    if (!user) {
      throw new NotFoundException(`User with email '${email}' was not found.`);
    }
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.getProfileByUserId(userId);

    if (dto.name) {
      user.name = dto.name;
      await this.userRepository.save(user);
    }

    let profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepository.create({ userId });
    }

    if (dto.title !== undefined) profile.title = dto.title;
    if (dto.bio !== undefined) profile.bio = dto.bio;
    if (dto.phoneNumber !== undefined) profile.phoneNumber = dto.phoneNumber;
    if (dto.department !== undefined) profile.department = dto.department;
    if (dto.location !== undefined) profile.location = dto.location;
    if (dto.socialLinks) profile.socialLinks = { ...profile.socialLinks, ...dto.socialLinks };
    if (dto.preferences) profile.preferences = { ...profile.preferences, ...dto.preferences };

    await this.profileRepository.save(profile);

    // Record activity log for dashboard PostgreSQL aggregate
    await this.activityRepository.save(
      this.activityRepository.create({
        userId,
        activityType: ActivityType.PROFILE_UPDATE,
        description: `Profile information updated by ${user.name}`,
      }),
    );

    return this.getProfileByUserId(userId);
  }

  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.');
    }

    const user = await this.getProfileByUserId(userId);
    const avatarUrl = await this.storageService.saveFile(file);

    let profile = await this.profileRepository.findOne({ where: { userId } });
    if (!profile) {
      profile = this.profileRepository.create({ userId });
    }

    profile.avatarUrl = avatarUrl;
    await this.profileRepository.save(profile);

    // Record activity log
    await this.activityRepository.save(
      this.activityRepository.create({
        userId,
        activityType: ActivityType.AVATAR_UPLOAD,
        description: `Avatar picture uploaded by ${user.name}`,
      }),
    );

    return { avatarUrl };
  }

  async getAllProfiles(): Promise<User[]> {
    return this.userRepository.find({
      relations: ['profile'],
      order: { createdAt: 'DESC' },
    });
  }
}
