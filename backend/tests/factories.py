"""
Factory Boy factories for creating test model instances.
"""
import factory
from factory.django import DjangoModelFactory
from apps.users.models import User
from apps.notes.models import Note


class UserFactory(DjangoModelFactory):
    """Factory for creating User instances."""

    class Meta:
        model = User
        skip_postgeneration_save = True

    email = factory.Sequence(lambda n: f'user{n}@example.com')
    first_name = factory.Faker('first_name')
    last_name = factory.Faker('last_name')
    is_active = True
    is_staff = False

    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        """Set password after user creation."""
        if not create:
            return

        password = extracted if extracted else 'testpass123'
        self.set_password(password)
        self.save()


class SuperUserFactory(UserFactory):
    """Factory for creating superuser instances."""

    is_staff = True
    is_superuser = True


class NoteFactory(DjangoModelFactory):
    """Factory for creating Note instances."""

    class Meta:
        model = Note

    user = factory.SubFactory(UserFactory)
    title = factory.Faker('sentence', nb_words=4)
    content = factory.Faker('paragraph', nb_sentences=3)
    category = factory.Iterator(['Random Thoughts', 'School', 'Personal'])
