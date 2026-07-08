import { User, IUserDocument } from '../models/User';
import { IUserProfile } from '@sk-careerhub/types';

export class UserRepository {
  async findById(id: string): Promise<IUserDocument | null> {
    return User.findById(id);
  }

  async findByEmail(email: string): Promise<IUserDocument | null> {
    return User.findOne({ email: email.toLowerCase() });
  }

  async create(userData: Partial<IUserDocument>): Promise<IUserDocument> {
    const user = new User(userData);
    return user.save();
  }

  async update(id: string, updateData: Partial<IUserDocument>): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  }

  async updateProfile(id: string, profileData: IUserProfile): Promise<IUserDocument | null> {
    return User.findByIdAndUpdate(
      id,
      { 
        $set: { 
          profile: profileData,
          profileCompleted: true
        } 
      },
      { new: true }
    );
  }
}
export const userRepository = new UserRepository();
