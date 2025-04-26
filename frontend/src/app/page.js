'use client'

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Title, Tooltip, Legend, annotationPlugin);

const categories = ['Corn', 'Wheat', 'Barley', 'Sunflower'];

export default function Home() {
  const [year, setYear] = useState(2026);
  const [category, setCategory] = useState('Corn');

  const [predictedLoss, setPredictedLoss] = useState('...');
  const [lossesIn2025, setLossesIn2025] = useState('...');
  const [neededInvestment, setNeededInvestment] = useState('...');

  useEffect(() => {
    setPredictedLoss(Math.floor(Math.random() * 1000) + 'M $');
    setLossesIn2025('500M $');
    setNeededInvestment('700M $');
  }, [year, category]);

  const generateData = (label) => {
    const startYear = 1995;
    const extraYears = 5; // Add 5 future years
    const years = Array.from({ length: (year + extraYears) - startYear + 1 }, (_, i) => startYear + i);
    const points = years.map((year, index) => ({
      x: year,
      y: index * 2 + Math.random() * 10
    }));
  
    return {
      datasets: [{
        label: label,
        data: points,
        parsing: false,
        borderColor: label.includes('continue') ? 'red' : 'lime',
        backgroundColor: 'transparent',
        pointRadius: 2,
        borderWidth: 2,
        tension: 0.4,
      }]
    }
  }
  
  
    
  const createChartOptions = (title) => ({
    responsive: true,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: title,
        color: 'white',
        font: {
          size: 20,
          weight: 'bold'
        },
        padding: { top: 10, bottom: 30 }
      },
      annotation: {
        annotations: {
          warStart: {
            type: 'line',
            xMin: 2022,
            xMax: 2022,
            borderColor: 'red',
            borderWidth: 3,
            borderDash: [6, 6],
            label: {
              display: true,
              enabled: true,
              content: ['War Start', '(2022)'], // <<< 2 lines of text
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              font: { size: 12, weight: 'bold' },
              yAdjust: -40, // move higher above line
              textAlign: 'center',
              position: 'start',
            }
          },
          currentYear: {
            type: 'line',
            xMin: 2025,
            xMax: 2025,
            borderColor: 'purple',
            borderWidth: 3,
            borderDash: [6, 6],
            label: {
              display: true,
              enabled: true,
              content: ['Current Year', '(2025)'],
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              font: { size: 12, weight: 'bold' },
              yAdjust: -40,
              textAlign: 'center',
              position: 'start',
            }
          },
          selectedYear: {
            type: 'line',
            xMin: year,
            xMax: year,
            borderColor: 'blue',
            borderWidth: 3,
            borderDash: [6, 6],
            label: {
              display: true,
              enabled: true,
              content: [`Selected Year`, `(${year})`],
              backgroundColor: 'rgba(0,0,0,0.7)',
              color: 'white',
              font: { size: 12, weight: 'bold' },
              yAdjust: -40,
              textAlign: 'center',
              position: 'start',
            }
          }
        }
      }      
    },
    scales: {
      x: {
        type: 'linear',
        min: 1995,
        max: year + 5, // <<< Allow X-axis to go until 5 years after selected year
        title: {
          display: true,
          text: 'Year',
          color: 'white',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        ticks: {
          color: 'white',
          stepSize: 1,
          precision: 0,
        },
        grid: { color: 'rgba(255,255,255,0.1)' }
      },      
      y: {
        title: {
          display: true,
          text: 'Million USD',
          color: 'white',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        ticks: { color: 'white' },
        grid: { color: 'rgba(255,255,255,0.1)' }
      }
    }    
  });
  

  return (
    <main>
      <header>Impact of the Full-Scale Invasion on Ukraine's Agricultural Sector</header>

      <div className="main">
        
        <aside>
          <h2>Filter Options</h2>
          <div className="mb-6">
            <label>Projection Year: {year}</label>
            <input
              type="range"
              min="2026"
              max="2075"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
            />
          </div>
          <div>
            <h3>Crop Categories</h3>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`category-button ${category === cat ? 'active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        <section className="section">
          <h1>Analysis for: {category}</h1>

          <div className="graphs">
            <div className="graph-container">
              <Line data={generateData('Projected Growth Without War')} options={createChartOptions('Projected Growth Without War')} />
            </div>
            <div className="graph-container">
              <Line data={generateData('Projected Growth With Ongoing Conflict')} options={createChartOptions('Projected Growth With Ongoing Conflict')} />
            </div>
          </div>

          <div className="data-boxes">
            <div className="data-box">
              Estimated Financial Loss in {year} ({category}): <strong>{predictedLoss}</strong>
            </div>
            <div className="data-box">
              Recorded Losses by End of 2025: <strong>{lossesIn2025}</strong>
            </div>
            <div className="data-box full-width">
              Estimated Investment Needed for Sector Recovery: <strong>{neededInvestment}</strong>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
