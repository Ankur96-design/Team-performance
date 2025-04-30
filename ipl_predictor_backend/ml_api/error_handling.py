from rest_framework.views import exception_handler
from rest_framework.exceptions import APIException
from rest_framework import status
from rest_framework.response import Response
import logging

logger = logging.getLogger(__name__)

class PredictionError(APIException):
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = 'Error generating prediction'
    default_code = 'prediction_error'

class DataLoadError(APIException):
    status_code = status.HTTP_503_SERVICE_UNAVAILABLE
    default_detail = 'Error loading required data'
    default_code = 'data_load_error'

class ValidationError(APIException):
    status_code = status.HTTP_400_BAD_REQUEST
    default_detail = 'Invalid input data'
    default_code = 'validation_error'

def custom_exception_handler(exc, context):
    """Custom exception handler for better error responses"""
    
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is None:
        # Unhandled exceptions
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
        return Response({
            'status': 'error',
            'error': 'Internal server error',
            'details': 'An unexpected error occurred',
            'code': 'internal_error'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Customize the response format
    if not isinstance(response.data, dict):
        response.data = {
            'status': 'error',
            'error': str(response.data),
            'code': getattr(exc, 'default_code', 'error')
        }
    else:
        response.data['status'] = 'error'
        if 'detail' in response.data:
            response.data['error'] = response.data.pop('detail')
        response.data['code'] = getattr(exc, 'default_code', 'error')

    # Add request information for debugging
    if 'request' in context:
        logger.error(
            f"API Error: {response.data.get('error')} - "
            f"URL: {context['request'].path} - "
            f"Method: {context['request'].method}",
            extra={
                'status_code': response.status_code,
                'view': context['view'].__class__.__name__
            }
        )

    return response 