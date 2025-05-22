from rest_framework import serializers
from rest_framework.authtoken.models import Token
from crud_escolar_api.models import *

class UserSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.CharField(required=True)

    class Meta:
        model = User
        fields = ('id','first_name','last_name', 'email')

class AdminSerializer(serializers.ModelSerializer):
    user=UserSerializer(read_only=True)
    class Meta:
        model = Administradores
        fields = '__all__'

class AlumnoSerializer(serializers.ModelSerializer):
    user=UserSerializer(read_only=True)
    class Meta:
        model = Alumnos
        fields = "__all__"

class MaestroSerializer(serializers.ModelSerializer):
    user=UserSerializer(read_only=True)
    class Meta:
        model = Maestros
        fields = '__all__'


from .models import EventoAcademico

class EventoAcademicoSerializer(serializers.ModelSerializer):
    hora_inicio = serializers.TimeField(input_formats=['%H:%M', '%H:%M:%S'])
    hora_fin = serializers.TimeField(input_formats=['%H:%M', '%H:%M:%S'])

    class Meta:
        model = EventoAcademico
        fields = '__all__'


class EventoSerializer(serializers.ModelSerializer):
    responsable_nombre = serializers.SerializerMethodField()

    class Meta:
        model = EventoAcademico
        fields = '__all__'

    def get_responsable_nombre(self, obj):
        if obj.responsable:
            return f"{obj.responsable.first_name} {obj.responsable.last_name}"
        return ""
