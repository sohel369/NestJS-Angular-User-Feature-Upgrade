import AppDataSource from '../../config/typeorm.config';
import { User, UserRole, UserStatus } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';
import { ActivityLog, ActivityType } from '../entities/activity-log.entity';

async function runSeed() {
  console.log('🌱 Starting Database Seeding...');
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const profileRepo = AppDataSource.getRepository(Profile);
  const activityRepo = AppDataSource.getRepository(ActivityLog);

  // Check if seed already exists
  const existingUser = await userRepo.findOne({ where: { email: 'alex.morgan@company.io' } });
  if (existingUser) {
    console.log('✅ Seed data already present. Skipping...');
    await AppDataSource.destroy();
    return;
  }

  // Create Primary Test User & Profile
  const user = userRepo.create({
    name: 'Alex Morgan',
    email: 'alex.morgan@company.io',
    role: UserRole.ADMIN,
    status: UserStatus.ACTIVE,
  });
  const savedUser = await userRepo.save(user);

  const profile = profileRepo.create({
    userId: savedUser.id,
    title: 'Lead Cloud Architect & Tech Lead',
    bio: 'Passionate full-stack cloud architect specializing in NestJS, Angular, and AWS scalable infrastructure.',
    phoneNumber: '+1 (555) 234-5678',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    department: 'Engineering & DevOps',
    location: 'San Francisco, CA (Remote)',
    socialLinks: {
      github: 'https://github.com/alexmorgan-dev',
      linkedin: 'https://linkedin.com/in/alexmorgantech',
      twitter: 'https://twitter.com/alexmorgantech',
      website: 'https://alexmorgan.io',
    },
    preferences: {
      theme: 'dark',
      emailNotifications: true,
      smsNotifications: false,
    },
  });
  await profileRepo.save(profile);

  // Additional team members for dashboard analytics
  const team = [
    { name: 'Sarah Chen', email: 'sarah.c@company.io', role: UserRole.MANAGER, status: UserStatus.ACTIVE },
    { name: 'David Kumar', email: 'david.k@company.io', role: UserRole.USER, status: UserStatus.ACTIVE },
    { name: 'Elena Rostova', email: 'elena.r@company.io', role: UserRole.USER, status: UserStatus.ACTIVE },
    { name: 'Marcus Brody', email: 'marcus.b@company.io', role: UserRole.USER, status: UserStatus.PENDING },
  ];

  const savedTeamUsers: User[] = [];
  for (const member of team) {
    const u = await userRepo.save(userRepo.create(member));
    await profileRepo.save(
      profileRepo.create({
        userId: u.id,
        title: 'Full Stack Engineer',
        department: 'Product Development',
        location: 'New York, NY',
        avatarUrl: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80`,
      }),
    );
    savedTeamUsers.push(u);
  }

  // Seed Activity logs for Dashboard metrics
  const activities: Partial<ActivityLog>[] = [
    { userId: savedUser.id, activityType: ActivityType.LOGIN, description: 'Signed in via SSO from Chrome on MacOS', value: 0 },
    { userId: savedUser.id, activityType: ActivityType.PROFILE_UPDATE, description: 'Updated technical biography and phone number', value: 0 },
    { userId: savedUser.id, activityType: ActivityType.AVATAR_UPLOAD, description: 'Uploaded new high-res avatar', value: 0 },
    { userId: savedUser.id, activityType: ActivityType.TRANSACTION, description: 'Upgraded AWS ECS cluster instances', value: 249.50 },
    { userId: savedTeamUsers[0].id, activityType: ActivityType.LOGIN, description: 'Manager portal login', value: 0 },
    { userId: savedTeamUsers[0].id, activityType: ActivityType.TRANSACTION, description: 'License renewal for team tier', value: 1200.00 },
    { userId: savedTeamUsers[1].id, activityType: ActivityType.PROFILE_UPDATE, description: 'Updated department information', value: 0 },
    { userId: savedTeamUsers[2].id, activityType: ActivityType.TRANSACTION, description: 'API usage tier overage payment', value: 85.20 },
  ];

  for (const act of activities) {
    await activityRepo.save(activityRepo.create(act));
  }

  console.log('✅ Seeding completed successfully!');
  await AppDataSource.destroy();
}

runSeed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
