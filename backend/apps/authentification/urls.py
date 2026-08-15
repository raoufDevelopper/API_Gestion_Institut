from django.urls import path

from rest_framework_simplejwt.views import TokenRefreshView

from . import views


 
urlpatterns = [
    path('login/', views.login_view, name='login'),

    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    path('me/', views.me_view, name='me'),

    path('register/', views.register_view, name='register'),

    path('utilisateurs/', views.liste_creer_utilisateurs, name='liste_utilisateurs'),

    path('utilisateurs/<int:pk>/', views.detail_utilisateur, name='detail_utilisateur'),

    path('roles/', views.liste_creer_roles, name='liste_roles'),

    path('roles/<int:pk>/', views.detail_role, name='detail_role'),

    path('permissions/', views.liste_creer_permissions, name='liste_permissions'),

    path('permissions/<int:pk>/', views.detail_permission, name='detail_permission'),
]