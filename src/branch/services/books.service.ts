import prisma from '../../shared/prisma.js';
import logger from '../../shared/logger.js';
import type {
  CreateBookInput,
  UpdateBookInput,
} from '../validators/books.validator.js';

export const getAllBooks = async (
  branchId: string,
  skip: number = 0,
  take: number = 20,
) => {
  const books = await prisma.book.findMany({
    where: { branchId, deletedAt: null },
    select: {
      id: true,
      isbn: true,
      title: true,
      authors: true,
      publisher: true,
      publishedYear: true,
      genre: true,
      language: true,
      createdAt: true,
    },
    skip,
    take,
    orderBy: { createdAt: 'desc' },
  });

  return books;
};

export const getBookById = async (bookId: string, branchId: string) => {
  const book = await prisma.book.findFirst({
    where: { id: bookId, branchId, deletedAt: null },
    include: {
      copies: {
        select: {
          id: true,
          barcode: true,
          status: true,
          condition: true,
          acquiredAt: true,
        },
      },
    },
  });

  if (!book) {
    throw new Error('BOOK_NOT_FOUND');
  }

  return book;
};

export const createBook = async (
  input: CreateBookInput,
  branchId: string,
  createdBy: string,
) => {
  const book = await prisma.book.create({
    data: {
      branchId,
      isbn: input.isbn,
      title: input.title,
      authors: input.authors,
      publisher: input.publisher,
      publishedYear: input.publishedYear,
      edition: input.edition,
      language: input.language || 'en',
      genre: input.genre,
      description: input.description,
      shelfLocation: input.shelfLocation,
      createdBy,
    },
    select: {
      id: true,
      isbn: true,
      title: true,
      authors: true,
      publisher: true,
      publishedYear: true,
      genre: true,
      language: true,
      createdAt: true,
    },
  });

  logger.info('Book created', { bookId: book.id, branchId });
  return book;
};

export const updateBook = async (
  bookId: string,
  branchId: string,
  input: UpdateBookInput,
) => {
  const book = await prisma.book.findFirst({
    where: { id: bookId, branchId, deletedAt: null },
  });

  if (!book) {
    throw new Error('BOOK_NOT_FOUND');
  }

  const updated = await prisma.book.update({
    where: { id: bookId },
    data: {
      title: input.title,
      authors: input.authors,
      publisher: input.publisher,
      publishedYear: input.publishedYear,
      edition: input.edition,
      language: input.language,
      genre: input.genre,
      description: input.description,
      shelfLocation: input.shelfLocation,
    },
    select: {
      id: true,
      isbn: true,
      title: true,
      authors: true,
      publisher: true,
      publishedYear: true,
      genre: true,
      createdAt: true,
    },
  });

  logger.info('Book updated', { bookId });
  return updated;
};

export const deleteBook = async (bookId: string, branchId: string) => {
  const book = await prisma.book.findFirst({
    where: { id: bookId, branchId, deletedAt: null },
  });

  if (!book) {
    throw new Error('BOOK_NOT_FOUND');
  }

  await prisma.book.update({
    where: { id: bookId },
    data: { deletedAt: new Date() },
  });

  logger.info('Book deleted', { bookId });
};
