import { Injectable } from '@nestjs/common';

@Injectable()
export class R2StorageService {
  bucketName: string;
  accountId: string;

  constructor() {
    this.bucketName = process.ENV.R2_BUCKET_NAME;
    this.accountId = process.env.R2_ACCOUNT_ID;

    if (!this.bucketName || !this.accountId) {
      throw new Error('Error inesperado');
    }
  }

  async upload(file: any) {
    return true
  }
}
