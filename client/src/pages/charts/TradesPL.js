import { BarChart, Bar, Cell, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TradesPL = ({trades, margin}) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={trades} margin={margin} fontSize={12}>
                <YAxis tickCount={10} />
                <Tooltip />
                <Bar dataKey="profit_loss"> 
                    { trades.map((trade) => (
                        <Cell key={trade.id} fill={trade.profit_loss >= 0 ? '#0c9' : '#c22' }/>
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>

    )
}
export default TradesPL;