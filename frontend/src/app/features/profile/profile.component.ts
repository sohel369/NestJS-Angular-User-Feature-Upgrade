import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProfileService } from '../../core/services/profile.service';
import { UserProfile } from '../../core/models/user-profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup;
  currentUser: UserProfile | null = null;
  allUsers: UserProfile[] = [];
  isLoading = true;
  isSaving = false;
  isUploadingAvatar = false;
  successMessage: string | null = null;
  errorMessage: string | null = null;
  avatarPreview: string | null = null;
  activeTab: 'general' | 'social' | 'preferences' = 'general';

  // Preset Corporate & Vector Avatars Gallery
  presetAvatars: string[] = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly profileService: ProfileService,
    private readonly cdr: ChangeDetectorRef,
  ) {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: [{ value: '', disabled: true }],
      title: [''],
      department: [''],
      location: [''],
      phoneNumber: [''],
      bio: ['', [Validators.maxLength(500)]],
      github: [''],
      linkedin: [''],
      twitter: [''],
      website: [''],
      theme: ['dark'],
      emailNotifications: [true],
      smsNotifications: [false],
    });
  }

  ngOnInit(): void {
    this.loadProfiles();
  }

  loadProfiles(): void {
    this.isLoading = true;
    this.profileService.getAllProfiles().subscribe({
      next: (users) => {
        this.allUsers = users;
        if (users.length > 0) {
          this.selectUser(users[0]);
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to load profiles. Please verify backend connection.';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  selectUser(user: UserProfile): void {
    this.currentUser = user;
    this.avatarPreview = user.profile?.avatarUrl || this.presetAvatars[0];
    this.profileForm.patchValue({
      name: user.name,
      email: user.email,
      title: user.profile?.title || '',
      department: user.profile?.department || '',
      location: user.profile?.location || '',
      phoneNumber: user.profile?.phoneNumber || '',
      bio: user.profile?.bio || '',
      github: user.profile?.socialLinks?.github || '',
      linkedin: user.profile?.socialLinks?.linkedin || '',
      twitter: user.profile?.socialLinks?.twitter || '',
      website: user.profile?.socialLinks?.website || '',
      theme: user.profile?.preferences?.theme || 'dark',
      emailNotifications: user.profile?.preferences?.emailNotifications ?? true,
      smsNotifications: user.profile?.preferences?.smsNotifications ?? false,
    });
  }

  selectPresetAvatar(url: string): void {
    this.avatarPreview = url;
    if (this.currentUser?.profile) {
      this.currentUser.profile.avatarUrl = url;
    }
    // Update profile with selected avatar URL
    if (this.currentUser) {
      this.profileService.updateProfile(this.currentUser.id, {
        name: this.profileForm.get('name')?.value,
      }).subscribe();
    }
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      if (file.size > 5 * 1024 * 1024) {
        this.errorMessage = 'Image size must be less than 5MB';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        this.avatarPreview = reader.result as string;
      };
      reader.readAsDataURL(file);

      if (this.currentUser) {
        this.isUploadingAvatar = true;
        this.profileService.uploadAvatar(this.currentUser.id, file).subscribe({
          next: (res) => {
            this.avatarPreview = res.avatarUrl;
            if (this.currentUser?.profile) {
              this.currentUser.profile.avatarUrl = res.avatarUrl;
            }
            this.isUploadingAvatar = false;
            this.showSuccess('Avatar picture updated successfully!');
            this.cdr.markForCheck();
          },
          error: () => {
            this.errorMessage = 'Failed to upload avatar. Please try again.';
            this.isUploadingAvatar = false;
            this.cdr.markForCheck();
          },
        });
      }
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid || !this.currentUser) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;

    const val = this.profileForm.getRawValue();
    const updatePayload = {
      name: val.name,
      title: val.title,
      department: val.department,
      location: val.location,
      phoneNumber: val.phoneNumber,
      bio: val.bio,
      socialLinks: {
        github: val.github,
        linkedin: val.linkedin,
        twitter: val.twitter,
        website: val.website,
      },
      preferences: {
        theme: val.theme,
        emailNotifications: val.emailNotifications,
        smsNotifications: val.smsNotifications,
      },
    };

    this.profileService.updateProfile(this.currentUser.id, updatePayload).subscribe({
      next: (updatedUser) => {
        this.currentUser = updatedUser;
        this.isSaving = false;
        this.showSuccess('Profile changes saved successfully!');
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMessage = 'Failed to save changes. Please try again.';
        this.isSaving = false;
        this.cdr.markForCheck();
      },
    });
  }

  setTab(tab: 'general' | 'social' | 'preferences'): void {
    this.activeTab = tab;
  }

  get bioLength(): number {
    return this.profileForm.get('bio')?.value?.length || 0;
  }

  get profileStrength(): number {
    if (!this.currentUser) return 0;
    let score = 20;
    const v = this.profileForm.getRawValue();
    if (v.name) score += 15;
    if (v.title) score += 15;
    if (v.department) score += 10;
    if (v.location) score += 10;
    if (v.bio) score += 15;
    if (v.github || v.linkedin) score += 15;
    return Math.min(score, 100);
  }

  private showSuccess(msg: string): void {
    this.successMessage = msg;
    setTimeout(() => {
      this.successMessage = null;
      this.cdr.markForCheck();
    }, 4000);
  }
}
