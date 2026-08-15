from functools import wraps

from rest_framework.response import Response

from rest_framework import status


def permission_requise(code_permission):

    def decorator(view_func):

        @wraps(view_func)

        def wrapper(request, *args, **kwargs):

            if request.user.is_superuser:
                return view_func(request, *args, **kwargs)

            if not request.user.is_authenticated or not request.user.role:
                return Response({'detail': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)

            if not request.user.role.permissions.filter(code=code_permission).exists():
                return Response({'detail': 'Permission refusée.'}, status=status.HTTP_403_FORBIDDEN)

            return view_func(request, *args, **kwargs)

        return wrapper

    return decorator