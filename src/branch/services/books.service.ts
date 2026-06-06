import prisma from '../../shared/prisma.js';
import logger from '../../shared/logger.js';
import type {
  CreateBookInput,
  UpdateBookInput,
} from '../validators/books.validator.js';
import { AppError } from '../../shared/utils/appError.js';
import { CloudinaryService } from './cloudinary.service.js';

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
      cover: {
        select: {
          url: true,
        },
      },
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
      cover: {
        select: {
          url: true,
        },
      },
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
  const existing = await prisma.book.findFirst({
    where: { isbn: input.isbn, branchId, deletedAt: null },
  });

  if (existing) {
    throw new AppError(
      409,
      'BOOK_ALREADY_EXISTS',
      'A book with the same ISBN already exists in this branch',
    );
  }

  let uploadedCover: { url: string; publicId: string } | null = null;
  if (input.base64image) {
    uploadedCover = await CloudinaryService.uploadCover(input.base64image);
  }

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
      ...(uploadedCover && {
        cover: {
          create: {
            url: uploadedCover.url,
            publicId: uploadedCover.publicId,
          },
        },
      }),
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
      cover: {
        select: {
          url: true,
        },
      },
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
    include: { cover: true },
  });

  if (!book) {
    throw new Error('BOOK_NOT_FOUND');
  }

  let uploadedCover: { url: string; publicId: string } | null = null;

  if (input.base64image) {
    // If an old cover image exists in Cloudinary, clear it out first
    if (book.cover?.publicId) {
      await CloudinaryService.deleteCover(book.cover.publicId);
    }
    uploadedCover = await CloudinaryService.uploadCover(input.base64image);
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
      ...(uploadedCover && {
        cover: {
          upsert: {
            create: {
              url: uploadedCover.url,
              publicId: uploadedCover.publicId,
            },
            update: {
              url: uploadedCover.url,
              publicId: uploadedCover.publicId,
            },
          },
        },
      }),
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
      cover: {
        select: {
          url: true,
        },
      },
    },
  });

  logger.info('Book updated', { bookId });
  return updated;
};

export const deleteBook = async (bookId: string, branchId: string) => {
  const book = await prisma.book.findFirst({
    where: { id: bookId, branchId, deletedAt: null },
    include: { cover: true },
  });

  if (!book) {
    throw new Error('BOOK_NOT_FOUND');
  }

  // Soft deleting the book but cleaning up the asset storage right away
  if (book.cover?.publicId) {
    await CloudinaryService.deleteCover(book.cover.publicId);

    // Explicitly delete the relation record since the parent book is only soft-deleted
    await prisma.bookCover.delete({
      where: { bookId },
    });
  }

  await prisma.book.update({
    where: { id: bookId },
    data: { deletedAt: new Date() },
  });

  logger.info('Book deleted', { bookId });
};
