from django.shortcuts import render
from django.db.models import *
from django.db import transaction
from crud_escolar_api.serializers import *
from crud_escolar_api.models import *
from rest_framework.permissions import AllowAny  # ⬅️ agrega esto arriba si no está
from rest_framework.authentication import BasicAuthentication, SessionAuthentication, TokenAuthentication
from rest_framework.generics import CreateAPIView, DestroyAPIView, UpdateAPIView
from rest_framework import permissions
from rest_framework import generics
from rest_framework import status
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.reverse import reverse
from rest_framework import viewsets
from django.shortcuts import get_object_or_404
from django.core import serializers
from django.utils.html import strip_tags
from django.contrib.auth import authenticate, login
from django.contrib.auth.models import Group
from django.contrib.auth import get_user_model
from django_filters.rest_framework import DjangoFilterBackend
from django_filters import rest_framework as filters
from datetime import datetime
from django.conf import settings
from django.template.loader import render_to_string
import string
import random

class CustomAuthToken(ObtainAuthToken):
    permission_classes = [AllowAny]  # ✅ esta es la línea clave
    authentication_classes = []  # <--- importante para permitir el login


    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data,
                                           context={'request': request})

        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        if user.is_active:
            roles = user.groups.all()
            role_names = [role.name for role in roles]
            role_names = role_names[0]  # 👈 tomamos el primer rol

            token, created = Token.objects.get_or_create(user=user)

            if role_names == 'Alumno':
                alumno = Alumnos.objects.filter(user=user).first()
                alumno = AlumnoSerializer(alumno).data
                alumno["token"] = token.key
                alumno["rol"] = "alumno"
                return Response(alumno, 200)

            if role_names == 'Maestro':
                maestro = Maestros.objects.filter(user=user).first()
                maestro = MaestroSerializer(maestro).data
                maestro["token"] = token.key
                maestro["rol"] = "maestro"
                return Response(maestro, 200)

            if role_names == 'administrador':
                user_data = UserSerializer(user, many=False).data
                user_data['token'] = token.key
                user_data["rol"] = "administrador"
                return Response(user_data, 200)

            return Response({"details": "Forbidden"}, 403)

        return Response({}, status=status.HTTP_403_FORBIDDEN)

class Logout(generics.GenericAPIView):

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):

        print("logout")
        user = request.user
        print(str(user))
        if user.is_active:
            token = Token.objects.get(user=user)
            token.delete()

            return Response({'logout':True})


        return Response({'logout': False})
