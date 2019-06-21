import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, of } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { AuthService } from 'src/app/core/auth.service';

@Injectable({
  providedIn: 'root'
})
export class EmailService {

  readonly url = 'https://graph.microsoft.com/v1.0/me/sendMail';
  readonly scopes = ['mail.send'];

  constructor(
    private auth: AuthService,
    private http: HttpClient
  ) {}

  // TODO: Replaced with a mail sending service
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

    const credential = this.auth.credential;
    const token$ = credential ?
      of(credential.accessToken) :
      from(this.auth.microsoftLogin()).pipe(map(creds => creds.accessToken));

    return token$.pipe(
      flatMap((token: string) => {
        const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
        return this.http.post(this.url, body, { headers });
      })
    );
  }
}
