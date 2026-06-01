import type { Request, Response, NextFunction } from 'express';
import * as reservationsService from '../services/reservations.service.js';
import { createReservationSchema } from '../validators/reservations.validator.js';
import { AppError } from '../../shared/utils/appError.js';

export const listReservationsByBook = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { bookId } = req.params as { bookId: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const reservations = await reservationsService.getReservationsByBook(
      bookId,
      branchId,
    );
    res.status(200).json({ data: reservations });
  } catch (error) {
    next(error);
  }
};

export const listReservationsByMember = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { memberId } = req.params as { memberId: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const reservations = await reservationsService.getReservationsByMember(
      memberId,
      branchId,
    );
    res.status(200).json({ data: reservations });
  } catch (error) {
    next(error);
  }
};

export const createReservation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const result = createReservationSchema.safeParse(req.body);
    if (!result.success) {
      throw result.error;
    }

    const branchId = req.staff?.branchId;
    const staffId = req.staff?.id;

    if (!branchId || !staffId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    const reservation = await reservationsService.createReservation(
      result.data,
      branchId,
      staffId,
    );
    res.status(201).json({ data: reservation });
  } catch (error) {
    if (error instanceof Error && error.message === 'BOOK_NOT_FOUND') {
      return next(new AppError(404, 'BOOK_NOT_FOUND', 'Book not found'));
    }
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      return next(new AppError(404, 'MEMBER_NOT_FOUND', 'Member not found'));
    }
    next(error);
  }
};

export const cancelReservation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { reservationId } = req.params as { reservationId: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    await reservationsService.cancelReservation(reservationId, branchId);
    res.status(200).json({ message: 'Reservation cancelled' });
  } catch (error) {
    if (error instanceof Error && error.message === 'RESERVATION_NOT_FOUND') {
      return next(
        new AppError(404, 'RESERVATION_NOT_FOUND', 'Reservation not found'),
      );
    }
    next(error);
  }
};

export const notifyReservation = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { reservationId } = req.params as { reservationId: string };
    const branchId = req.staff?.branchId;

    if (!branchId) {
      throw new AppError(403, 'FORBIDDEN', 'Forbidden');
    }

    await reservationsService.notifyReservation(reservationId, branchId);
    res.status(200).json({ message: 'Reservation marked as ready' });
  } catch (error) {
    if (error instanceof Error && error.message === 'RESERVATION_NOT_FOUND') {
      return next(
        new AppError(404, 'RESERVATION_NOT_FOUND', 'Reservation not found'),
      );
    }
    next(error);
  }
};
