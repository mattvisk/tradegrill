import { LineChart, CartesianGrid, Line, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const RunningPL = ({tradesByDay, margin}) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tradesByDay} margin={margin} fontSize={12}>
                {/* <XAxis name="date" /> */}
                <CartesianGrid strokeDasharray="1" stroke="rgba(255,255,255,.15)" />
                <YAxis tickCount={8}/>
                <Tooltip />
                <Line dataKey="running_profit" stroke="#8884d8" dot={false} />
            </LineChart>
        </ResponsiveContainer>

    )
}
export default RunningPL;