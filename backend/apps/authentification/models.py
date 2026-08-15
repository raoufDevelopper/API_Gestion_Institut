from django.db import models

from django.contrib.auth.models import AbstractUser


class Permission(models.Model):

    code = models.CharField(max_length=100, unique=True)

    nom = models.CharField(max_length=100)

    date_ajout = models.DateTimeField(auto_now_add=True)

    description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['nom']

    def __str__(self):
        return self.nom



class Role(models.Model):

    nom = models.CharField(max_length=50, unique=True)

    permissions = models.ManyToManyField(Permission, related_name='roles', blank=True)

    date_ajout = models.DateTimeField(auto_now_add=True)

    description = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['nom']

    def __str__(self):
        return self.nom



class User(AbstractUser):

    email = models.EmailField(unique=True)

    role = models.ForeignKey(Role, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')

    photo_profil = models.ImageField(upload_to='profils/', null=True, blank=True)


    USERNAME_FIELD = "email"
    
    REQUIRED_FIELDS = ["username"]

    def __str__(self):
        return self.username