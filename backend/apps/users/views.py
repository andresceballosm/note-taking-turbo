from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import UserRegistrationSerializer, UserSerializer


class RegisterView(generics.CreateAPIView):
    """API endpoint for user registration."""

    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        """Create a new user and return user data."""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        user_serializer = UserSerializer(user)
        return Response(
            {
                'user': user_serializer.data,
                'message': 'User registered successfully. Please login to get your tokens.'
            },
            status=status.HTTP_201_CREATED
        )


class UserDetailView(generics.RetrieveAPIView):
    """API endpoint to retrieve authenticated user details."""

    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Return the authenticated user."""
        return self.request.user
