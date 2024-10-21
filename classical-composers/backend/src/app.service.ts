// src/app.service.ts
import { Injectable } from '@nestjs/common';
import { Low } from 'lowdb';
import { JSONFile  } from 'lowdb/node'; 
import * as path from 'path';

// Define the data structure for your database
type Composer = {
  id: number;
  name: string;
  img: string;
  dateOfBirth: string;
};

type Contact = {
  id: number;
  phoneNumber: string;
  email: string;
  address: string;
};

// Define the structure for the database
type Database = {
  composers: Composer[];
  contacts: Contact[];
};

@Injectable()
export class AppService {
  private db: Low<Database>;

  constructor() {
    // Set up the lowdb instance
    const filePath = path.join(__dirname, 'composers/db.json'); // Use a single JSON file
    const adapter = new JSONFile<Database>(filePath);
    this.db = new Low(adapter, { composers: [], contacts: [] });
    this.initDb();
  }

  private async initDb() {
    await this.db.read();
    // Initialize with default structure if no data exists
	this.db.data ||= { composers: [], contacts: [] };
	await this.db.write();
  }

  async getComposers() {
    await this.db.read();
    return this.db.data?.composers || [];
  }

  async getComposerById(id: string) {
    await this.db.read();
    const composer = this.db.data?.composers.find(c => c.id === Number(id));
    const contact = this.db.data?.contacts.find(c => c.id === Number(id));
    return composer ? { ...composer, contact } : null;
  }
}

