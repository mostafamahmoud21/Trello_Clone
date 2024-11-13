import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github';

@Injectable()
export class GithubAuthentication extends PassportStrategy(Strategy, 'github') {
  constructor() {
    super({
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any) {
    const { username, emails } = profile;

        const user = {
            email: emails[0].value,
            firstName: username.givenName,
            lastName: username.familyName,
            //picture: photos[0].value,
            accessToken,
            refreshToken
    
        }
    return user; 
  }
}
