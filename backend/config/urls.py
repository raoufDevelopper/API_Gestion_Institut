
from django.contrib import admin

from django.urls import path, include

from django.conf import settings

from django.conf.urls.static import static



urlpatterns = [
    path('admin/', admin.site.urls),

    path('api/auth/', include('apps.authentification.urls')),

    path('api/utilisateurs/', include('apps.utilisateurs.urls')),

    path('api/academique/', include('apps.academique.urls')),

    path('api/notes/', include('apps.notes.urls')),

    path('api/finances/', include('apps.finances.urls')),

    path('api/documents/', include('apps.documents.urls')),

    path('api/bibliotheque/', include('apps.bibliotheque.urls')),

    path('api/parametres/', include('apps.parametres.urls')), 
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
