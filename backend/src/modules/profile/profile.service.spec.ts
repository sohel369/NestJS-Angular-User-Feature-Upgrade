import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProfileService } from './profile.service';
import { User, UserRole, UserStatus } from '../../database/entities/user.entity';
import { Profile } from '../../database/entities/profile.entity';
import { ActivityLog } from '../../database/entities/activity-log.entity';
import { StorageService } from '../../common/storage/storage.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProfileService', () => {
  let service: ProfileService;

  const mockUser: User = {
    id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    email: 'test@company.io',
    name: 'Test User',
    role: UserRole.USER,
    status: UserStatus.ACTIVE,
    profile: {
      id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      title: 'Software Engineer',
      bio: 'Test bio',
      phoneNumber: '+1234567890',
      avatarUrl: 'http://localhost:3000/uploads/avatars/avatar.png',
      department: 'Engineering',
      location: 'New York',
      socialLinks: {},
      preferences: { theme: 'light', emailNotifications: true },
      createdAt: new Date(),
      updatedAt: new Date(),
      user: null,
    },
    activities: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockProfileRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockActivityRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockStorageService = {
    saveFile: jest.fn().mockResolvedValue('http://localhost:3000/uploads/avatars/new-avatar.png'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileRepository,
        },
        {
          provide: getRepositoryToken(ActivityLog),
          useValue: mockActivityRepository,
        },
        {
          provide: StorageService,
          useValue: mockStorageService,
        },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getProfileByUserId', () => {
    it('should return user profile if found', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.getProfileByUserId(mockUser.id);
      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        relations: ['profile'],
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.getProfileByUserId('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createProfile', () => {
    it('should throw BadRequestException if user email exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      await expect(
        service.createProfile({ email: mockUser.email, name: mockUser.name }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully create a new user and profile', async () => {
      mockUserRepository.findOne
        .mockResolvedValueOnce(null) // first check
        .mockResolvedValueOnce(mockUser); // getProfileByUserId
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      mockProfileRepository.create.mockReturnValue(mockUser.profile);
      mockProfileRepository.save.mockResolvedValue(mockUser.profile);
      mockActivityRepository.create.mockReturnValue({});
      mockActivityRepository.save.mockResolvedValue({});

      const result = await service.createProfile({
        email: 'new@company.io',
        name: 'New User',
        title: 'Developer',
      });

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.save).toHaveBeenCalled();
      expect(mockProfileRepository.save).toHaveBeenCalled();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile details and log activity', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockProfileRepository.findOne.mockResolvedValue(mockUser.profile);
      mockProfileRepository.save.mockResolvedValue({
        ...mockUser.profile,
        title: 'Principal Architect',
      });
      mockActivityRepository.create.mockReturnValue({});
      mockActivityRepository.save.mockResolvedValue({});

      const result = await service.updateProfile(mockUser.id, {
        title: 'Principal Architect',
      });

      expect(result).toEqual(mockUser);
      expect(mockProfileRepository.save).toHaveBeenCalled();
      expect(mockActivityRepository.save).toHaveBeenCalled();
    });
  });
});
