import { userModel } from "../models/userModel";
import { CreateUserDto, UpdateUserDto, UserRow } from '../types/user';

export const authService = {
    async handleSocialLogin(provider: string, profile: any) {
        const snsId = profile.id;
        const email = profile.emails?.[0]?.value || null;
        const nickname = profile.displayName || profile.username || 'User';
        const photoUrl = profile.photos?.[0]?.value || null;

        let user = await userModel.getUserBySnsId(provider, snsId);

        if (user) {
            const updateUserDto: UpdateUserDto = {
                user_id: user.user_id,
                profile_image_url: photoUrl,
            };
            await userModel.updateUserProfile(updateUserDto);
        } else {
            const createUserDto: CreateUserDto = {
                email: email,
                nickname: nickname,
                provider: provider,
                sns_id: snsId,
                profile_image_url: photoUrl
            };

            const newUserId = await userModel.createUserProfile(createUserDto);
            const newUser = await userModel.getUserByUserId(newUserId);
            if(!newUser){
                throw new Error('User creation failed');
            }
            user = newUser;

        }
        return user;
    }
}