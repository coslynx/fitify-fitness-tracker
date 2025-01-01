import React, { useEffect, useRef, useMemo } from 'react';
import { Chart, registerables } from 'chart.js';
import DOMPurify from 'dompurify';

Chart.register(...registerables);

interface ProgressChartProps {
    progressData: { date: string; value: number }[] | null;
}


const ProgressChart: React.FC<ProgressChartProps> = ({ progressData }) => {
    const chartRef = useRef<Chart | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);


     const chartData = useMemo(() => {
        if (!progressData || progressData.length === 0) {
            return { labels: [], dataPoints: [] };
        }
        try{
            const labels = progressData.map((item) => DOMPurify.sanitize(item.date));
            const dataPoints = progressData.map((item) => item.value);
             return { labels, dataPoints };
        } catch(error) {
            console.error("Error sanitizing or processing chart data: ", error);
             return { labels: [], dataPoints: [] };
        }


    }, [progressData]);


    useEffect(() => {
        if (!canvasRef.current) {
            console.error("Canvas element not found");
            return;
        }


        if (chartRef.current) {
             chartRef.current.destroy();
             chartRef.current = null;
          }
          if(chartData.labels.length === 0 || chartData.dataPoints.length === 0) {
               return;
          }



        try {
            const ctx = canvasRef.current.getContext('2d');
           if(!ctx) {
             console.error("Could not get 2D rendering context for canvas");
             return;
           }

            chartRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: chartData.labels,
                    datasets: [
                        {
                            label: 'Progress',
                            data: chartData.dataPoints,
                            fill: false,
                            borderColor: '#3490dc',
                            tension: 0.1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                     scales: {
                        y: {
                            beginAtZero: true
                        }
                    },
                },
            });
        } catch (error) {
            console.error('Error initializing chart:', error);
        }


        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
             }
        };
    }, [chartData]);

    if (!progressData || progressData.length === 0) {
        return <div className="text-center">No progress data available</div>;
    }

    return (
        <div className="p-4">
            <canvas id="progressChart" ref={canvasRef} aria-label="Progress Chart" role="img"  />
        </div>
    );
};

export default ProgressChart;

if (import.meta.vitest) {
  const { describe, it, expect } = import.meta.vitest;
    const { render, screen } = import('@testing-library/react');


    describe('ProgressChart Component', () => {
        it('should render the chart when progress data is available', () => {
            const sampleData = [
                { date: '2024-07-01', value: 10 },
                { date: '2024-07-02', value: 20 },
                { date: '2024-07-03', value: 15 },
            ];
            render(<ProgressChart progressData={sampleData} />);
            const canvasElement = screen.getByRole('img', { name: 'Progress Chart' }) as HTMLCanvasElement;
            expect(canvasElement).toBeInTheDocument();
             expect(canvasElement).toHaveAttribute('aria-label', 'Progress Chart');
               expect(canvasElement).toHaveAttribute('role', 'img');

        });


        it('should display "No progress data available" when progressData is null', () => {
             render(<ProgressChart progressData={null} />);
            expect(screen.getByText('No progress data available')).toBeInTheDocument();
        });


         it('should display "No progress data available" when progressData is an empty array', () => {
              render(<ProgressChart progressData={[]} />);
             expect(screen.getByText('No progress data available')).toBeInTheDocument();
        });

    });
}