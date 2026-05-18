import type { Request, Response } from 'express';
import * as reservationsService from '../services/reservations.service.js';
import { createReservationSchema } from '../validators/reservations.validator.js';
import logger from '../../shared/logger.js';

export const listReservationsByBook = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { bookId } = req.params;
    const branchId = (req as any).staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const reservations = await reservationsService.getReservationsByBook(
      bookId,
      branchId,
    );
    res.status(200).json({ data: reservations });
  } catch (error) {
    logger.error('Error listing reservations', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const listReservationsByMember = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { memberId } = req.params;
    const branchId = (req as any).staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const reservations = await reservationsService.getReservationsByMember(
      memberId,
      branchId,
    );
    res.status(200).json({ data: reservations });
  } catch (error) {
    logger.error('Error listing member reservations', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const createReservation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const result = createReservationSchema.safeParse(req.body);
  if (!result.success) {
    res.status(422).json({
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: result.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const branchId = (req as any).staff?.branchId;
    const staffId = (req as any).staff?.staffId;

    if (!branchId || !staffId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    const reservation = await reservationsService.createReservation(
      result.data,
      branchId,
      staffId,
    );
    res.status(201).json({ data: reservation });
  } catch (error) {
    if (error instanceof Error && error.message === 'BOOK_NOT_FOUND') {
      res.status(404).json({ error: 'Book not found', code: 'BOOK_NOT_FOUND' });
      return;
    }
    if (error instanceof Error && error.message === 'MEMBER_NOT_FOUND') {
      res
        .status(404)
        .json({ error: 'Member not found', code: 'MEMBER_NOT_FOUND' });
      return;
    }
    logger.error('Error creating reservation', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const cancelReservation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { reservationId } = req.params;
    const branchId = (req as any).staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    await reservationsService.cancelReservation(reservationId, branchId);
    res.status(200).json({ message: 'Reservation cancelled' });
  } catch (error) {
    if (error instanceof Error && error.message === 'RESERVATION_NOT_FOUND') {
      res
        .status(404)
        .json({
          error: 'Reservation not found',
          code: 'RESERVATION_NOT_FOUND',
        });
      return;
    }
    logger.error('Error cancelling reservation', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};

export const notifyReservation = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { reservationId } = req.params;
    const branchId = (req as any).staff?.branchId;

    if (!branchId) {
      res.status(403).json({ error: 'Forbidden', code: 'FORBIDDEN' });
      return;
    }

    await reservationsService.notifyReservation(reservationId, branchId);
    res.status(200).json({ message: 'Reservation marked as ready' });
  } catch (error) {
    if (error instanceof Error && error.message === 'RESERVATION_NOT_FOUND') {
      res
        .status(404)
        .json({
          error: 'Reservation not found',
          code: 'RESERVATION_NOT_FOUND',
        });
      return;
    }
    logger.error('Error notifying reservation', { error });
    res
      .status(500)
      .json({ error: 'Internal server error', code: 'INTERNAL_SERVER_ERROR' });
  }
};
