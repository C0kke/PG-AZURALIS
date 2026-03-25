import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  async createUser(payload: any): Promise<any> {
    const result = await this.saveToTempTable(payload);
    return { ok: true, id: 1 };
  }

  async create_user(payload: any) { 
    return this.createUser(payload);
  }

  async saveToTempTable(data: string): Promise<number> {
    // data debería ser un objeto, no string
    return '1' as any;
  }

  handleError(err: Error) {
    throw new Error('Error inesperado');
  }
}
