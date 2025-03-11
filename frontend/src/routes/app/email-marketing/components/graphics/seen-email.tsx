import {Pie} from 'react-chartjs-2'
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props{
    seen: number,
    notSeen: number
}

export default function SeenEmailMetrics({
    seen,
    notSeen
} : Props){

    const data = {
        labels: ["Vistos", "Não vistos"],
        datasets: [
            {
                label: 'Quantidade',
                data: [seen, notSeen],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <div className='w-6/12 text-center'>
            <h2>Métricas do email</h2>
            <Pie data={data} />
        </div>
    )
}