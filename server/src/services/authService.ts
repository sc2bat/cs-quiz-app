import { userModel } from "../models/userModel";
import { CreateUserDto, UpdateUserDto, UpdateUserLoginInfoDto, UserRow } from '../types/user';
import logger from "../utils/logger";

export const authService = {
    async handleSocialLogin(provider: string, profile: any) {
        const snsId = profile.id;
        const email = profile.emails?.[0]?.value || null;
        const nickname = profile.displayName || profile.username || 'User';
        const photoUrl = profile.photos?.[0]?.value || null;

        logger.debug(`provider ${provider}`);
        logger.debug(`snsId ${snsId}`);
        logger.debug(`email ${email}`);
        logger.debug(`nickname ${nickname}`);
        logger.debug(`photoUrl ${photoUrl}`);

        let user = await userModel.getUserBySnsId(provider, snsId);

        if (user) {
            logger.debug(`가입된 유저`);
            const updateUserLoginInfoDto: UpdateUserLoginInfoDto = {
                profile_image_url: photoUrl,
                provider: provider,
                sns_id: snsId,
            };
            await userModel.updateUserLoginInfo(updateUserLoginInfoDto);
        } else {
            logger.debug(`신규 유저`);
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