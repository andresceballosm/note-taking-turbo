from rest_framework import serializers
from .models import Note


class NoteSerializer(serializers.ModelSerializer):
    """Serializer for Note model."""

    user_email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = Note
        fields = (
            'id',
            'user',
            'user_email',
            'title',
            'content',
            'category',
            'created_at',
            'updated_at'
        )
        read_only_fields = ('id', 'user', 'user_email', 'created_at', 'updated_at')
        extra_kwargs = {
            'title': {'required': False, 'allow_blank': True, 'allow_null': True},
            'content': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def validate_category(self, value):
        """Validate that category is one of the allowed choices."""
        allowed_categories = [choice[0] for choice in Note.CATEGORY_CHOICES]
        if value not in allowed_categories:
            raise serializers.ValidationError(
                f"Category must be one of: {', '.join(allowed_categories)}"
            )
        return value
