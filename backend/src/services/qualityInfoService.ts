import { quality } from '../models/init-models';
import type {
  QualityInfo,
  QualityInfoResponse,
  QualityInfoErrorResponse,
} from '../interfaces/qualityInfo';
import { Op } from 'sequelize';
import { logerror } from '../utils/logger';

// This service function retrieves quality information from the database and returns it in a structured format + error handling.
export async function getQualityInfo(): Promise<QualityInfoResponse | QualityInfoErrorResponse> {
  try {
    const qualityData = await quality.findAll({
      where: {
        qualityProjectionType: {
          [Op.ne]: '',
        },
      },
      attributes: ['qualityId', 'qualityProjectionType', 'qualityProjectionPrice'],
      order: [['qualityProjectionType', 'ASC']], // Optional: Order by projection type
    });

    if (!qualityData || qualityData.length === 0) {
      logerror('Quality information not found in the database.');
      return {
        success: false,
        error: {
          message: 'Quality information not found.',
          code: 'QUALITY_INFO_NOT_FOUND',
        },
      };
    }

    return {
      success: true,
      data: qualityData.map(q => q.toJSON()) as QualityInfo,
    };
  } catch (error) {
    logerror('Quality information service error:', error);
    return {
      success: false,
      error: {
        message: 'An error occurred while retrieving quality information.',
        code: 'QUALITY_INFO_SERVICE_ERROR',
      },
    };
  }
}

// This function retrieves a quality by its ID and returns it in a structured format + error handling.
export async function getQualityById(
  qualityId: number,
): Promise<QualityInfoResponse | QualityInfoErrorResponse> {
  try {
    const qualityData = await quality.findByPk(qualityId, {
      attributes: ['qualityId', 'qualityProjectionType', 'qualityProjectionPrice'],
    });

    if (!qualityData) {
      return {
        success: false,
        error: { message: 'Quality not found', code: 'NOT_FOUND' },
      };
    }

    return { success: true, data: [qualityData.toJSON()] as QualityInfoResponse['data'] };
  } catch (error) {
    logerror('Quality information service error:', error);
    return {
      success: false,
      error: {
        message: 'An error occurred while retrieving quality information.',
        code: 'QUALITY_INFO_SERVICE_ERROR',
      },
    };
  }
}
