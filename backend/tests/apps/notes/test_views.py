"""
Tests for Note ViewSet.
"""
import pytest
from django.urls import reverse
from rest_framework import status
from apps.notes.models import Note
from tests.factories import UserFactory, NoteFactory


pytestmark = pytest.mark.django_db


class TestNoteViewSetAuthentication:
    """Tests for NoteViewSet authentication requirements."""

    def test_unauthenticated_user_cannot_list_notes(self, api_client):
        """Test that unauthenticated users cannot list notes."""
        url = reverse('notes:note-list')
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_user_cannot_create_note(self, api_client):
        """Test that unauthenticated users cannot create notes."""
        url = reverse('notes:note-list')
        data = {'title': 'Test', 'content': 'Content'}
        response = api_client.post(url, data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_user_cannot_retrieve_note(self, api_client):
        """Test that unauthenticated users cannot retrieve a note."""
        note = NoteFactory()
        url = reverse('notes:note-detail', kwargs={'pk': note.pk})
        response = api_client.get(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_user_cannot_update_note(self, api_client):
        """Test that unauthenticated users cannot update notes."""
        note = NoteFactory()
        url = reverse('notes:note-detail', kwargs={'pk': note.pk})
        data = {'title': 'Updated'}
        response = api_client.patch(url, data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_unauthenticated_user_cannot_delete_note(self, api_client):
        """Test that unauthenticated users cannot delete notes."""
        note = NoteFactory()
        url = reverse('notes:note-detail', kwargs={'pk': note.pk})
        response = api_client.delete(url)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestNoteViewSetList:
    """Tests for listing notes."""

    def test_authenticated_user_can_list_notes(self, auth_client, user):
        """Test authenticated user can list their notes."""
        NoteFactory(user=user, title='My Note 1')
        NoteFactory(user=user, title='My Note 2')

        url = reverse('notes:note-list')
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2

    def test_user_only_sees_own_notes(self, auth_client, user, another_user):
        """Test users can only see their own notes."""
        my_note = NoteFactory(user=user, title='My Note')
        other_note = NoteFactory(user=another_user, title='Other Note')

        url = reverse('notes:note-list')
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        results = response.data['results']
        assert len(results) == 1
        assert results[0]['id'] == my_note.id
        assert results[0]['title'] == 'My Note'

    def test_list_empty_notes_for_new_user(self, auth_client):
        """Test that new user has empty notes list."""
        url = reverse('notes:note-list')
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 0

    def test_list_notes_ordering(self, auth_client, user):
        """Test notes are ordered by created_at descending."""
        note1 = NoteFactory(user=user, title='First')
        note2 = NoteFactory(user=user, title='Second')
        note3 = NoteFactory(user=user, title='Third')

        url = reverse('notes:note-list')
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        results = response.data['results']
        assert results[0]['id'] == note3.id
        assert results[1]['id'] == note2.id
        assert results[2]['id'] == note1.id


class TestNoteViewSetCreate:
    """Tests for creating notes."""

    def test_create_note_with_all_fields(self, auth_client, user):
        """Test creating a note with all fields."""
        url = reverse('notes:note-list')
        data = {
            'title': 'My New Note',
            'content': 'This is the content',
            'category': 'School'
        }
        response = auth_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == 'My New Note'
        assert response.data['content'] == 'This is the content'
        assert response.data['category'] == 'School'
        assert response.data['user'] == user.id
        assert response.data['user_email'] == user.email

        # Verify in database
        assert Note.objects.filter(user=user, title='My New Note').exists()

    def test_create_note_with_minimal_fields(self, auth_client, user):
        """Test creating a note with only required fields."""
        url = reverse('notes:note-list')
        data = {}
        response = auth_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
        assert Note.objects.filter(user=user).count() == 1

    def test_create_note_sets_user_automatically(self, auth_client, user):
        """Test that user is set automatically from request.user."""
        url = reverse('notes:note-list')
        data = {'title': 'Test Note'}
        response = auth_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
        created_note = Note.objects.get(pk=response.data['id'])
        assert created_note.user == user

    def test_create_note_with_invalid_category(self, auth_client):
        """Test creating a note with invalid category fails."""
        url = reverse('notes:note-list')
        data = {
            'title': 'Test',
            'category': 'InvalidCategory'
        }
        response = auth_client.post(url, data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'category' in response.data

    @pytest.mark.parametrize('category', ['Random Thoughts', 'School', 'Personal'])
    def test_create_note_with_valid_categories(self, auth_client, user, category):
        """Test creating notes with all valid category choices."""
        url = reverse('notes:note-list')
        data = {'title': 'Test', 'category': category}
        response = auth_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['category'] == category

    def test_create_note_with_empty_title_and_content(self, auth_client, user):
        """Test creating a note with empty title and content is allowed."""
        url = reverse('notes:note-list')
        data = {'title': '', 'content': ''}
        response = auth_client.post(url, data)

        assert response.status_code == status.HTTP_201_CREATED
        assert response.data['title'] == ''
        assert response.data['content'] == ''


class TestNoteViewSetRetrieve:
    """Tests for retrieving individual notes."""

    def test_retrieve_own_note(self, auth_client, user):
        """Test user can retrieve their own note."""
        note = NoteFactory(user=user, title='My Note')
        url = reverse('notes:note-detail', kwargs={'pk': note.pk})
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert response.data['id'] == note.id
        assert response.data['title'] == 'My Note'

    def test_cannot_retrieve_other_users_note(self, auth_client, another_user):
        """Test user cannot retrieve another user's note."""
        other_note = NoteFactory(user=another_user, title='Other Note')
        url = reverse('notes:note-detail', kwargs={'pk': other_note.pk})
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_retrieve_nonexistent_note(self, auth_client):
        """Test retrieving a nonexistent note returns 404."""
        url = reverse('notes:note-detail', kwargs={'pk': 99999})
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestNoteViewSetUpdate:
    """Tests for updating notes."""

    def test_update_own_note_with_patch(self, auth_client, user):
        """Test user can partially update their own note."""
        note = NoteFactory(user=user, title='Original', content='Original content')
        url = reverse('notes:note-detail', kwargs={'pk': note.pk})
        data = {'title': 'Updated Title'}
        response = auth_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'Updated Title'
        assert response.data['content'] == 'Original content'

        note.refresh_from_db()
        assert note.title == 'Updated Title'

    def test_update_own_note_with_put(self, auth_client, user):
        """Test user can fully update their own note."""
        note = NoteFactory(user=user, title='Original')
        url = reverse('notes:note-detail', kwargs={'pk': note.pk})
        data = {
            'title': 'New Title',
            'content': 'New content',
            'category': 'Personal'
        }
        response = auth_client.put(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['title'] == 'New Title'
        assert response.data['content'] == 'New content'
        assert response.data['category'] == 'Personal'

    def test_cannot_update_other_users_note(self, auth_client, another_user):
        """Test user cannot update another user's note."""
        other_note = NoteFactory(user=another_user, title='Other Note')
        url = reverse('notes:note-detail', kwargs={'pk': other_note.pk})
        data = {'title': 'Hacked'}
        response = auth_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_404_NOT_FOUND

        other_note.refresh_from_db()
        assert other_note.title == 'Other Note'

    def test_update_note_category(self, auth_client, user):
        """Test updating note category."""
        note = NoteFactory(user=user, category='Random Thoughts')
        url = reverse('notes:note-detail', kwargs={'pk': note.pk})
        data = {'category': 'School'}
        response = auth_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_200_OK
        assert response.data['category'] == 'School'

    def test_update_with_invalid_category(self, auth_client, user):
        """Test updating with invalid category fails."""
        note = NoteFactory(user=user)
        url = reverse('notes:note-detail', kwargs={'pk': note.pk})
        data = {'category': 'Invalid'}
        response = auth_client.patch(url, data, format='json')

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert 'category' in response.data


class TestNoteViewSetDelete:
    """Tests for deleting notes."""

    def test_delete_own_note(self, auth_client, user):
        """Test user can delete their own note."""
        note = NoteFactory(user=user)
        url = reverse('notes:note-detail', kwargs={'pk': note.pk})
        response = auth_client.delete(url)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert Note.objects.filter(pk=note.pk).exists() is False

    def test_cannot_delete_other_users_note(self, auth_client, user, another_user):
        """Test user cannot delete another user's note."""
        other_note = NoteFactory(user=another_user)
        url = reverse('notes:note-detail', kwargs={'pk': other_note.pk})
        response = auth_client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert Note.objects.filter(pk=other_note.pk).exists() is True

    def test_delete_nonexistent_note(self, auth_client):
        """Test deleting nonexistent note returns 404."""
        url = reverse('notes:note-detail', kwargs={'pk': 99999})
        response = auth_client.delete(url)

        assert response.status_code == status.HTTP_404_NOT_FOUND


class TestNoteViewSetFiltering:
    """Tests for search and filtering functionality."""

    def test_search_notes_by_title(self, auth_client, user):
        """Test searching notes by title."""
        NoteFactory(user=user, title='Python Tutorial')
        NoteFactory(user=user, title='Django Guide')
        NoteFactory(user=user, title='Python Tips')

        url = reverse('notes:note-list')
        response = auth_client.get(url, {'search': 'Python'})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 2

    def test_search_notes_by_content(self, auth_client, user):
        """Test searching notes by content."""
        NoteFactory(user=user, content='Learn Django REST framework')
        NoteFactory(user=user, content='Learn React')

        url = reverse('notes:note-list')
        response = auth_client.get(url, {'search': 'Django'})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_search_notes_by_category(self, auth_client, user):
        """Test searching notes by category."""
        NoteFactory(user=user, category='School', title='Math')
        NoteFactory(user=user, category='Personal', title='Diary')

        url = reverse('notes:note-list')
        response = auth_client.get(url, {'search': 'School'})

        assert response.status_code == status.HTTP_200_OK
        assert len(response.data['results']) == 1

    def test_ordering_by_created_at_ascending(self, auth_client, user):
        """Test ordering notes by created_at ascending."""
        note1 = NoteFactory(user=user, title='First')
        note2 = NoteFactory(user=user, title='Second')

        url = reverse('notes:note-list')
        response = auth_client.get(url, {'ordering': 'created_at'})

        assert response.status_code == status.HTTP_200_OK
        results = response.data['results']
        assert results[0]['id'] == note1.id
        assert results[1]['id'] == note2.id

    def test_ordering_by_title(self, auth_client, user):
        """Test ordering notes by title."""
        NoteFactory(user=user, title='Zebra')
        NoteFactory(user=user, title='Apple')
        NoteFactory(user=user, title='Mango')

        url = reverse('notes:note-list')
        response = auth_client.get(url, {'ordering': 'title'})

        assert response.status_code == status.HTTP_200_OK
        results = response.data['results']
        assert results[0]['title'] == 'Apple'
        assert results[1]['title'] == 'Mango'
        assert results[2]['title'] == 'Zebra'


class TestNoteViewSetEdgeCases:
    """Tests for edge cases and special scenarios."""

    def test_multiple_users_create_notes_independently(self, api_client):
        """Test that multiple users can create notes independently."""
        user1 = UserFactory()
        user2 = UserFactory()

        api_client.force_authenticate(user=user1)
        url = reverse('notes:note-list')
        api_client.post(url, {'title': 'User 1 Note'})

        api_client.force_authenticate(user=user2)
        api_client.post(url, {'title': 'User 2 Note'})

        assert Note.objects.filter(user=user1).count() == 1
        assert Note.objects.filter(user=user2).count() == 1

    def test_response_contains_user_email(self, auth_client, user):
        """Test that response includes user_email field."""
        note = NoteFactory(user=user)
        url = reverse('notes:note-detail', kwargs={'pk': note.pk})
        response = auth_client.get(url)

        assert response.status_code == status.HTTP_200_OK
        assert 'user_email' in response.data
        assert response.data['user_email'] == user.email

    def test_user_field_is_read_only(self, auth_client, user, another_user):
        """Test that user field cannot be modified in request."""
        url = reverse('notes:note-list')
        data = {
            'title': 'Test',
            'user': another_user.id  # Try to set different user
        }
        response = auth_client.post(url, data, format='json')

        assert response.status_code == status.HTTP_201_CREATED
        # User should be set from request, not from data
        assert response.data['user'] == user.id
