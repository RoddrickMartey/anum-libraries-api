import prisma from '../../shared/prisma.js';
import logger from '../../shared/logger.js';
import type {
  CreateCopyInput,
  UpdateCopyInput,
} from '../validators/copies.validator.js';

export const getCopiesByBook = async (bookId: string, branchId: string) => {
  const copies = await prisma.copy.findMany({
    where: { bookId, branchId },
    select: {
      id: true,
      barcode: true,
      status: true,
      condition: true,
      acquiredAt: true,
      withdrawnAt: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return copies;
};

export const getCopyById = async (copyId: string, branchId: string) => {
  const copy = await prisma.copy.findFirst({
    where: { id: copyId, branchId },
    include: {
      book: {
        select: { id: true, title: true, isbn: true },
      },
      loans: {
        select: {
          id: true,
          memberId: true,
          status: true,
          checkedOutAt: true,
          dueAt: true,
        },
        orderBy: { checkedOutAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!copy) {
    throw new Error('COPY_NOT_FOUND');
  }

  return copy;
};

export const createCopy = async (input: CreateCopyInput, branchId: string) => {
  const book = await prisma.book.findFirst({
    where: { id: input.bookId, branchId },
  });

  if (!book) {
    throw new Error('BOOK_NOT_FOUND');
  }

  const existingBarcode = await prisma.copy.findUnique({
    where: { barcode: input.barcode },
  });

  if (existingBarcode) {
    throw new Error('BARCODE_ALREADY_EXISTS');
  }

  const copy = await prisma.copy.create({
    data: {
      branchId,
      bookId: input.bookId,
      barcode: input.barcode,
      condition: input.condition,
      acquiredAt: input.acquiredAt || new Date(),
    },
    select: {
      id: true,
      barcode: true,
      status: true,
      condition: true,
      createdAt: true,
    },
  });

  logger.info('Copy created', { copyId: copy.id, branchId });
  return copy;
};

export const updateCopy = async (
  copyId: string,
  branchId: string,
  input: UpdateCopyInput,
) => {
  const copy = await prisma.copy.findFirst({
    where: { id: copyId, branchId },
  });

  if (!copy) {
    throw new Error('COPY_NOT_FOUND');
  }

  const updated = await prisma.copy.update({
    where: { id: copyId },
    data: {
      status: input.status,
      condition: input.condition,
    },
    select: {
      id: true,
      barcode: true,
      status: true,
      condition: true,
    },
  });

  logger.info('Copy updated', { copyId });
  return updated;
};
