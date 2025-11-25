import React, { useCallback, useEffect, useRef } from 'react';

const ChartRenderer = ({ data, labels, colors, title }) => {
    const chartRef = useRef(null);
    
    const renderChart = useCallback(() => {
        if (!chartRef.current || data.length === 0) return;
        const canvas = chartRef.current;
        const ctx = canvas.getContext('2d');
        
        // Responsive Scaling
        const container = canvas.parentElement;
        canvas.width = container.clientWidth;
        canvas.height = 300; 

        const margin = 30;
        const width = canvas.width - 2 * margin;
        const height = canvas.height - 2 * margin;
        const dataLength = data.length || 1;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = '12px Inter, sans-serif';

        // Find max value for scaling
        const allValues = data.map(d => Math.abs(d));
        const maxValue = Math.max(...allValues, 100); 
        const scale = height / maxValue;
        const zeroY = margin + height;
        
        // Draw X Axis (Zero Line)
        ctx.strokeStyle = '#E5E7EB'; 
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(margin, zeroY);
        ctx.lineTo(canvas.width - margin, zeroY);
        ctx.stroke();

        data.forEach((value, i) => {
            const barWidth = (width / dataLength) * 0.6;
            const gap = (width / dataLength) * 0.4;
            const startX = margin + gap / 2;
            
            const barHeight = Math.abs(value) * scale;
            const x = startX + i * (barWidth + gap);
            let y = zeroY - (value > 0 ? barHeight : 0);
            
            // Draw Bar
            ctx.fillStyle = colors[i % colors.length];
            ctx.fillRect(x, y, barWidth, barHeight);

            // Draw Label
            ctx.fillStyle = '#374151'; 
            ctx.textAlign = 'center';
            ctx.save();
            if (title === 'Daily Sales Performance') {
                ctx.translate(x + barWidth / 2, canvas.height - 10);
                ctx.rotate(-Math.PI / 4); 
                ctx.fillText(labels[i], 0, 0);
            } else {
                ctx.fillText(labels[i], x + barWidth / 2, canvas.height - 10);
            }
            ctx.restore();

            // Draw Value
            if (barHeight > 20) {
                 ctx.textAlign = 'center';
                 ctx.fillText(`₹${Math.round(value).toLocaleString('en-IN')}`, x + barWidth / 2, y - 5);
            }
        });

    }, [data, labels, colors, title]);

    useEffect(() => {
        // Redraw when data changes or component mounts
        renderChart();
    }, [renderChart]);

    useEffect(() => {
        // Redraw on window resize for responsiveness
        const handleResize = () => renderChart();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [renderChart]);

    return (
        <div className="bg-white p-4 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold mb-3 text-gray-700">{title}</h3>
            <div className='w-full overflow-x-auto'>
                <canvas ref={chartRef} width="400" height="300" className="min-w-[400px] h-[300px]"></canvas>
            </div>
        </div>
    );
};

export default ChartRenderer;