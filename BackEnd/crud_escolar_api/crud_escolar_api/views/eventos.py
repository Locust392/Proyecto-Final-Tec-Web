from django.shortcuts import render
from django.db.models import *
from django.db import transaction
from crud_escolar_api.serializers import *
from crud_escolar_api.models import *
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
import json


class EventosAcademicosView(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        eventos = EventoAcademico.objects.all().order_by('-creado_en')
        data = EventoSerializer(eventos, many=True).data  # 👈 usa EventoSerializer aquí
        return Response(data, 200)

    def post(self, request, *args, **kwargs):
        serializer = EventoAcademicoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"evento_id": serializer.data["id"]}, 201)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EventosViewEdit(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def put(self, request, *args, **kwargs):
        try:
            evento_id = request.data.get('id')  # 👈 ID enviado desde Angular
            evento = get_object_or_404(EventoAcademico, id=evento_id)

            evento.nombre = request.data.get('nombre', evento.nombre)
            evento.tipo = request.data.get('tipo', evento.tipo)
            evento.fecha = request.data.get('fecha', evento.fecha)
            evento.hora_inicio = request.data.get('hora_inicio', evento.hora_inicio)
            evento.hora_fin = request.data.get('hora_fin', evento.hora_fin)
            evento.lugar = request.data.get('lugar', evento.lugar)
            evento.publico = request.data.get('publico', evento.publico)
            evento.programa = request.data.get('programa', evento.programa)
            evento.responsable_id = request.data.get('responsable', evento.responsable_id)
            evento.descripcion = request.data.get('descripcion', evento.descripcion)
            evento.cupo = request.data.get('cupo', evento.cupo)

            evento.save()

            return Response({"message": "Evento actualizado correctamente."}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def delete(self, request, *args, **kwargs):
        evento_id = request.GET.get("id")
        if not evento_id:
            return Response({"details": "ID no proporcionado"}, status=400)

        evento = get_object_or_404(EventoAcademico, id=evento_id)
        try:
            evento.delete()
            return Response({"details": "Evento eliminado"}, status=200)
        except Exception:
            return Response({"details": "Error al eliminar el evento"}, status=400)
