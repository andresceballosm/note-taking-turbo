"""
Tests for User model and UserManager.
"""
import pytest
from django.db import IntegrityError
from apps.users.models import User
from tests.factories import UserFactory, SuperUserFactory


pytestmark = pytest.mark.django_db


class TestUserManager:
    """Tests for UserManager."""

    def test_create_user_with_email_and_password(self):
        """Test creating a user with email and password."""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123'
        )

        assert user.email == 'test@example.com'
        assert user.check_password('testpass123')
        assert user.is_active is True
        assert user.is_staff is False
        assert user.is_superuser is False

    def test_create_user_normalizes_email(self):
        """Test that email is normalized when creating a user."""
        user = User.objects.create_user(
            email='test@EXAMPLE.COM',
            password='testpass123'
        )

        assert user.email == 'test@example.com'

    def test_create_user_without_email_raises_error(self):
        """Test that creating a user without email raises ValueError."""
        with pytest.raises(ValueError, match='The Email field must be set'):
            User.objects.create_user(email='', password='testpass123')

    def test_create_user_with_extra_fields(self):
        """Test creating a user with extra fields like first_name and last_name."""
        user = User.objects.create_user(
            email='test@example.com',
            password='testpass123',
            first_name='John',
            last_name='Doe'
        )

        assert user.first_name == 'John'
        assert user.last_name == 'Doe'

    def test_create_superuser(self):
        """Test creating a superuser sets correct flags."""
        superuser = User.objects.create_superuser(
            email='admin@example.com',
            password='adminpass123'
        )

        assert superuser.email == 'admin@example.com'
        assert superuser.check_password('adminpass123')
        assert superuser.is_active is True
        assert superuser.is_staff is True
        assert superuser.is_superuser is True

    def test_create_superuser_with_is_staff_false_raises_error(self):
        """Test that creating superuser with is_staff=False raises ValueError."""
        with pytest.raises(ValueError, match='Superuser must have is_staff=True'):
            User.objects.create_superuser(
                email='admin@example.com',
                password='adminpass123',
                is_staff=False
            )

    def test_create_superuser_with_is_superuser_false_raises_error(self):
        """Test that creating superuser with is_superuser=False raises ValueError."""
        with pytest.raises(ValueError, match='Superuser must have is_superuser=True'):
            User.objects.create_superuser(
                email='admin@example.com',
                password='adminpass123',
                is_superuser=False
            )


class TestUserModel:
    """Tests for User model."""

    def test_user_str_returns_email(self):
        """Test that __str__ returns the user's email."""
        user = UserFactory(email='test@example.com')
        assert str(user) == 'test@example.com'

    def test_user_creation_with_factory(self):
        """Test creating a user with UserFactory."""
        user = UserFactory()

        assert user.email is not None
        assert '@example.com' in user.email
        assert user.first_name
        assert user.last_name
        assert user.is_active is True

    def test_email_uniqueness_constraint(self):
        """Test that email must be unique."""
        UserFactory(email='unique@example.com')

        with pytest.raises(IntegrityError):
            UserFactory(email='unique@example.com')

    def test_get_full_name_with_first_and_last_name(self):
        """Test get_full_name returns first and last name."""
        user = UserFactory(first_name='John', last_name='Doe')
        assert user.get_full_name() == 'John Doe'

    def test_get_full_name_with_only_first_name(self):
        """Test get_full_name with only first name."""
        user = UserFactory(first_name='John', last_name='')
        assert user.get_full_name() == 'John'

    def test_get_full_name_without_names_returns_email(self):
        """Test get_full_name returns email when no names are set."""
        user = UserFactory(first_name='', last_name='', email='test@example.com')
        assert user.get_full_name() == 'test@example.com'

    def test_get_short_name_returns_first_name(self):
        """Test get_short_name returns first name."""
        user = UserFactory(first_name='John')
        assert user.get_short_name() == 'John'

    def test_get_short_name_without_first_name_returns_email(self):
        """Test get_short_name returns email when first name is not set."""
        user = UserFactory(first_name='', email='test@example.com')
        assert user.get_short_name() == 'test@example.com'

    def test_password_is_hashed(self):
        """Test that password is hashed, not stored in plain text."""
        user = UserFactory()

        assert user.password != 'testpass123'
        assert user.check_password('testpass123')

    def test_superuser_factory(self):
        """Test creating a superuser with SuperUserFactory."""
        superuser = SuperUserFactory()

        assert superuser.is_staff is True
        assert superuser.is_superuser is True
        assert superuser.is_active is True

    def test_multiple_users_have_unique_emails(self):
        """Test that factory creates users with unique emails."""
        user1 = UserFactory()
        user2 = UserFactory()
        user3 = UserFactory()

        emails = {user1.email, user2.email, user3.email}
        assert len(emails) == 3
