import { Component, OnInit } from '@angular/core';
import { AdministradoresService } from 'src/app/services/administradores.service';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { ChartConfiguration, ChartData } from 'chart.js';

@Component({
  selector: 'app-graficas-screen',
  templateUrl: './graficas-screen.component.html',
  styleUrls: ['./graficas-screen.component.scss']
})
export class GraficasScreenComponent implements OnInit {
  lineChartPlugins = [DatalabelsPlugin];
  barChartPlugins = [DatalabelsPlugin];
  pieChartPlugins = [DatalabelsPlugin];
  doughnutChartPlugins = [DatalabelsPlugin];

  public total_user: any = {};

  barChartOption: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Usuarios por rol (Barras)' }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  lineChartOption: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true },
      title: { display: true, text: 'Usuarios por rol (Línea)' }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1 }
      }
    }
  };

  pieChartOption: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: true, text: 'Distribución de usuarios (Pastel)' }
    }
  };

  doughnutChartOption: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'bottom' },
      title: { display: true, text: 'Distribución de usuarios (Dona)' }
    }
  };

  barChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: '',
        backgroundColor: ['#F88406', '#FCFF44', '#82D3FB']
      }
    ]
  };

  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: '',
        backgroundColor: ['#F88406', '#FCFF44', '#82D3FB']
      }
    ]
  };

  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Registro de usuarios',
        backgroundColor: ['#FCFF44', '#F1C8F2', '#31E731']
      }
    ]
  };

  doughnutChartData: ChartData<'doughnut'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Registro de usuarios',
        backgroundColor: ['#F88406', '#FCFF44', '#31E7E7']
      }
    ]
  };

  constructor(private administradoresService: AdministradoresService) {}

  ngOnInit(): void {
    this.obtenerTotalUsers();
  }

  public obtenerTotalUsers() {
    this.administradoresService.getTotalUsuarios().subscribe(
      (response) => {
        this.total_user = response;

        const { administradores, maestros, alumnos } = this.total_user;
        const data = [administradores, alumnos, maestros];
        const labels = ['Administradores', 'Alumnos', 'Maestros'];

        // Pie Chart
        this.pieChartData.labels = labels;
        this.pieChartData.datasets[0].data = data;
        this.pieChartData = { ...this.pieChartData };

        // Doughnut Chart
        this.doughnutChartData.labels = labels;
        this.doughnutChartData.datasets[0].data = data;
        this.doughnutChartData = { ...this.doughnutChartData };

        // Bar Chart
        this.barChartData.labels = labels;
        this.barChartData.datasets[0].data = data;
        this.barChartData.datasets[0].label = 'Total de usuarios por rol';
        this.barChartData = { ...this.barChartData };

        // Line Chart
        this.lineChartData.labels = labels;
        this.lineChartData.datasets[0].data = data;
        this.lineChartData.datasets[0].label = 'Total de usuarios por rol';
        this.lineChartData = { ...this.lineChartData };
      },
      (error) => {
        alert('Error al obtener el total de usuarios');
      }
    );
  }
}
