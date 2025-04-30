from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import api_view
from .services import MLService
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django.core.cache import cache
from django.views.decorators.gzip import gzip_page
import logging
from .error_handling import PredictionError, DataLoadError, ValidationError

# Configure logging
logger = logging.getLogger(__name__)

# Create your views here.

@api_view(['GET'])
@gzip_page
def home(request):
    """API root endpoint with GZIP compression"""
    try:
        return Response({
            'status': 'ok',
            'message': 'Welcome to IPL Team Predictor API',
            'endpoints': {
                'predict': '/api/predict/',
            },
            'supported_teams': [
                'Gujarat Titans',
                'Kolkata Knight Riders',
                'Chennai Super Kings',
                'Mumbai Indians',
                'Delhi Capitals',
                'Punjab Kings',
                'Rajasthan Royals',
                'Royal Challengers Bangalore',
                'Sunrisers Hyderabad',
                'Lucknow Super Giants'
            ],
            'version': '1.0'
        })
    except Exception as e:
        logger.error(f"Error in home endpoint: {str(e)}", exc_info=True)
        raise

class PredictTeamView(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.ml_service = MLService()

    def validate_teams(self, team1, team2):
        """Validate team names and ensure they are different"""
        valid_teams = {
            'Gujarat Titans', 'Kolkata Knight Riders', 'Chennai Super Kings',
            'Mumbai Indians', 'Delhi Capitals', 'Punjab Kings',
            'Rajasthan Royals', 'Royal Challengers Bangalore',
            'Sunrisers Hyderabad', 'Lucknow Super Giants'
        }
        
        if team1 not in valid_teams:
            raise ValidationError(f"Invalid team1: {team1}")
        if team2 not in valid_teams:
            raise ValidationError(f"Invalid team2: {team2}")
        if team1 == team2:
            raise ValidationError("Team1 and Team2 cannot be the same")

    @method_decorator(cache_page(60 * 15))  # Cache for 15 minutes
    @method_decorator(gzip_page)  # Add GZIP compression
    def post(self, request):
        """
        Predict best 11 players for a match with enhanced error handling
        """
        try:
            # Input validation with detailed error messages
            required_fields = ['team1', 'team2', 'venue']
            if not all(field in request.data for field in required_fields):
                missing_fields = [field for field in required_fields if field not in request.data]
                raise ValidationError(
                    f"Missing required fields: {', '.join(missing_fields)}"
                )

            # Extract and validate data
            team1 = request.data['team1']
            team2 = request.data['team2']
            venue = request.data['venue']

            # Validate team names
            self.validate_teams(team1, team2)

            # Get predictions with timeout handling
            try:
                result = self.ml_service.predict_best_11(team1, team2, venue)
            except Exception as e:
                logger.error(f"Prediction error: {str(e)}", exc_info=True)
                raise PredictionError(
                    f"Failed to generate prediction: {str(e)}"
                )

            if result is None or 'error' in result:
                error_msg = result.get('error', 'Unknown error') if isinstance(result, dict) else 'Failed to generate predictions'
                raise PredictionError(error_msg)

            # Add response metadata
            result['api_version'] = '1.0'
            result['cache_status'] = 'hit' if 'Cache-Control' in self.request.headers else 'miss'
            
            return Response(result, status=status.HTTP_200_OK)

        except ValidationError as e:
            logger.warning(f"Validation error: {str(e)}")
            raise

        except PredictionError as e:
            logger.error(f"Prediction error: {str(e)}")
            raise

        except Exception as e:
            logger.error(f"Unexpected error in predict_team view: {str(e)}", exc_info=True)
            raise PredictionError(
                "An unexpected error occurred while processing your request"
            )
