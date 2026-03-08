from django.db import models
from django.conf import settings


class Note(models.Model):
    """Note model for note-taking with categories."""

    CATEGORY_CHOICES = [
        ('Random Thoughts', 'Random Thoughts'),
        ('School', 'School'),
        ('Personal', 'Personal'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notes'
    )
    title = models.CharField(max_length=255, blank=True, null=True, default='')
    content = models.TextField(blank=True, null=True, default='')
    category = models.CharField(
        max_length=50,
        choices=CATEGORY_CHOICES,
        default='Random Thoughts'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'note'
        verbose_name_plural = 'notes'

    def __str__(self):
        display_title = self.title or "Untitled Note"
        return f"{display_title} - {self.user.email}"
