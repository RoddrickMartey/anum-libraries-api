/**
 * prisma/seed.ts
 *
 * Anum Library System — Database Seed
 * ------------------------------------
 * Run with:  npx prisma db seed
 *
 * package.json must include:
 *   "prisma": { "seed": "ts-node --compiler-options '{\"module\":\"CommonJS\"}' prisma/seed.ts" }
 *
 * Required dev deps (if not already present):
 *   npm i -D ts-node @types/bcryptjs bcryptjs
 */

import {
  Prisma,
  Role,
  CopyStatus,
  MemberStatus,
  LoanStatus,
  ReservationStatus,
  FineType,
  FineStatus,
  BanType,
} from '../generated/prisma/client.js';
import bcrypt from 'bcrypt';

import prisma from '../shared/prisma.js';

// ─── Utility helpers ──────────────────────────────────────────────────────────

const hash = (pw: string) => bcrypt.hashSync(pw, 12);

/** Return a Date that is `days` days before now */
const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
};

/** Return a Date that is `days` days from now */
const daysFromNow = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

/** Random integer in [min, max] */
const rInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** Pick a random element from an array */
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/** Left-pad a number with zeros */
const pad = (n: number, len = 6) => String(n).padStart(len, '0');

/** Deterministic seed UUIDs (RFC 4122 v4 layout) for idempotent upserts */
const seedUuid = (prefix: string, n: number) =>
  `${prefix}-1111-4111-8111-${n.toString(16).padStart(12, '0')}`;

const ID = {
  branch: {
    central: seedUuid('11111111', 1),
    east: seedUuid('11111111', 2),
  },
  staff: {
    super1: seedUuid('22222222', 1),
    super2: seedUuid('22222222', 2),
    centralAdmin: seedUuid('22222222', 3),
    centralSenior: seedUuid('22222222', 4),
    centralLib1: seedUuid('22222222', 5),
    centralLib2: seedUuid('22222222', 6),
    centralDesk: seedUuid('22222222', 7),
    eastAdmin: seedUuid('22222222', 8),
    eastSenior: seedUuid('22222222', 9),
    eastLib1: seedUuid('22222222', 10),
    eastDesk1: seedUuid('22222222', 11),
    eastDesk2: seedUuid('22222222', 12),
  },
  book: (n: number) => seedUuid('33333333', n),
  copy: (n: number) => seedUuid('55555555', n),
  member: (n: number) => seedUuid('44444444', n),
  loan: (n: number) => seedUuid('66666666', n),
  fine: (n: number) => seedUuid('77777777', n),
  reservation: (n: number) => seedUuid('88888888', n),
  ban: (n: number) => seedUuid('99999999', n),
  audit: (n: number) => seedUuid('aaaaaaaa', n),
} as const;

// ─── Main seed ────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱  Starting seed…');

  // ── 1. BRANCHES ─────────────────────────────────────────────────────────────

  const branchCentral = await prisma.branch.upsert({
    where: { id: ID.branch.central },
    update: {},
    create: {
      id: ID.branch.central,
      name: 'Anum Central Library',
      town: 'Accra',
      address: '14 Independence Avenue, Accra Central, GA-001',
      phone: '+233 30 221 0001',
      email: 'central@anum-libraries.com',
      isActive: true,
      loanRules: {
        maxLoansPerMember: 5,
        loanPeriodDays: 14,
        renewalLimit: 2,
        finePerDayGHS: 0.5,
      },
      createdAt: daysAgo(1825),
    },
  });

  const branchEast = await prisma.branch.upsert({
    where: { id: ID.branch.east },
    update: {},
    create: {
      id: ID.branch.east,
      name: 'Anum East Community Library',
      town: 'Tema',
      address: '7 Harbour Road, Community 1, Tema, GA-002',
      phone: '+233 30 320 0002',
      email: 'east@anum-libraries.com',
      isActive: true,
      loanRules: {
        maxLoansPerMember: 4,
        loanPeriodDays: 14,
        renewalLimit: 1,
        finePerDayGHS: 0.5,
      },
      createdAt: daysAgo(1825),
    },
  });

  console.log('✅  Branches created');

  // ── 2. STAFF ────────────────────────────────────────────────────────────────
  //
  //  Passwords (all staff):  Staff@1234
  //  Super-admins:           SuperAdmin@1234
  //  mustChangePassword = false for everyone

  const staffPw = hash('Staff@1234');
  const superPw = hash('SuperAdmin@1234');

  // ─ Super Admins (no branch) ─
  const superAdmin1 = await prisma.staff.upsert({
    where: { email: 'kwame.asante@anum-libraries.com' },
    update: {},
    create: {
      id: ID.staff.super1,
      branchId: null,
      firstName: 'Kwame',
      lastName: 'Asante',
      email: 'kwame.asante@anum-libraries.com',
      passwordHash: superPw,
      role: Role.SUPER_ADMIN,
      isActive: true,
      mustChangePassword: false,
      lastLoginAt: daysAgo(1),
      createdAt: daysAgo(1825),
      createdBy: null,
    },
  });

  const superAdmin2 = await prisma.staff.upsert({
    where: { email: 'abena.mensah@anum-libraries.com' },
    update: {},
    create: {
      id: ID.staff.super2,
      branchId: null,
      firstName: 'Abena',
      lastName: 'Mensah',
      email: 'abena.mensah@anum-libraries.com',
      passwordHash: superPw,
      role: Role.SUPER_ADMIN,
      isActive: true,
      mustChangePassword: false,
      lastLoginAt: daysAgo(3),
      createdAt: daysAgo(1825),
      createdBy: null,
    },
  });

  // ─ Central Branch staff ─
  const centralAdmin = await prisma.staff.upsert({
    where: { email: 'kofi.boateng@central.anum-libraries.com' },
    update: {},
    create: {
      id: ID.staff.centralAdmin,
      branchId: branchCentral.id,
      firstName: 'Kofi',
      lastName: 'Boateng',
      email: 'kofi.boateng@central.anum-libraries.com',
      passwordHash: staffPw,
      role: Role.BRANCH_ADMIN,
      isActive: true,
      mustChangePassword: false,
      lastLoginAt: daysAgo(1),
      createdAt: daysAgo(1820),
      createdBy: superAdmin1.id,
    },
  });

  const centralSenior = await prisma.staff.upsert({
    where: { email: 'ama.owusu@central.anum-libraries.com' },
    update: {},
    create: {
      id: ID.staff.centralSenior,
      branchId: branchCentral.id,
      firstName: 'Ama',
      lastName: 'Owusu',
      email: 'ama.owusu@central.anum-libraries.com',
      passwordHash: staffPw,
      role: Role.SENIOR_LIBRARIAN,
      isActive: true,
      mustChangePassword: false,
      lastLoginAt: daysAgo(2),
      createdAt: daysAgo(1815),
      createdBy: centralAdmin.id,
    },
  });

  const centralLib1 = await prisma.staff.upsert({
    where: { email: 'yaw.darko@central.anum-libraries.com' },
    update: {},
    create: {
      id: ID.staff.centralLib1,
      branchId: branchCentral.id,
      firstName: 'Yaw',
      lastName: 'Darko',
      email: 'yaw.darko@central.anum-libraries.com',
      passwordHash: staffPw,
      role: Role.LIBRARIAN,
      isActive: true,
      mustChangePassword: false,
      lastLoginAt: daysAgo(4),
      createdAt: daysAgo(1810),
      createdBy: centralAdmin.id,
    },
  });

  const centralLib2 = await prisma.staff.upsert({
    where: { email: 'akosua.frimpong@central.anum-libraries.com' },
    update: {},
    create: {
      id: ID.staff.centralLib2,
      branchId: branchCentral.id,
      firstName: 'Akosua',
      lastName: 'Frimpong',
      email: 'akosua.frimpong@central.anum-libraries.com',
      passwordHash: staffPw,
      role: Role.LIBRARIAN,
      isActive: true,
      mustChangePassword: false,
      lastLoginAt: daysAgo(1),
      createdAt: daysAgo(1800),
      createdBy: centralAdmin.id,
    },
  });

  const centralDesk = await prisma.staff.upsert({
    where: { email: 'kweku.ansah@central.anum-libraries.com' },
    update: {},
    create: {
      id: ID.staff.centralDesk,
      branchId: branchCentral.id,
      firstName: 'Kweku',
      lastName: 'Ansah',
      email: 'kweku.ansah@central.anum-libraries.com',
      passwordHash: staffPw,
      role: Role.DESK_STAFF,
      isActive: true,
      mustChangePassword: false,
      lastLoginAt: daysAgo(0),
      createdAt: daysAgo(1780),
      createdBy: centralAdmin.id,
    },
  });

  // ─ East Branch staff ─
  const eastAdmin = await prisma.staff.upsert({
    where: { email: 'efua.acheampong@east.anum-libraries.com' },
    update: {},
    create: {
      id: ID.staff.eastAdmin,
      branchId: branchEast.id,
      firstName: 'Efua',
      lastName: 'Acheampong',
      email: 'efua.acheampong@east.anum-libraries.com',
      passwordHash: staffPw,
      role: Role.BRANCH_ADMIN,
      isActive: true,
      mustChangePassword: false,
      lastLoginAt: daysAgo(1),
      createdAt: daysAgo(1820),
      createdBy: superAdmin2.id,
    },
  });

  const eastSenior = await prisma.staff.upsert({
    where: { email: 'nana.adjei@east.anum-libraries.com' },
    update: {},
    create: {
      id: ID.staff.eastSenior,
      branchId: branchEast.id,
      firstName: 'Nana',
      lastName: 'Adjei',
      email: 'nana.adjei@east.anum-libraries.com',
      passwordHash: staffPw,
      role: Role.SENIOR_LIBRARIAN,
      isActive: true,
      mustChangePassword: false,
      lastLoginAt: daysAgo(3),
      createdAt: daysAgo(1815),
      createdBy: eastAdmin.id,
    },
  });

  const eastLib1 = await prisma.staff.upsert({
    where: { email: 'kojo.amponsah@east.anum-libraries.com' },
    update: {},
    create: {
      id: ID.staff.eastLib1,
      branchId: branchEast.id,
      firstName: 'Kojo',
      lastName: 'Amponsah',
      email: 'kojo.amponsah@east.anum-libraries.com',
      passwordHash: staffPw,
      role: Role.LIBRARIAN,
      isActive: true,
      mustChangePassword: false,
      lastLoginAt: daysAgo(2),
      createdAt: daysAgo(1805),
      createdBy: eastAdmin.id,
    },
  });

  const eastDesk1 = await prisma.staff.upsert({
    where: { email: 'adwoa.tetteh@east.anum-libraries.com' },
    update: {},
    create: {
      id: ID.staff.eastDesk1,
      branchId: branchEast.id,
      firstName: 'Adwoa',
      lastName: 'Tetteh',
      email: 'adwoa.tetteh@east.anum-libraries.com',
      passwordHash: staffPw,
      role: Role.DESK_STAFF,
      isActive: true,
      mustChangePassword: false,
      lastLoginAt: daysAgo(1),
      createdAt: daysAgo(1790),
      createdBy: eastAdmin.id,
    },
  });

  const eastDesk2 = await prisma.staff.upsert({
    where: { email: 'fiifi.agyemang@east.anum-libraries.com' },
    update: {},
    create: {
      id: ID.staff.eastDesk2,
      branchId: branchEast.id,
      firstName: 'Fiifi',
      lastName: 'Agyemang',
      email: 'fiifi.agyemang@east.anum-libraries.com',
      passwordHash: staffPw,
      role: Role.DESK_STAFF,
      isActive: true,
      mustChangePassword: false,
      lastLoginAt: daysAgo(0),
      createdAt: daysAgo(1690),
      createdBy: eastAdmin.id,
    },
  });

  console.log('✅  Staff created (all mustChangePassword=false)');

  // ── 3. BOOKS ────────────────────────────────────────────────────────────────
  //  22 books — split across both branches.
  //  Central gets books 1-12, East gets books 13-22.

  type BookSeed = {
    id: string;
    branchId: string;
    isbn: string;
    title: string;
    authors: string[];
    publisher: string;
    publishedYear: number;
    language: string;
    genre: string;
    description: string;
    shelfLocation: string;
    createdBy: string;
    createdAt: Date;
  };

  const bookData: Omit<BookSeed, 'id'>[] = [
    // ── Central branch books ──────────────────────────────────────────────
    {
      branchId: branchCentral.id,
      isbn: '9780141036144',
      title: 'Nineteen Eighty-Four',
      authors: ['George Orwell'],
      publisher: 'Penguin Books',
      publishedYear: 1949,
      language: 'en',
      genre: 'Dystopian Fiction',
      description:
        'A dystopian social science fiction novel set in Airstrip One.',
      shelfLocation: 'A1-F1',
      createdBy: centralAdmin.id,
      createdAt: daysAgo(1820),
    },
    {
      branchId: branchCentral.id,
      isbn: '9780061120084',
      title: 'To Kill a Mockingbird',
      authors: ['Harper Lee'],
      publisher: 'HarperCollins',
      publishedYear: 1960,
      language: 'en',
      genre: 'Southern Gothic',
      description:
        'A novel about racial injustice and the loss of innocence in the American South.',
      shelfLocation: 'A1-F2',
      createdBy: centralAdmin.id,
      createdAt: daysAgo(1815),
    },
    {
      branchId: branchCentral.id,
      isbn: '9780743273565',
      title: 'The Great Gatsby',
      authors: ['F. Scott Fitzgerald'],
      publisher: 'Scribner',
      publishedYear: 1925,
      language: 'en',
      genre: 'Literary Fiction',
      description:
        'A tale of wealth, love, and the American Dream set in the Jazz Age.',
      shelfLocation: 'A2-F1',
      createdBy: centralSenior.id,
      createdAt: daysAgo(1810),
    },
    {
      branchId: branchCentral.id,
      isbn: '9780525559474',
      title: 'The Hate U Give',
      authors: ['Angie Thomas'],
      publisher: 'Balzer + Bray',
      publishedYear: 2017,
      language: 'en',
      genre: 'Young Adult',
      description:
        "A story about a teenage girl who witnesses her friend's death at the hands of police.",
      shelfLocation: 'B1-F1',
      createdBy: centralSenior.id,
      createdAt: daysAgo(1805),
    },
    {
      branchId: branchCentral.id,
      isbn: '9780385490818',
      title: "The Handmaid's Tale",
      authors: ['Margaret Atwood'],
      publisher: 'McClelland & Stewart',
      publishedYear: 1985,
      language: 'en',
      genre: 'Dystopian Fiction',
      description:
        'A speculative fiction novel set in a totalitarian society that treats women as property.',
      shelfLocation: 'A1-F3',
      createdBy: centralLib1.id,
      createdAt: daysAgo(1800),
    },
    {
      branchId: branchCentral.id,
      isbn: '9780307588364',
      title: 'The Road',
      authors: ['Cormac McCarthy'],
      publisher: 'Vintage Books',
      publishedYear: 2006,
      language: 'en',
      genre: 'Post-Apocalyptic',
      description:
        'A father and son journey through a post-apocalyptic America.',
      shelfLocation: 'B2-F2',
      createdBy: centralLib1.id,
      createdAt: daysAgo(1795),
    },
    {
      branchId: branchCentral.id,
      isbn: '9780385737951',
      title: 'The Fault in Our Stars',
      authors: ['John Green'],
      publisher: 'Dutton Books',
      publishedYear: 2012,
      language: 'en',
      genre: 'Young Adult',
      description:
        'Two teenagers with cancer fall in love and embark on a life-changing journey.',
      shelfLocation: 'B1-F2',
      createdBy: centralLib2.id,
      createdAt: daysAgo(1790),
    },
    {
      branchId: branchCentral.id,
      isbn: '9780062316097',
      title: 'The Alchemist',
      authors: ['Paulo Coelho'],
      publisher: 'HarperOne',
      publishedYear: 1988,
      language: 'en',
      genre: 'Philosophical Fiction',
      description: "A young Andalusian shepherd's journey of self-discovery.",
      shelfLocation: 'C1-F1',
      createdBy: centralLib2.id,
      createdAt: daysAgo(1785),
    },
    {
      branchId: branchCentral.id,
      isbn: '9780374533557',
      title: 'Things Fall Apart',
      authors: ['Chinua Achebe'],
      publisher: 'Anchor Books',
      publishedYear: 1958,
      language: 'en',
      genre: 'African Literature',
      description:
        'The story of Okonkwo, a leader in the Igbo community of Nigeria.',
      shelfLocation: 'C2-F1',
      createdBy: centralAdmin.id,
      createdAt: daysAgo(1780),
    },
    {
      branchId: branchCentral.id,
      isbn: '9780385546010',
      title: 'The Testaments',
      authors: ['Margaret Atwood'],
      publisher: 'McClelland & Stewart',
      publishedYear: 2019,
      language: 'en',
      genre: 'Dystopian Fiction',
      description:
        "A sequel to The Handmaid's Tale, told through three female narrators.",
      shelfLocation: 'A1-F4',
      createdBy: centralSenior.id,
      createdAt: daysAgo(1760),
    },
    // ── East branch books ─────────────────────────────────────────────────
    {
      branchId: branchEast.id,
      isbn: '9781594634024',
      title: 'A Long Way Gone',
      authors: ['Ishmael Beah'],
      publisher: 'Farrar, Straus and Giroux',
      publishedYear: 2007,
      language: 'en',
      genre: 'Memoir',
      description: 'Memoirs of a boy soldier in Sierra Leone.',
      shelfLocation: 'A1-F1',
      createdBy: eastAdmin.id,
      createdAt: daysAgo(1820),
    },
    {
      branchId: branchEast.id,
      isbn: '9780307346605',
      title: 'Half of a Yellow Sun',
      authors: ['Chimamanda Ngozi Adichie'],
      publisher: 'Anchor Books',
      publishedYear: 2006,
      language: 'en',
      genre: 'Historical Fiction',
      description: 'A story set during the Biafran War in Nigeria.',
      shelfLocation: 'A2-F1',
      createdBy: eastAdmin.id,
      createdAt: daysAgo(1815),
    },
    {
      branchId: branchEast.id,
      isbn: '9780062409850',
      title: 'So Long a Letter',
      authors: ['Mariama Bâ'],
      publisher: 'Heinemann',
      publishedYear: 1979,
      language: 'en',
      genre: 'Epistolary Novel',
      description:
        'A Senegalese woman reflects on her life through letters to a friend.',
      shelfLocation: 'B1-F1',
      createdBy: eastSenior.id,
      createdAt: daysAgo(1810),
    },
    {
      branchId: branchEast.id,
      isbn: '9780385333481',
      title: 'Weep Not, Child',
      authors: ["Ngũgĩ wa Thiong'o"],
      publisher: 'Penguin Books',
      publishedYear: 1964,
      language: 'en',
      genre: 'African Literature',
      description:
        "A story of a Kenyan family's struggle during the Mau Mau uprising.",
      shelfLocation: 'B2-F1',
      createdBy: eastSenior.id,
      createdAt: daysAgo(1805),
    },
    {
      branchId: branchEast.id,
      isbn: '9780802141798',
      title: 'Season of Migration to the North',
      authors: ['Tayeb Salih'],
      publisher: 'New York Review Books',
      publishedYear: 1966,
      language: 'en',
      genre: 'Postcolonial Fiction',
      description: "A tale of a Sudanese man's experiences in London.",
      shelfLocation: 'C1-F1',
      createdBy: eastLib1.id,
      createdAt: daysAgo(1800),
    },
    {
      branchId: branchEast.id,
      isbn: '9780374533526',
      title: 'Arrow of God',
      authors: ['Chinua Achebe'],
      publisher: 'Anchor Books',
      publishedYear: 1964,
      language: 'en',
      genre: 'African Literature',
      description:
        "The third novel in Achebe's African trilogy, set in colonial Nigeria.",
      shelfLocation: 'C2-F1',
      createdBy: eastLib1.id,
      createdAt: daysAgo(1795),
    },
    {
      branchId: branchEast.id,
      isbn: '9780143124290',
      title: 'Purple Hibiscus',
      authors: ['Chimamanda Ngozi Adichie'],
      publisher: 'Anchor Books',
      publishedYear: 2003,
      language: 'en',
      genre: 'African Literature',
      description: 'A coming-of-age story set in postcolonial Nigeria.',
      shelfLocation: 'A3-F1',
      createdBy: eastAdmin.id,
      createdAt: daysAgo(1790),
    },
    {
      branchId: branchEast.id,
      isbn: '9780385490481',
      title: 'Americanah',
      authors: ['Chimamanda Ngozi Adichie'],
      publisher: 'Anchor Books',
      publishedYear: 2013,
      language: 'en',
      genre: 'Contemporary Fiction',
      description: 'A Nigerian woman navigates race and identity in America.',
      shelfLocation: 'A3-F2',
      createdBy: eastAdmin.id,
      createdAt: daysAgo(1775),
    },
    {
      branchId: branchCentral.id,
      isbn: '9780140449181',
      title: 'Things Fall Apart: 50th Anniversary Edition',
      authors: ['Chinua Achebe'],
      publisher: 'Vintage Classics',
      publishedYear: 2008,
      language: 'en',
      genre: 'African Literature',
      description:
        'A commemorative edition of an African classic with a modern introduction.',
      shelfLocation: 'C2-F2',
      createdBy: centralLib2.id,
      createdAt: daysAgo(1750),
    },
    {
      branchId: branchCentral.id,
      isbn: '9780143111580',
      title: 'Americanah (Illustrated Edition)',
      authors: ['Chimamanda Ngozi Adichie'],
      publisher: 'Penguin Classics',
      publishedYear: 2020,
      language: 'en',
      genre: 'Contemporary Fiction',
      description:
        'A recent illustrated edition reflecting modern readership tastes.',
      shelfLocation: 'A3-F3',
      createdBy: centralAdmin.id,
      createdAt: daysAgo(1740),
    },
    {
      branchId: branchEast.id,
      isbn: '9780525418090',
      title: 'Homegoing',
      authors: ['Yaa Gyasi'],
      publisher: 'Knopf',
      publishedYear: 2016,
      language: 'en',
      genre: 'Historical Fiction',
      description:
        'A sweeping family saga spanning generations and continents.',
      shelfLocation: 'B3-F1',
      createdBy: eastSenior.id,
      createdAt: daysAgo(1730),
    },
    {
      branchId: branchEast.id,
      isbn: '9781529035818',
      title: 'Becoming',
      authors: ['Michelle Obama'],
      publisher: 'Crown',
      publishedYear: 2018,
      language: 'en',
      genre: 'Memoir',
      description:
        'The former First Lady reflects on her life, career, and community impact.',
      shelfLocation: 'B3-F2',
      createdBy: eastDesk2.id,
      createdAt: daysAgo(1720),
    },
  ];

  const books = [];
  for (let i = 0; i < bookData.length; i++) {
    const bookId = ID.book(i + 1);
    const b = await prisma.book.upsert({
      where: { id: bookId },
      update: {},
      create: {
        id: bookId,
        ...bookData[i],
        updatedAt: new Date(),
      },
    });
    books.push(b);
  }

  console.log(`✅  ${books.length} books created`);

  // ── 4. COPIES ───────────────────────────────────────────────────────────────
  //  Each book gets 3-5 copies.
  //  Some copies are DAMAGED or WITHDRAWN to reflect a lived-in system.

  type CopySeed = {
    id: string;
    bookId: string;
    branchId: string;
    barcode: string;
    status: CopyStatus;
    condition?: string;
    acquiredAt: Date;
    withdrawnAt?: Date;
    createdAt: Date;
  };

  const allCopies: CopySeed[] = [];
  let copyCounter = 1;

  for (const book of books) {
    const numCopies = rInt(3, 5);
    for (let c = 0; c < numCopies; c++) {
      const copyId = ID.copy(copyCounter);
      const barcode = `ALB-${pad(copyCounter, 8)}`;
      const acquiredAt = new Date(
        book.createdAt.getTime() + rInt(1, 10) * 86_400_000,
      );

      // Last copy of each book has a chance to be damaged or withdrawn
      let status: CopyStatus = CopyStatus.AVAILABLE;
      let condition: string | undefined;
      let withdrawnAt: Date | undefined;

      if (c === numCopies - 1 && numCopies > 3) {
        // Make the last copy of books with 5 copies either damaged or withdrawn
        const roll = Math.random();
        if (roll < 0.4) {
          status = CopyStatus.DAMAGED;
          condition = pick([
            'Spine cracked',
            'Pages water-damaged',
            'Cover torn',
            'Heavy pencil markings throughout',
          ]);
        } else if (roll < 0.7) {
          status = CopyStatus.WITHDRAWN;
          condition = 'Decommissioned — replaced by newer edition';
          withdrawnAt = daysAgo(rInt(30, 180));
        }
      }

      allCopies.push({
        id: copyId,
        bookId: book.id,
        branchId: book.branchId,
        barcode,
        status,
        condition,
        acquiredAt,
        withdrawnAt,
        createdAt: acquiredAt,
      });
      copyCounter++;
    }
  }

  for (const copy of allCopies) {
    await prisma.copy.upsert({
      where: { id: copy.id },
      update: {},
      create: {
        id: copy.id,
        bookId: copy.bookId,
        branchId: copy.branchId,
        barcode: copy.barcode,
        status: copy.status,
        condition: copy.condition,
        acquiredAt: copy.acquiredAt,
        withdrawnAt: copy.withdrawnAt,
        createdAt: copy.createdAt,
      },
    });
  }

  console.log(
    `✅  ${allCopies.length} copies created (including damaged/withdrawn)`,
  );

  // ── 5. MEMBERS ──────────────────────────────────────────────────────────────
  //  22 members split across both branches.
  //  Card expiry is 1 year from issue date.

  type MemberSeed = {
    id: string;
    branchId: string;
    cardNumber: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    phone: string;
    email: string;
    address: string;
    cardIssuedAt: Date;
    cardExpiresAt: Date;
    status: MemberStatus;
    notes?: string;
    createdAt: Date;
    createdBy: string;
  };

  const memberDataRaw = [
    // Central members
    {
      id: ID.member(1),
      branchId: branchCentral.id,
      cardNumber: 'ALM-C-000001',
      firstName: 'Esi',
      lastName: 'Koomson',
      dob: '1995-03-12',
      phone: '+233244001001',
      email: 'esi.koomson@email.com',
      address: '12 Cantonments Rd, Accra',
      issuedDaysAgo: 350,
      createdBy: centralDesk.id,
    },
    {
      id: ID.member(2),
      branchId: branchCentral.id,
      cardNumber: 'ALM-C-000002',
      firstName: 'Kwabena',
      lastName: 'Oppong',
      dob: '1988-07-21',
      phone: '+233244001002',
      email: 'kwabena.oppong@email.com',
      address: '5 Ring Road, Accra',
      issuedDaysAgo: 340,
      createdBy: centralDesk.id,
    },
    {
      id: ID.member(3),
      branchId: branchCentral.id,
      cardNumber: 'ALM-C-000003',
      firstName: 'Maame',
      lastName: 'Asare',
      dob: '2001-11-05',
      phone: '+233244001003',
      email: 'maame.asare@email.com',
      address: '33 Spintex Rd, Accra',
      issuedDaysAgo: 320,
      createdBy: centralLib1.id,
    },
    {
      id: ID.member(4),
      branchId: branchCentral.id,
      cardNumber: 'ALM-C-000004',
      firstName: 'Paa',
      lastName: 'Kwesi',
      dob: '1979-04-30',
      phone: '+233244001004',
      email: 'paa.kwesi@email.com',
      address: '18 Oxford Street, Osu, Accra',
      issuedDaysAgo: 310,
      createdBy: centralLib1.id,
    },
    {
      id: ID.member(5),
      branchId: branchCentral.id,
      cardNumber: 'ALM-C-000005',
      firstName: 'Yaa',
      lastName: 'Danso',
      dob: '1993-09-14',
      phone: '+233244001005',
      email: 'yaa.danso@email.com',
      address: '9 Labone Close, Accra',
      issuedDaysAgo: 290,
      createdBy: centralLib2.id,
    },
    {
      id: ID.member(6),
      branchId: branchCentral.id,
      cardNumber: 'ALM-C-000006',
      firstName: 'Kofi',
      lastName: 'Agyei',
      dob: '1985-02-18',
      phone: '+233244001006',
      email: 'kofi.agyei@email.com',
      address: '22 Tudu Lane, Accra',
      issuedDaysAgo: 270,
      createdBy: centralLib2.id,
    },
    {
      id: ID.member(7),
      branchId: branchCentral.id,
      cardNumber: 'ALM-C-000007',
      firstName: 'Akua',
      lastName: 'Bempong',
      dob: '2003-06-22',
      phone: '+233244001007',
      email: 'akua.bempong@email.com',
      address: '7 East Legon, Accra',
      issuedDaysAgo: 250,
      createdBy: centralDesk.id,
    },
    {
      id: ID.member(8),
      branchId: branchCentral.id,
      cardNumber: 'ALM-C-000008',
      firstName: 'Nii',
      lastName: 'Kotey',
      dob: '1970-12-01',
      phone: '+233244001008',
      email: 'nii.kotey@email.com',
      address: '45 James Town, Accra',
      issuedDaysAgo: 230,
      createdBy: centralDesk.id,
    },
    {
      id: ID.member(9),
      branchId: branchCentral.id,
      cardNumber: 'ALM-C-000009',
      firstName: 'Abena',
      lastName: 'Sarpong',
      dob: '1998-08-17',
      phone: '+233244001009',
      email: 'abena.sarpong@email.com',
      address: '3 North Kaneshie, Accra',
      issuedDaysAgo: 210,
      createdBy: centralLib1.id,
    },
    {
      id: ID.member(10),
      branchId: branchCentral.id,
      cardNumber: 'ALM-C-000010',
      firstName: 'Kwame',
      lastName: 'Boadu',
      dob: '1991-01-29',
      phone: '+233244001010',
      email: 'kwame.boadu@email.com',
      address: '11 Airport Residential, Accra',
      issuedDaysAgo: 190,
      createdBy: centralLib1.id,
    },
    // East members
    {
      id: ID.member(11),
      branchId: branchEast.id,
      cardNumber: 'ALM-E-000001',
      firstName: 'Kojo',
      lastName: 'Acheampong',
      dob: '1996-05-08',
      phone: '+233244002001',
      email: 'kojo.acheampong@email.com',
      address: '4 Community 5, Tema',
      issuedDaysAgo: 350,
      createdBy: eastDesk1.id,
    },
    {
      id: ID.member(12),
      branchId: branchEast.id,
      cardNumber: 'ALM-E-000002',
      firstName: 'Adwoa',
      lastName: 'Nyarko',
      dob: '1989-10-15',
      phone: '+233244002002',
      email: 'adwoa.nyarko@email.com',
      address: '8 Harbour View, Tema',
      issuedDaysAgo: 335,
      createdBy: eastDesk1.id,
    },
    {
      id: ID.member(13),
      branchId: branchEast.id,
      cardNumber: 'ALM-E-000003',
      firstName: 'Kweku',
      lastName: 'Quaye',
      dob: '2000-03-25',
      phone: '+233244002003',
      email: 'kweku.quaye@email.com',
      address: '15 Industrial Area, Tema',
      issuedDaysAgo: 320,
      createdBy: eastDesk2.id,
    },
    {
      id: ID.member(14),
      branchId: branchEast.id,
      cardNumber: 'ALM-E-000004',
      firstName: 'Ama',
      lastName: 'Ankrah',
      dob: '1982-07-04',
      phone: '+233244002004',
      email: 'ama.ankrah@email.com',
      address: '2 Meridian St, Tema',
      issuedDaysAgo: 300,
      createdBy: eastLib1.id,
    },
    {
      id: ID.member(15),
      branchId: branchEast.id,
      cardNumber: 'ALM-E-000005',
      firstName: 'Fiifi',
      lastName: 'Asiedu',
      dob: '1975-11-19',
      phone: '+233244002005',
      email: 'fiifi.asiedu@email.com',
      address: '30 Tema Newtown, Tema',
      issuedDaysAgo: 280,
      createdBy: eastLib1.id,
    },
    {
      id: ID.member(16),
      branchId: branchEast.id,
      cardNumber: 'ALM-E-000006',
      firstName: 'Efua',
      lastName: 'Mensah',
      dob: '1994-04-11',
      phone: '+233244002006',
      email: 'efua.mensah@email.com',
      address: '9 Ashiaman, Tema',
      issuedDaysAgo: 260,
      createdBy: eastDesk1.id,
    },
    {
      id: ID.member(17),
      branchId: branchEast.id,
      cardNumber: 'ALM-E-000007',
      firstName: 'Yaw',
      lastName: 'Ofori',
      dob: '2002-09-30',
      phone: '+233244002007',
      email: 'yaw.ofori@email.com',
      address: '6 Valco Flats, Tema',
      issuedDaysAgo: 240,
      createdBy: eastDesk2.id,
    },
    {
      id: ID.member(18),
      branchId: branchEast.id,
      cardNumber: 'ALM-E-000008',
      firstName: 'Nana',
      lastName: 'Boateng',
      dob: '1987-02-14',
      phone: '+233244002008',
      email: 'nana.boateng@email.com',
      address: '18 Fishing Harbour Rd, Tema',
      issuedDaysAgo: 220,
      createdBy: eastDesk1.id,
    },
    // mem-019: will be BANNED (Central)
    {
      id: ID.member(19),
      branchId: branchCentral.id,
      cardNumber: 'ALM-C-000019',
      firstName: 'Ransford',
      lastName: 'Gyimah',
      dob: '1990-06-06',
      phone: '+233244001019',
      email: 'ransford.gyimah@email.com',
      address: '55 Darkuman Rd, Accra',
      issuedDaysAgo: 280,
      createdBy: centralDesk.id,
    },
    // mem-020: will be BANNED (East)
    {
      id: ID.member(20),
      branchId: branchEast.id,
      cardNumber: 'ALM-E-000009',
      firstName: 'Beatrice',
      lastName: 'Quarshie',
      dob: '1983-12-20',
      phone: '+233244002009',
      email: 'beatrice.quarshie@email.com',
      address: '44 Lashibi, Tema',
      issuedDaysAgo: 260,
      createdBy: eastDesk2.id,
    },
    {
      id: ID.member(21),
      branchId: branchCentral.id,
      cardNumber: 'ALM-C-000021',
      firstName: 'Mariam',
      lastName: 'Antwi',
      dob: '1992-02-17',
      phone: '+233244001021',
      email: 'mariam.antwi@email.com',
      address: '29 Airport Residential, Accra',
      issuedDaysAgo: 240,
      createdBy: centralDesk.id,
    },
    {
      id: ID.member(22),
      branchId: branchEast.id,
      cardNumber: 'ALM-E-000010',
      firstName: 'Kwesi',
      lastName: 'Bekoe',
      dob: '1986-09-12',
      phone: '+233244002010',
      email: 'kwesi.bekoe@email.com',
      address: '19 Community 6, Tema',
      issuedDaysAgo: 220,
      createdBy: eastDesk1.id,
    },
  ];

  const members: MemberSeed[] = memberDataRaw.map((m) => {
    const issuedAt = daysAgo(m.issuedDaysAgo);
    const expiresAt = new Date(issuedAt);
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    return {
      id: m.id,
      branchId: m.branchId,
      cardNumber: m.cardNumber,
      firstName: m.firstName,
      lastName: m.lastName,
      dateOfBirth: new Date(m.dob),
      phone: m.phone,
      email: m.email,
      address: m.address,
      cardIssuedAt: issuedAt,
      cardExpiresAt: expiresAt,
      status: MemberStatus.ACTIVE,
      createdAt: issuedAt,
      createdBy: m.createdBy,
    };
  });

  for (const mem of members) {
    await prisma.member.upsert({
      where: { id: mem.id },
      update: {},
      create: mem,
    });
  }

  console.log(`✅  ${members.length} members created`);

  // ── 6. LOANS ────────────────────────────────────────────────────────────────
  //  Mix of:
  //  - Returned loans (historical, spread over the last five years)
  //  - Currently active loans (some overdue, some not)
  //  One member (mem-001) has a fine that was PAID.

  // Helper: get AVAILABLE copies for a branch
  const availCopies = (branchId: string) =>
    allCopies.filter(
      (c) => c.branchId === branchId && c.status === CopyStatus.AVAILABLE,
    );

  // Track which copy IDs we've loaned so we don't double-loan
  const loanedCopyIds = new Set<string>();

  const pickAvailCopy = (branchId: string): CopySeed | undefined => {
    const available = availCopies(branchId).filter(
      (c) => !loanedCopyIds.has(c.id),
    );
    if (available.length === 0) return undefined;
    return pick(available);
  };

  type LoanSeed = {
    id: string;
    branchId: string;
    copyId: string;
    memberId: string;
    checkedOutAt: Date;
    dueAt: Date;
    returnedAt?: Date;
    checkedOutBy: string;
    checkedInBy?: string;
    renewalCount: number;
    status: LoanStatus;
  };

  const loanSeeds: LoanSeed[] = [];
  let loanCounter = 1;

  // ── Historical returned loans (spread across the year) ──
  const historicalLoans: Array<{
    memberId: string;
    branchId: string;
    staffOut: string;
    staffIn: string;
    daysAgoOut: number;
    loanDays: number;
  }> = [
    {
      memberId: ID.member(1),
      branchId: branchCentral.id,
      staffOut: centralDesk.id,
      staffIn: centralDesk.id,
      daysAgoOut: 340,
      loanDays: 14,
    },
    {
      memberId: ID.member(2),
      branchId: branchCentral.id,
      staffOut: centralLib1.id,
      staffIn: centralLib1.id,
      daysAgoOut: 330,
      loanDays: 14,
    },
    {
      memberId: ID.member(3),
      branchId: branchCentral.id,
      staffOut: centralDesk.id,
      staffIn: centralDesk.id,
      daysAgoOut: 300,
      loanDays: 14,
    },
    {
      memberId: ID.member(4),
      branchId: branchCentral.id,
      staffOut: centralLib2.id,
      staffIn: centralLib2.id,
      daysAgoOut: 280,
      loanDays: 14,
    },
    {
      memberId: ID.member(5),
      branchId: branchCentral.id,
      staffOut: centralDesk.id,
      staffIn: centralDesk.id,
      daysAgoOut: 260,
      loanDays: 14,
    },
    {
      memberId: ID.member(6),
      branchId: branchCentral.id,
      staffOut: centralLib1.id,
      staffIn: centralLib1.id,
      daysAgoOut: 240,
      loanDays: 14,
    },
    {
      memberId: ID.member(7),
      branchId: branchCentral.id,
      staffOut: centralDesk.id,
      staffIn: centralDesk.id,
      daysAgoOut: 210,
      loanDays: 14,
    },
    {
      memberId: ID.member(8),
      branchId: branchCentral.id,
      staffOut: centralDesk.id,
      staffIn: centralDesk.id,
      daysAgoOut: 190,
      loanDays: 21,
    },
    // mem-001 second loan — this one was returned late → generates a fine
    {
      memberId: ID.member(1),
      branchId: branchCentral.id,
      staffOut: centralDesk.id,
      staffIn: centralLib1.id,
      daysAgoOut: 170,
      loanDays: 25,
    }, // 11 days overdue
    {
      memberId: ID.member(9),
      branchId: branchCentral.id,
      staffOut: centralLib2.id,
      staffIn: centralLib2.id,
      daysAgoOut: 160,
      loanDays: 14,
    },
    {
      memberId: ID.member(10),
      branchId: branchCentral.id,
      staffOut: centralDesk.id,
      staffIn: centralDesk.id,
      daysAgoOut: 140,
      loanDays: 14,
    },
    // East branch historical
    {
      memberId: ID.member(11),
      branchId: branchEast.id,
      staffOut: eastDesk1.id,
      staffIn: eastDesk1.id,
      daysAgoOut: 330,
      loanDays: 14,
    },
    {
      memberId: ID.member(12),
      branchId: branchEast.id,
      staffOut: eastLib1.id,
      staffIn: eastLib1.id,
      daysAgoOut: 310,
      loanDays: 14,
    },
    {
      memberId: ID.member(13),
      branchId: branchEast.id,
      staffOut: eastDesk2.id,
      staffIn: eastDesk2.id,
      daysAgoOut: 290,
      loanDays: 14,
    },
    {
      memberId: ID.member(14),
      branchId: branchEast.id,
      staffOut: eastLib1.id,
      staffIn: eastLib1.id,
      daysAgoOut: 270,
      loanDays: 14,
    },
    {
      memberId: ID.member(15),
      branchId: branchEast.id,
      staffOut: eastDesk1.id,
      staffIn: eastDesk1.id,
      daysAgoOut: 250,
      loanDays: 14,
    },
    {
      memberId: ID.member(16),
      branchId: branchEast.id,
      staffOut: eastDesk2.id,
      staffIn: eastDesk2.id,
      daysAgoOut: 220,
      loanDays: 21,
    },
    {
      memberId: ID.member(17),
      branchId: branchEast.id,
      staffOut: eastDesk1.id,
      staffIn: eastDesk1.id,
      daysAgoOut: 190,
      loanDays: 14,
    },
    {
      memberId: ID.member(18),
      branchId: branchEast.id,
      staffOut: eastLib1.id,
      staffIn: eastLib1.id,
      daysAgoOut: 160,
      loanDays: 14,
    },
  ];

  for (const hl of historicalLoans) {
    const copy = pickAvailCopy(hl.branchId);
    if (!copy) continue;
    loanedCopyIds.add(copy.id);
    const checkedOutAt = daysAgo(hl.daysAgoOut);
    const dueAt = new Date(checkedOutAt.getTime() + hl.loanDays * 86_400_000);
    const returnedAt = new Date(
      checkedOutAt.getTime() + hl.loanDays * 86_400_000,
    ); // returned exactly on/after due
    // for mem-001's second loan make it late
    const isLateLoan = hl.memberId === ID.member(1) && hl.daysAgoOut === 170;
    const actualReturn = isLateLoan
      ? new Date(dueAt.getTime() + 11 * 86_400_000) // 11 days late
      : returnedAt;

    loanSeeds.push({
      id: ID.loan(loanCounter),
      branchId: hl.branchId,
      copyId: copy.id,
      memberId: hl.memberId,
      checkedOutAt,
      dueAt,
      returnedAt: actualReturn,
      checkedOutBy: hl.staffOut,
      checkedInBy: hl.staffIn,
      renewalCount: 0,
      status: LoanStatus.RETURNED,
    });
    loanCounter++;
  }

  // ── Active loans (currently borrowed) ──
  const activeLoansData: Array<{
    memberId: string;
    branchId: string;
    staffOut: string;
    daysAgoOut: number;
    daysUntilDue: number;
    overdue?: boolean;
    renewed?: boolean;
  }> = [
    {
      memberId: ID.member(2),
      branchId: branchCentral.id,
      staffOut: centralDesk.id,
      daysAgoOut: 10,
      daysUntilDue: 4,
    },
    {
      memberId: ID.member(3),
      branchId: branchCentral.id,
      staffOut: centralLib1.id,
      daysAgoOut: 16,
      daysUntilDue: -2,
      overdue: true,
    },
    {
      memberId: ID.member(4),
      branchId: branchCentral.id,
      staffOut: centralDesk.id,
      daysAgoOut: 12,
      daysUntilDue: 2,
    },
    {
      memberId: ID.member(5),
      branchId: branchCentral.id,
      staffOut: centralLib2.id,
      daysAgoOut: 14,
      daysUntilDue: 0,
    },
    {
      memberId: ID.member(6),
      branchId: branchCentral.id,
      staffOut: centralDesk.id,
      daysAgoOut: 20,
      daysUntilDue: -6,
      overdue: true,
    },
    {
      memberId: ID.member(9),
      branchId: branchCentral.id,
      staffOut: centralLib1.id,
      daysAgoOut: 7,
      daysUntilDue: 7,
      renewed: true,
    },
    {
      memberId: ID.member(11),
      branchId: branchEast.id,
      staffOut: eastDesk1.id,
      daysAgoOut: 8,
      daysUntilDue: 6,
    },
    {
      memberId: ID.member(12),
      branchId: branchEast.id,
      staffOut: eastLib1.id,
      daysAgoOut: 15,
      daysUntilDue: -1,
      overdue: true,
    },
    {
      memberId: ID.member(13),
      branchId: branchEast.id,
      staffOut: eastDesk2.id,
      daysAgoOut: 11,
      daysUntilDue: 3,
    },
    {
      memberId: ID.member(14),
      branchId: branchEast.id,
      staffOut: eastLib1.id,
      daysAgoOut: 6,
      daysUntilDue: 8,
    },
    {
      memberId: ID.member(16),
      branchId: branchEast.id,
      staffOut: eastDesk1.id,
      daysAgoOut: 13,
      daysUntilDue: 1,
    },
    {
      memberId: ID.member(17),
      branchId: branchEast.id,
      staffOut: eastDesk2.id,
      daysAgoOut: 18,
      daysUntilDue: -4,
      overdue: true,
    },
  ];

  const activeLoanIds: { [memberId: string]: string } = {};

  for (const al of activeLoansData) {
    const copy = pickAvailCopy(al.branchId);
    if (!copy) continue;
    loanedCopyIds.add(copy.id);
    const checkedOutAt = daysAgo(al.daysAgoOut);
    const dueAt = daysFromNow(al.daysUntilDue);
    const status = al.overdue ? LoanStatus.OVERDUE : LoanStatus.ACTIVE;
    const loanId = ID.loan(loanCounter);
    loanSeeds.push({
      id: loanId,
      branchId: al.branchId,
      copyId: copy.id,
      memberId: al.memberId,
      checkedOutAt,
      dueAt,
      checkedOutBy: al.staffOut,
      renewalCount: al.renewed ? 1 : 0,
      status,
    });
    activeLoanIds[al.memberId] = loanId;

    // Mark the copy as BORROWED in our local array
    const copyIdx = allCopies.findIndex((c) => c.id === copy.id);
    if (copyIdx > -1) allCopies[copyIdx].status = CopyStatus.BORROWED;

    loanCounter++;
  }

  for (const loan of loanSeeds) {
    await prisma.loan.upsert({
      where: { id: loan.id },
      update: {},
      create: loan,
    });
  }

  // Update borrowed copies in DB
  for (const copy of allCopies.filter(
    (c) => c.status === CopyStatus.BORROWED,
  )) {
    await prisma.copy.update({
      where: { id: copy.id },
      data: { status: CopyStatus.BORROWED },
    });
  }

  console.log(
    `✅  ${loanSeeds.length} loans created (${activeLoansData.length} active, ${historicalLoans.length} returned)`,
  );

  // ── 7. FINES ────────────────────────────────────────────────────────────────
  //  - mem-001 has an overdue fine that has been PAID (11 days × GHS 0.50 = GHS 5.50)
  //  - mem-003 has an outstanding overdue fine (current active overdue loan)
  //  - mem-006 has an outstanding overdue fine
  //  - mem-012 (East) outstanding
  //  - mem-017 (East) outstanding

  // Find the late loan for mem-001 (index 8 in historicalLoans → loan seed index 8)
  const lateReturnLoanId = loanSeeds[8].id; // mem-001's late return

  type FineSeed = {
    id: string;
    branchId: string;
    memberId: string;
    loanId: string | null;
    type: FineType;
    amount: number;
    amountPaid: number;
    status: FineStatus;
    reason: string;
    issuedAt: Date;
    settledAt?: Date;
    actionBy: string;
  };

  const fines: FineSeed[] = [
    {
      id: ID.fine(1),
      branchId: branchCentral.id,
      memberId: ID.member(1),
      loanId: lateReturnLoanId,
      type: FineType.OVERDUE,
      amount: 5.5,
      amountPaid: 5.5,
      status: FineStatus.PAID,
      reason: 'Book returned 11 days late',
      issuedAt: daysAgo(1630 - 25 + 11), // day it was returned
      settledAt: daysAgo(1630 - 25 + 13), // paid 2 days after return
      actionBy: centralDesk.id,
    },
    {
      id: ID.fine(2),
      branchId: branchCentral.id,
      memberId: ID.member(3),
      loanId: activeLoanIds[ID.member(3)] ?? null,
      type: FineType.OVERDUE,
      amount: 1.0,
      amountPaid: 0,
      status: FineStatus.OUTSTANDING,
      reason: 'Book overdue by 2 days',
      issuedAt: daysAgo(1),
      actionBy: centralLib1.id,
    },
    {
      id: ID.fine(3),
      branchId: branchCentral.id,
      memberId: ID.member(6),
      loanId: activeLoanIds[ID.member(6)] ?? null,
      type: FineType.OVERDUE,
      amount: 3.0,
      amountPaid: 0,
      status: FineStatus.OUTSTANDING,
      reason: 'Book overdue by 6 days',
      issuedAt: daysAgo(3),
      actionBy: centralDesk.id,
    },
    {
      id: ID.fine(4),
      branchId: branchEast.id,
      memberId: ID.member(12),
      loanId: activeLoanIds[ID.member(12)] ?? null,
      type: FineType.OVERDUE,
      amount: 0.5,
      amountPaid: 0,
      status: FineStatus.OUTSTANDING,
      reason: 'Book overdue by 1 day',
      issuedAt: daysAgo(1),
      actionBy: eastDesk1.id,
    },
    {
      id: ID.fine(5),
      branchId: branchEast.id,
      memberId: ID.member(17),
      loanId: activeLoanIds[ID.member(17)] ?? null,
      type: FineType.OVERDUE,
      amount: 2.0,
      amountPaid: 0,
      status: FineStatus.OUTSTANDING,
      reason: 'Book overdue by 4 days',
      issuedAt: daysAgo(2),
      actionBy: eastDesk2.id,
    },
  ];

  for (const fine of fines) {
    await prisma.fine.upsert({
      where: { id: fine.id },
      update: {},
      create: {
        id: fine.id,
        branchId: fine.branchId,
        memberId: fine.memberId,
        loanId: fine.loanId,
        type: fine.type,
        amount: fine.amount,
        amountPaid: fine.amountPaid,
        status: fine.status,
        reason: fine.reason,
        issuedAt: fine.issuedAt,
        settledAt: fine.settledAt ?? null,
        actionBy: fine.actionBy,
      },
    });
  }

  console.log(`✅  ${fines.length} fines created (1 paid by mem-001)`);

  // ── 8. RESERVATIONS ─────────────────────────────────────────────────────────

  const reservations = [
    {
      id: ID.reservation(1),
      branchId: branchCentral.id,
      bookId: books[0].id, // 1984
      memberId: ID.member(7),
      queuePosition: 1,
      reservedAt: daysAgo(5),
      status: ReservationStatus.PENDING,
      createdBy: centralDesk.id,
    },
    {
      id: ID.reservation(2),
      branchId: branchCentral.id,
      bookId: books[2].id, // Great Gatsby
      memberId: ID.member(8),
      queuePosition: 1,
      reservedAt: daysAgo(3),
      status: ReservationStatus.PENDING,
      createdBy: centralDesk.id,
    },
    {
      id: ID.reservation(3),
      branchId: branchEast.id,
      bookId: books[11].id, // Half of a Yellow Sun
      memberId: ID.member(15),
      queuePosition: 1,
      reservedAt: daysAgo(7),
      notifiedAt: daysAgo(2),
      expiresAt: daysFromNow(2),
      status: ReservationStatus.READY,
      createdBy: eastLib1.id,
    },
    {
      id: ID.reservation(4),
      branchId: branchCentral.id,
      bookId: books[8].id, // Things Fall Apart
      memberId: ID.member(10),
      queuePosition: 1,
      reservedAt: daysAgo(60),
      status: ReservationStatus.FULFILLED,
      createdBy: centralLib2.id,
    },
    {
      id: ID.reservation(5),
      branchId: branchEast.id,
      bookId: books[16].id, // Purple Hibiscus
      memberId: ID.member(18),
      queuePosition: 1,
      reservedAt: daysAgo(30),
      status: ReservationStatus.CANCELLED,
      createdBy: eastDesk2.id,
    },
  ];

  for (const res of reservations) {
    await prisma.reservation.upsert({
      where: { id: res.id },
      update: {},
      create: res,
    });
  }

  console.log(`✅  ${reservations.length} reservations created`);

  // ── 9. BANS ──────────────────────────────────────────────────────────────────
  //  mem-019 (Central) — 2-month BRANCH ban
  //  mem-020 (East)    — 2-month BRANCH ban

  const banStart019 = daysAgo(10);
  const banEnd019 = new Date(banStart019);
  banEnd019.setMonth(banEnd019.getMonth() + 2);

  const banStart020 = daysAgo(5);
  const banEnd020 = new Date(banStart020);
  banEnd020.setMonth(banEnd020.getMonth() + 2);

  const bans = [
    {
      id: ID.ban(1),
      memberId: ID.member(19),
      branchId: branchCentral.id,
      type: BanType.BRANCH,
      reason:
        'Repeated failure to return books on time after multiple warnings. Member has accumulated significant outstanding fines and failed to respond to notices.',
      legalReference: 'Library Policy §4.2 — Persistent Non-Compliance',
      issuedAt: banStart019,
      issuedBy: centralAdmin.id,
      expiresAt: banEnd019,
    },
    {
      id: ID.ban(2),
      memberId: ID.member(20),
      branchId: branchEast.id,
      type: BanType.BRANCH,
      reason:
        'Member caused significant damage to library property including two books and a reading desk. Refused to pay for damages when contacted.',
      legalReference: 'Library Policy §5.1 — Wilful Damage to Property',
      issuedAt: banStart020,
      issuedBy: eastAdmin.id,
      expiresAt: banEnd020,
    },
  ];

  for (const ban of bans) {
    await prisma.ban.upsert({
      where: { id: ban.id },
      update: {},
      create: ban,
    });
  }

  // Update banned members' status
  await prisma.member.update({
    where: { id: ID.member(19) },
    data: { status: MemberStatus.BANNED },
  });
  await prisma.member.update({
    where: { id: ID.member(20) },
    data: { status: MemberStatus.BANNED },
  });

  console.log(
    '✅  2 members banned for 2 months (mem-019 Central, mem-020 East)',
  );

  // ── 10. AUDIT LOGS ───────────────────────────────────────────────────────────
  //  Sprinkle a realistic audit trail for key events over the year.

  type AuditLogSeed = {
    id: string;
    branchId: string | null;
    actorId: string;
    actorRole: Role;
    action: string;
    entityType: string;
    entityId: string;
    before?: Prisma.AuditLogUncheckedCreateInput['before'];
    after: NonNullable<Prisma.AuditLogUncheckedCreateInput['after']>;
    createdAt: Date;
  };

  const auditEntries: AuditLogSeed[] = [
    // Branch creation
    {
      id: ID.audit(1),
      branchId: null,
      actorId: superAdmin1.id,
      actorRole: Role.SUPER_ADMIN,
      action: 'CREATE',
      entityType: 'Branch',
      entityId: branchCentral.id,
      after: { name: branchCentral.name },
      createdAt: daysAgo(1825),
    },
    {
      id: ID.audit(2),
      branchId: null,
      actorId: superAdmin2.id,
      actorRole: Role.SUPER_ADMIN,
      action: 'CREATE',
      entityType: 'Branch',
      entityId: branchEast.id,
      after: { name: branchEast.name },
      createdAt: daysAgo(1825),
    },
    // Staff creation
    {
      id: ID.audit(3),
      branchId: branchCentral.id,
      actorId: superAdmin1.id,
      actorRole: Role.SUPER_ADMIN,
      action: 'CREATE',
      entityType: 'Staff',
      entityId: centralAdmin.id,
      after: { email: centralAdmin.email, role: Role.BRANCH_ADMIN },
      createdAt: daysAgo(1820),
    },
    {
      id: ID.audit(4),
      branchId: branchEast.id,
      actorId: superAdmin2.id,
      actorRole: Role.SUPER_ADMIN,
      action: 'CREATE',
      entityType: 'Staff',
      entityId: eastAdmin.id,
      after: { email: eastAdmin.email, role: Role.BRANCH_ADMIN },
      createdAt: daysAgo(1820),
    },
    // Member registrations
    {
      id: ID.audit(5),
      branchId: branchCentral.id,
      actorId: centralDesk.id,
      actorRole: Role.DESK_STAFF,
      action: 'CREATE',
      entityType: 'Member',
      entityId: ID.member(1),
      after: { cardNumber: 'ALM-C-000001' },
      createdAt: daysAgo(1810),
    },
    {
      id: ID.audit(6),
      branchId: branchEast.id,
      actorId: eastDesk1.id,
      actorRole: Role.DESK_STAFF,
      action: 'CREATE',
      entityType: 'Member',
      entityId: ID.member(11),
      after: { cardNumber: 'ALM-E-000001' },
      createdAt: daysAgo(1810),
    },
    // Loan events
    {
      id: ID.audit(7),
      branchId: branchCentral.id,
      actorId: centralDesk.id,
      actorRole: Role.DESK_STAFF,
      action: 'CHECKOUT',
      entityType: 'Loan',
      entityId: loanSeeds[0].id,
      after: { copyId: loanSeeds[0].copyId, memberId: loanSeeds[0].memberId },
      createdAt: daysAgo(1800),
    },
    {
      id: ID.audit(8),
      branchId: branchCentral.id,
      actorId: centralDesk.id,
      actorRole: Role.DESK_STAFF,
      action: 'RETURN',
      entityType: 'Loan',
      entityId: loanSeeds[0].id,
      after: { returnedAt: loanSeeds[0].returnedAt },
      createdAt: daysAgo(340 - 14),
    },
    // Fine issued and paid
    {
      id: ID.audit(9),
      branchId: branchCentral.id,
      actorId: centralDesk.id,
      actorRole: Role.DESK_STAFF,
      action: 'ISSUE_FINE',
      entityType: 'Fine',
      entityId: ID.fine(1),
      after: { amount: 5.5, memberId: ID.member(1) },
      createdAt: daysAgo(1630 - 25 + 11),
    },
    {
      id: ID.audit(10),
      branchId: branchCentral.id,
      actorId: centralDesk.id,
      actorRole: Role.DESK_STAFF,
      action: 'PAY_FINE',
      entityType: 'Fine',
      entityId: ID.fine(1),
      before: { status: FineStatus.OUTSTANDING },
      after: { status: FineStatus.PAID, amountPaid: 5.5 },
      createdAt: daysAgo(1630 - 25 + 13),
    },
    // Ban events
    {
      id: ID.audit(11),
      branchId: branchCentral.id,
      actorId: centralAdmin.id,
      actorRole: Role.BRANCH_ADMIN,
      action: 'BAN_MEMBER',
      entityType: 'Ban',
      entityId: ID.ban(1),
      after: { memberId: ID.member(19), type: BanType.BRANCH },
      createdAt: banStart019,
    },
    {
      id: ID.audit(12),
      branchId: branchEast.id,
      actorId: eastAdmin.id,
      actorRole: Role.BRANCH_ADMIN,
      action: 'BAN_MEMBER',
      entityType: 'Ban',
      entityId: ID.ban(2),
      after: { memberId: ID.member(20), type: BanType.BRANCH },
      createdAt: banStart020,
    },
    // Book additions
    {
      id: ID.audit(13),
      branchId: branchCentral.id,
      actorId: centralAdmin.id,
      actorRole: Role.BRANCH_ADMIN,
      action: 'CREATE',
      entityType: 'Book',
      entityId: books[0].id,
      after: { title: books[0].title },
      createdAt: daysAgo(1820),
    },
    {
      id: ID.audit(14),
      branchId: branchEast.id,
      actorId: eastAdmin.id,
      actorRole: Role.BRANCH_ADMIN,
      action: 'CREATE',
      entityType: 'Book',
      entityId: books[10].id,
      after: { title: books[10].title },
      createdAt: daysAgo(1820),
    },
    // Reservation created
    {
      id: ID.audit(15),
      branchId: branchCentral.id,
      actorId: centralDesk.id,
      actorRole: Role.DESK_STAFF,
      action: 'CREATE',
      entityType: 'Reservation',
      entityId: ID.reservation(1),
      after: { memberId: ID.member(7), bookId: books[0].id },
      createdAt: daysAgo(5),
    },
  ];

  for (const entry of auditEntries) {
    await prisma.auditLog.upsert({
      where: { id: entry.id },
      update: {},
      create: {
        id: entry.id,
        branchId: entry.branchId ?? null,
        actorId: entry.actorId,
        actorRole: entry.actorRole,
        action: entry.action,
        entityType: entry.entityType,
        entityId: entry.entityId,
        before: entry.before,
        after: entry.after,
        ipAddress: `192.168.1.${rInt(10, 50)}`,
        createdAt: entry.createdAt,
      },
    });
  }

  console.log(`✅  ${auditEntries.length} audit log entries created`);

  // ── 11. Summary ─────────────────────────────────────────────────────────────
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║           ANUM LIBRARY SEED COMPLETE 🎉              ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log('║  Branches  : 2  (Central – Accra, East – Tema)      ║');
  console.log('║  Staff     : 11 (2 super-admins + 9 branch staff)   ║');
  console.log('║  Books     : 22 (12 Central, 10 East)               ║');
  console.log(
    `║  Copies    : ${allCopies.length}  (incl. damaged/withdrawn)          ║`,
  );
  console.log('║  Members   : 22 (20 active, 2 banned for 2 months)  ║');
  console.log(
    `║  Loans     : ${loanSeeds.length}  (${activeLoansData.length} active, ${historicalLoans.length} returned)          ║`,
  );
  console.log('║  Fines     : 5  (1 paid by mem-001 / Esi Koomson)   ║');
  console.log('║  Reservations: 5                                     ║');
  console.log('║  Audit logs: 15                                      ║');
  console.log('╠══════════════════════════════════════════════════════╣');
  console.log('║  Super-admin password : SuperAdmin@1234              ║');
  console.log('║  All staff password   : Staff@1234                   ║');
  console.log('╚══════════════════════════════════════════════════════╝');
}

main()
  .catch((e) => {
    console.error('❌  Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
