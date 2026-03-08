"""
Tests for Note model.
"""
import pytest
from django.utils import timezone
from apps.notes.models import Note
from tests.factories import UserFactory, NoteFactory


pytestmark = pytest.mark.django_db


class TestNoteModel:
    """Tests for Note model."""

    def test_note_creation_with_all_fields(self):
        """Test creating a note with all fields."""
        user = UserFactory()
        note = Note.objects.create(
            user=user,
            title='Test Note',
            content='This is test content',
            category='School'
        )

        assert note.title == 'Test Note'
        assert note.content == 'This is test content'
        assert note.category == 'School'
        assert note.user == user
        assert note.created_at is not None
        assert note.updated_at is not None

    def test_note_creation_with_factory(self):
        """Test creating a note with NoteFactory."""
        note = NoteFactory()

        assert note.title is not None
        assert note.content is not None
        assert note.category in ['Random Thoughts', 'School', 'Personal']
        assert note.user is not None

    def test_note_str_with_title(self):
        """Test __str__ returns title and user email when title is present."""
        user = UserFactory(email='user@example.com')
        note = NoteFactory(user=user, title='My Important Note')

        assert str(note) == 'My Important Note - user@example.com'

    def test_note_str_without_title(self):
        """Test __str__ returns 'Untitled Note' when title is empty."""
        user = UserFactory(email='user@example.com')
        note = NoteFactory(user=user, title='')

        assert str(note) == 'Untitled Note - user@example.com'

    def test_note_str_with_none_title(self):
        """Test __str__ returns 'Untitled Note' when title is None."""
        user = UserFactory(email='user@example.com')
        note = Note.objects.create(user=user, title=None, content='Content')

        assert str(note) == 'Untitled Note - user@example.com'

    def test_note_default_category(self):
        """Test that default category is 'Random Thoughts'."""
        user = UserFactory()
        note = Note.objects.create(user=user, title='Test', content='Content')

        assert note.category == 'Random Thoughts'

    def test_note_category_choices(self):
        """Test all valid category choices."""
        user = UserFactory()
        categories = ['Random Thoughts', 'School', 'Personal']

        for category in categories:
            note = Note.objects.create(
                user=user,
                title=f'Note for {category}',
                category=category
            )
            assert note.category == category

    def test_note_blank_title_and_content(self):
        """Test creating a note with blank title and content."""
        user = UserFactory()
        note = Note.objects.create(user=user, title='', content='')

        assert note.title == ''
        assert note.content == ''

    def test_note_ordering_by_created_at_descending(self):
        """Test that notes are ordered by created_at descending."""
        user = UserFactory()
        note1 = NoteFactory(user=user, title='First')
        note2 = NoteFactory(user=user, title='Second')
        note3 = NoteFactory(user=user, title='Third')

        notes = Note.objects.all()

        assert list(notes) == [note3, note2, note1]

    def test_note_cascade_delete_when_user_deleted(self):
        """Test that notes are deleted when associated user is deleted."""
        user = UserFactory()
        note1 = NoteFactory(user=user)
        note2 = NoteFactory(user=user)

        assert Note.objects.filter(user=user).count() == 2

        user.delete()

        assert Note.objects.filter(pk=note1.pk).exists() is False
        assert Note.objects.filter(pk=note2.pk).exists() is False

    def test_note_related_name_on_user(self):
        """Test accessing notes through user's related_name."""
        user = UserFactory()
        note1 = NoteFactory(user=user)
        note2 = NoteFactory(user=user)

        user_notes = user.notes.all()

        assert note1 in user_notes
        assert note2 in user_notes
        assert user_notes.count() == 2

    def test_note_updated_at_changes_on_save(self, mocker):
        """Test that updated_at changes when note is updated."""
        note = NoteFactory(title='Original Title')
        original_updated_at = note.updated_at

        # Mock timezone to ensure time difference
        future_time = original_updated_at + timezone.timedelta(seconds=5)
        mocker.patch('django.utils.timezone.now', return_value=future_time)

        note.title = 'Updated Title'
        note.save()

        assert note.updated_at > original_updated_at

    def test_multiple_users_can_have_notes(self):
        """Test that different users can have their own notes."""
        user1 = UserFactory()
        user2 = UserFactory()

        note1 = NoteFactory(user=user1, title='User 1 Note')
        note2 = NoteFactory(user=user2, title='User 2 Note')

        assert user1.notes.count() == 1
        assert user2.notes.count() == 1
        assert note1 in user1.notes.all()
        assert note2 in user2.notes.all()
        assert note1 not in user2.notes.all()

    def test_note_verbose_names(self):
        """Test model verbose names."""
        assert Note._meta.verbose_name == 'note'
        assert Note._meta.verbose_name_plural == 'notes'
