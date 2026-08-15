from rest_framework import serializers

from django.contrib.auth.password_validation import validate_password

from .models import User, Role, Permission


class PermissionSerializer(serializers.ModelSerializer):

    class Meta:
        model = Permission
        fields = ['id', 'code', 'nom', 'description', 'date_ajout']
        read_only_fields = ['id', 'date_ajout']



class RoleSerializer(serializers.ModelSerializer):

    permissions = PermissionSerializer(many=True, read_only=True)

    permission_ids = serializers.PrimaryKeyRelatedField(
        queryset=Permission.objects.all(), source='permissions',
        many=True, write_only=True, required=False
    )

    class Meta:
        model = Role
        fields = ['id', 'nom', 'description', 'permissions', 'permission_ids', 'date_ajout']
        read_only_fields = ['id', 'date_ajout']



class UserSerializer(serializers.ModelSerializer):

    role_nom = serializers.CharField(source='role.nom', read_only=True)

    password = serializers.CharField(write_only=True, required=False, validators=[validate_password])

    class Meta:

        model = User
        fields = [
            'id', 'username', 'first_name', 'last_name', 'email', 'role', 'role_nom', 'photo_profil', 
            'password', 'is_active', 'date_joined'
        ]
        read_only_fields = ['id', 'date_joined']

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        return instance