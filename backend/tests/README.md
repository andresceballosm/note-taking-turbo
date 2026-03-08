# Test Suite Documentation

This directory contains comprehensive unit tests for the note-taking application using pytest-django and Factory Boy.

## Test Structure

```
tests/
├── README.md                 # This file
├── conftest.py              # Shared fixtures for all tests
├── factories.py             # Factory Boy factories for models
└── apps/
    ├── users/
    │   └── test_models.py   # User model tests
    └── notes/
        ├── test_models.py   # Note model tests
        └── test_views.py    # NoteViewSet API tests
```

## Running Tests

### Run all tests
```bash
pytest
```

### Run with verbose output
```bash
pytest -v
```

### Run specific test file
```bash
pytest tests/apps/notes/test_models.py
```

### Run specific test class
```bash
pytest tests/apps/notes/test_views.py::TestNoteViewSetCreate
```

### Run specific test method
```bash
pytest tests/apps/notes/test_views.py::TestNoteViewSetCreate::test_create_note_with_all_fields
```

### Run with coverage report
```bash
pytest --cov=apps --cov-report=html
```

### Run last failed tests
```bash
pytest --lf
```

### Stop on first failure
```bash
pytest -x
```

### Run and stop on first failure of last failed tests
```bash
pytest -x --lf
```

## Test Coverage

Current coverage: **92%**

- User models: 100%
- Note models: 100%
- Note views: 100%
- Note serializers: 93%
- User views: 68% (authentication views not fully tested)
- User serializers: 75% (registration serializers not fully tested)

## Test Categories

### Model Tests (`test_models.py`)

Tests for Django models covering:
- Field validation and constraints
- Model methods (`__str__`, custom methods)
- Database relationships (ForeignKey, cascade deletes)
- Ordering and default values
- Manager methods (custom user creation)

### View Tests (`test_views.py`)

Tests for DRF ViewSets covering:
- Authentication and authorization
- CRUD operations (Create, Read, Update, Delete)
- Permissions and user isolation
- Search and filtering
- Ordering and pagination
- Edge cases and error handling

## Fixtures

Defined in `conftest.py`:

- `api_client`: DRF API client for making requests
- `user`: Regular test user
- `another_user`: Second user for testing isolation
- `auth_client`: Authenticated API client
- `superuser`: Admin user with elevated permissions

## Factories

Defined in `factories.py`:

- `UserFactory`: Creates test users with unique emails
- `SuperUserFactory`: Creates admin users
- `NoteFactory`: Creates test notes with realistic fake data

### Using Factories

```python
# Create a user
user = UserFactory()

# Create a user with specific email
user = UserFactory(email='specific@example.com')

# Create a note
note = NoteFactory()

# Create a note for specific user
note = NoteFactory(user=user, title='My Note')
```

## TDD Workflow

Follow the RED-GREEN-REFACTOR cycle:

1. **RED**: Write a failing test that describes desired behavior
2. **GREEN**: Write minimal code to make the test pass
3. **REFACTOR**: Clean up code while keeping tests green
4. **REPEAT**: Never write production code without a failing test

### Example TDD Flow

```python
# 1. RED - Write failing test
def test_note_can_be_archived(user):
    note = NoteFactory(user=user)
    note.archive()
    assert note.is_archived is True

# 2. GREEN - Implement minimal code
class Note(models.Model):
    is_archived = models.BooleanField(default=False)

    def archive(self):
        self.is_archived = True
        self.save()

# 3. REFACTOR - Improve while keeping tests green
# Add validation, optimize queries, etc.
```

## Best Practices

1. **Test Isolation**: Each test is independent and uses transactions that rollback
2. **Descriptive Names**: Test names clearly describe what they're testing
3. **Arrange-Act-Assert**: Tests follow AAA pattern for clarity
4. **Factory Boy**: Use factories instead of manual object creation
5. **Fixtures**: Share common setup via pytest fixtures
6. **Parametrize**: Use `@pytest.mark.parametrize` for testing multiple scenarios

## Common Patterns

### Testing Authentication

```python
def test_requires_authentication(api_client):
    url = reverse('notes:note-list')
    response = api_client.get(url)
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
```

### Testing User Isolation

```python
def test_user_cannot_access_others_data(auth_client, another_user):
    other_note = NoteFactory(user=another_user)
    url = reverse('notes:note-detail', kwargs={'pk': other_note.pk})
    response = auth_client.get(url)
    assert response.status_code == status.HTTP_404_NOT_FOUND
```

### Testing CRUD Operations

```python
def test_create_note(auth_client, user):
    url = reverse('notes:note-list')
    data = {'title': 'New Note', 'content': 'Content'}
    response = auth_client.post(url, data)

    assert response.status_code == status.HTTP_201_CREATED
    assert Note.objects.filter(user=user, title='New Note').exists()
```

### Parametrized Tests

```python
@pytest.mark.parametrize('category', ['Random Thoughts', 'School', 'Personal'])
def test_valid_categories(auth_client, category):
    data = {'category': category}
    response = auth_client.post(url, data)
    assert response.status_code == status.HTTP_201_CREATED
```

## Configuration

Test configuration is in `pytest.ini`:

- Django settings: `config.settings`
- Database reuse: `--reuse-db` (speeds up test runs)
- Coverage: Measures code coverage for `apps/` directory
- Markers: Custom test markers for slow/integration tests

## Troubleshooting

### Tests fail with "Database access not allowed"
- Add `@pytest.mark.django_db` to the test or class
- Or use `pytestmark = pytest.mark.django_db` at module level

### Import errors
- Ensure `__init__.py` files exist in test directories
- Check that Django settings are configured correctly

### Factory warnings
- Update factory Meta class with `skip_postgeneration_save = True`

### Slow tests
- Use `--reuse-db` to avoid recreating database
- Mark slow tests with `@pytest.mark.slow` and skip them during development

## Adding New Tests

When adding new features:

1. Write tests BEFORE implementing the feature (TDD)
2. Test both success and failure cases
3. Test edge cases and boundary conditions
4. Test authentication and authorization
5. Ensure user data isolation
6. Update factories if new models are added
7. Add fixtures for common test scenarios

## Resources

- [pytest documentation](https://docs.pytest.org/)
- [pytest-django documentation](https://pytest-django.readthedocs.io/)
- [Factory Boy documentation](https://factoryboy.readthedocs.io/)
- [Django REST Framework testing](https://www.django-rest-framework.org/api-guide/testing/)
