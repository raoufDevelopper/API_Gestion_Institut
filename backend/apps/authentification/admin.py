from django.contrib import admin

from django.contrib.auth.admin import UserAdmin

from .models import User, Role, Permission


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'role', 'is_active', 'is_staff']
    fieldsets = UserAdmin.fieldsets + (
        ('Informations complémentaires', {'fields': ('role', 'photo_profil')}),
    )


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ['nom', 'date_ajout']
    filter_horizontal = ['permissions']


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ['code', 'nom', 'date_ajout']
    search_fields = ['code', 'nom']