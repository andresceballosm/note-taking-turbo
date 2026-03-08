"""
Shared pytest fixtures for all tests.
"""
import pytest
from rest_framework.test import APIClient
from apps.users.models import User


@pytest.fixture
def api_client():
    """Return a Django REST Framework API client."""
    return APIClient()


@pytest.fixture
def user(db):
    """Create and return a regular user."""
    return User.objects.create_user(
        email='test@example.com',
        password='testpass123'
    )


@pytest.fixture
def another_user(db):
    """Create and return another user for testing isolation."""
    return User.objects.create_user(
        email='another@example.com',
        password='testpass123'
    )


@pytest.fixture
def auth_client(api_client, user):
    """Return an authenticated API client."""
    api_client.force_authenticate(user=user)
    return api_client


@pytest.fixture
def superuser(db):
    """Create and return a superuser."""
    return User.objects.create_superuser(
        email='admin@example.com',
        password='adminpass123'
    )
