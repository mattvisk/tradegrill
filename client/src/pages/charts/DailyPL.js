import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DailyPL = ({tradesByDay, margin}) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tradesByDay} margin={margin} fontSize={12}>
                <XAxis dataKey="symbol" />
                <YAxis/>
                <Tooltip />
                <Legend />
                <Bar name="Profit Loss" dataKey="profit_loss"> 
                    { tradesByDay.map((trade) => (
                        <Cell key={trade.id} fill={trade.profit_loss >= 0 ? '#0c9' : '#c22' }/>
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>

    )
}
export default DailyPL;