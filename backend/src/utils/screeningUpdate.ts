import { screening } from '../models/init-models';
import { successResponse, errorResponse } from '../interfaces/serviceResponse';

export async function isScreeningActive(screeningId: number) {
  try {
    // Fetch the screening by ID
    const screeningDetails = await screening.findByPk(screeningId);
    if (!screeningDetails) {
      return errorResponse('Screening not found', 'NOT_FOUND');
    }
    // Check if the screening is deleted prior to the screening date
    if (screeningDetails.screeningStatus === 'deleted') {
      return errorResponse('Screening is deleted', 'NOT_FOUND');
    }
    // Check if the screening is in the past
    const currentTime = new Date();
    if (
      screeningDetails.screeningStatus === 'active' &&
      screeningDetails.screeningDate < currentTime
    ) {
      // Update the screening status to 'ended'
      await screening.update({ screeningStatus: 'ended' }, { where: { screeningId } });
      return errorResponse('Screening has ended', 'SCREENING_EXPIRED');
    }
    return successResponse({
      success: true,
      message: 'Screening is active',
    });
  } catch (error) {
    console.error('Error checking and updating screening status:', error);
    return errorResponse('Internal server error', 'INTERNAL_SERVER_ERROR');
  }
}
