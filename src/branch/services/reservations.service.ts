import prisma from '../../shared/prisma.js';
import logger from '../../shared/logger.js';
import type { CreateReservationInput } from '../validators/reservations.validator.js';

export const getReservationsByBook = async (
  bookId: string,
  branchId: string,
) => {
  const reservations = await prisma.reservation.findMany({
    where: { bookId, branchId, status: { in: ['PENDING', 'READY'] } },
    include: {
      member: {
        select: { id: true, firstName: true, lastName: true, cardNumber: true },
      },
    },
    orderBy: { reservedAt: 'asc' },
  });

  return reservations;
};

export const getReservationsByMember = async (
  memberId: string,
  branchId: string,
) => {
  const reservations = await prisma.reservation.findMany({
    where: { memberId, branchId },
    include: {
      book: { select: { id: true, title: true, isbn: true } },
    },
    orderBy: { reservedAt: 'desc' },
  });

  return reservations;
};

export const createReservation = async (
  input: CreateReservationInput,
  branchId: string,
  staffId: string,
) => {
  const book = await prisma.book.findFirst({
    where: { id: input.bookId, branchId },
  });

  if (!book) {
    throw new Error('BOOK_NOT_FOUND');
  }

  const member = await prisma.member.findFirst({
    where: { id: input.memberId, branchId },
  });

  if (!member) {
    throw new Error('MEMBER_NOT_FOUND');
  }

  const nextPosition = await prisma.reservation.count({
    where: { bookId: input.bookId, status: 'PENDING' },
  });

  const reservation = await prisma.reservation.create({
    data: {
      branchId,
      bookId: input.bookId,
      memberId: input.memberId,
      queuePosition: nextPosition + 1,
      createdBy: staffId,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    include: {
      book: { select: { title: true } },
      member: { select: { cardNumber: true } },
    },
  });

  logger.info('Reservation created', { reservationId: reservation.id });
  return reservation;
};

export const cancelReservation = async (
  reservationId: string,
  branchId: string,
) => {
  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, branchId },
  });

  if (!reservation) {
    throw new Error('RESERVATION_NOT_FOUND');
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: 'CANCELLED' },
  });

  logger.info('Reservation cancelled', { reservationId });
};

export const notifyReservation = async (
  reservationId: string,
  branchId: string,
) => {
  const reservation = await prisma.reservation.findFirst({
    where: { id: reservationId, branchId },
  });

  if (!reservation) {
    throw new Error('RESERVATION_NOT_FOUND');
  }

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { status: 'READY', notifiedAt: new Date() },
  });

  logger.info('Reservation marked ready', { reservationId });
};
