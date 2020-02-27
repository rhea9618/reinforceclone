import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import {
  Observable,
  from,
  fromEvent
} from 'rxjs';
import {
  catchError,
  flatMap,
  map,
  tap
} from 'rxjs/operators';

import { NotifyService } from 'src/app/core/notify.service';

@Component({
  selector: 'badge-upload',
  templateUrl: './badge-upload.component.html',
  styleUrls: ['./badge-upload.component.scss']
})
export class BadgeUploadComponent implements OnInit {
  // user id to reference uploader
  @Input() uid: string;
  // storage directory where file will be uploaded
  @Input() directory: string;
  // emits the uploaded url
  @Output() uploaded = new EventEmitter<string>();

  uploadedURL: string;
  isHovering: boolean;
  percentage: Observable<number>;

  constructor(
    private fireStorage: AngularFireStorage,
    private notifyService: NotifyService
  ) { }

  private readFile(blob: Blob) {
    const reader = new FileReader();
    const result$ = fromEvent(reader, 'load').pipe(map(() => reader.result));
    reader.readAsDataURL(blob);
    return result$;
  }

  private uploadFile(path: string, file: File) {
    const customMetadata = { uid: this.uid };
    const task = this.fireStorage.upload(`${path}/${file.name}`, file, { customMetadata });
    this.percentage = task.percentageChanges();

    from(task).pipe(
      flatMap((snapshot: firebase.storage.UploadTaskSnapshot) => snapshot.ref.getDownloadURL()),
      map((url: string) => url.substring(0, url.indexOf('&token='))),
      catchError((error) => {
        this.notifyService.update('Image upload error.', 'error');
        throw error;
      })
    ).subscribe((uploadedURL: string) => {
      this.uploadedURL = uploadedURL;
      this.uploaded.emit(uploadedURL);
      this.notifyService.update('Image uploaded!', 'success');
    });
  }

  ngOnInit() {
    if (!this.uid) {
      throw new Error('uid is required!');
    }
  }

  toggleHover(event: boolean) {
    this.isHovering = event;
  }

  async startUpload(event: FileList) {
    // Delete existing image if it gets overwritten
    if (this.uploadedURL) {
      await this.deleteImage();
    }

    const file = event.item(0);
    // Allow image types only
    if (file.type.split('/')[0] !== 'image') {
      this.notifyService.update('Image files only', 'error');
      return;
    }
    // Convert file into an image
    const img = new Image();
    this.readFile(file).pipe(
      // load image
      tap((value: string) => { img.src = value; }),
      // wait for image to be loaded
      flatMap(() => fromEvent(img, 'load'))
    ).subscribe(() => {
      if (img.width > 150 || img.height > 150) {
        this.notifyService.update('Image dimensions must not exceed 150 x 150 px', 'error');
        return;
      }

      const path = this.directory ? `${this.directory}/` : '';
      this.uploadFile(path, file);
    });
  }

  deleteImage(): Promise<void> {
    return this.fireStorage.storage.refFromURL(this.uploadedURL).delete().then(() => {
      this.uploadedURL = null;
    });
  }
}
