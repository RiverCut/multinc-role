import { Injectable } from '@angular/core';
import { default as Auth0Lock } from 'auth0-lock';
import { Events } from 'ionic-angular';

@Injectable()
export class AuthService {

  auth0 = new Auth0Lock(
    'E27Q5Hzsqzv0TkjlydTMgoVIUfQh_T-u',
    'multinc-role.auth0.com', {
      theme: {
        primaryColor: '#871f78'
      },
      auth: {
        redirect: false
      }
    });

  public get token(): string {
    return localStorage.getItem('id_token');
  }

  constructor(private events: Events) {
    this.auth0.on('authenticated', (result) => {
      this.setSession({
        accessToken: result.accessToken,
        idToken: result.idToken,
        expiresIn: result.expiresIn
      });
    });
  }

  public login(): void {
    this.auth0.show();
  }

  private setSession(authResult): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }

  public logout(): void {
    // Remove tokens and expiry time from localStorage
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('expires_at');
    // Go back to the home route
    // this.router.navigate(['/']);
    this.goHome();
  }

  public isAuthenticated(): boolean {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at'));
    return new Date().getTime() < expiresAt;
  }

  private goHome() {
    this.events.publish('multinc:unauthenticated');
  }

}
