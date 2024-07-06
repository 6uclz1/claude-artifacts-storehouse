import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const CompoundInterestCalculator = () => {
  const [principal, setPrincipal] = useState(100);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(5);
  const [annualAddition, setAnnualAddition] = useState(0);
  const [data, setData] = useState([]);

  const calculateCompoundInterest = () => {
    const newData: any = [];
    let currentAmount = principal;
    let currentAmountNoInterest = principal;
    for (let i = 0; i <= years; i++) {
      newData.push({
        year: i,
        amount: Math.round(currentAmount * 10) / 10,
        amountNoInterest: Math.round(currentAmountNoInterest * 10) / 10
      });
      currentAmount = currentAmount * (1 + rate / 100) + annualAddition;
      currentAmountNoInterest += annualAddition;
    }
    setData(newData);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>複利計算シミュレーター</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 mb-4">
          <div className="flex items-center gap-2">
            <label htmlFor="principal" className="w-48">初期投資額 (万円):</label>
            <Input
              id="principal"
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="annualAddition" className="w-48">年間追加投資額 (万円):</label>
            <Input
              id="annualAddition"
              type="number"
              value={annualAddition}
              onChange={(e) => setAnnualAddition(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="years" className="w-48">運用期間 (年):</label>
            <Input
              id="years"
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="rate" className="w-48">年利率 (%):</label>
            <Input
              id="rate"
              type="number"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="w-full"
            />
          </div>
          <Button variant="secondary" onClick={calculateCompoundInterest}>計算</Button>
        </div>
        {data.length > 0 && (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: '年数', position: 'insideBottomRight', offset: -10 }} />
                <YAxis label={{ value: '金額 (万円)', angle: -90, position: 'insideLeft' }} />
                <Tooltip formatter={(value: any) => `${value.toFixed(1)}万円`} />
                <Legend />
                <Line type="monotone" dataKey="amount" name="複利運用" stroke="#8884d8" />
                <Line type="monotone" dataKey="amountNoInterest" name="金利0%" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CompoundInterestCalculator;