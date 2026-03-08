from rest_framework import viewsets, permissions
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Note
from .serializers import NoteSerializer


class NoteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Note model providing CRUD operations.
    Users can only see and manage their own notes.
    """

    serializer_class = NoteSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ['title', 'content', 'category']
    ordering_fields = ['created_at', 'updated_at', 'title']
    ordering = ['-created_at']

    def get_queryset(self):
        """Return notes only for the authenticated user."""
        return Note.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        """Set the user to the authenticated user when creating a note."""
        serializer.save(user=self.request.user)
