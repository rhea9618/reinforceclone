import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MsalService} from '@azure/msal-angular';
import { Observable, from, of } from 'rxjs';
import { catchError, flatMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  readonly url = 'https://graph.microsoft.com/v1.0/me/sendMail';
  readonly scopes = ['user.read', 'mail.send'];

  constructor(
    private http: HttpClient,
    private msalService: MsalService
  ) {}

  private loginAndGetToken() {
    return from(this.msalService.loginPopup(this.scopes)).pipe(
      tap((result => console.log(result)))
    );
  }

  getToken(): Observable<string> {
    const cache = this.msalService.getCachedTokenInternal(this.scopes);
    if (cache && cache.token) {
      return of(cache.token);
    }

    return from(this.msalService.acquireTokenSilent(this.scopes)).pipe(
      catchError((error) => {
        console.log(error);
        // try to retrieve token thru popup
        return from(this.msalService.acquireTokenPopup(this.scopes));
      }),
      // User login must be required
      catchError((error) => {
        return from(this.loginAndGetToken());
      })
    );
  }

  sendEmail(
    emailAddress: string[],
    subject: string,
    content: string,
    contentType: 'Text' | 'HTML' = 'Text',
    ccEmailAddress: string[] = []
  ) {
    const toRecipients = emailAddress.map((address) => ({emailAddress: {address}}));
    const ccRecipients = ccEmailAddress.map((address) => ({emailAddress: {address}}));
    const body = {
      message: {
        subject,
        body: {
          contentType,
          content
        },
        toRecipients,
        ccRecipients
      },
      saveToSentItems: false
    };

    return this.getToken().pipe(
      flatMap((token: string) => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.post(this.url, body, { headers });
      })
    );
  }
}
