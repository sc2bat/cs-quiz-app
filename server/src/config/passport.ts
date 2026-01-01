import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { db } from "./db";
import logger from "../utils/logger";
import { authService } from "../services/authService";
import dotenv from 'dotenv';

dotenv.config();

async function socialCallback (
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
) {
    try {
        const user = await authService.handleSocialLogin(profile.provider, profile);
        return done(null, user);
    } catch (error) {
        return done(error, undefined);
    }
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: process.env.GOOGLE_CALLBACK_URL!,
}, socialCallback));

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID!,
    clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    callbackURL: process.env.GITHUB_CALLBACK_URL!,
}, socialCallback));

export default passport;