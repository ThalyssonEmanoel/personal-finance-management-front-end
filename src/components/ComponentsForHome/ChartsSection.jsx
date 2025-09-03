'use client'

import React, { useMemo } from 'react';
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Progress } from "@/components/ui/progress";
import { useTransactionsQuery, useAccountsQuery } from '../../utils/apiClient';

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const processChartData = (transactions, type) => {
  const filteredTransactions = transactions.filter(t => t.type === type);

  if (filteredTransactions.length === 0) {
    return {
      data: [],
      totalTransactions: 0
    };
  }

  const categoryTotals = filteredTransactions.reduce((acc, curr) => {
    const categoryName = curr.category || 'Outros';
    const value = parseFloat(curr.value_installment || curr.value || 0); // VOU PUXAR A BIBLIOTECA DECIMAL AQUI NESSA 
    acc[categoryName] = (acc[categoryName] || 0) + value;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, valueA], [, valueB]) => valueB - valueA)
    .filter(([, value]) => value > 0); 

  const topCategories = sortedCategories.slice(0, 4);
  const otherCategories = sortedCategories.slice(4);

  const chartData = topCategories.map(([category, value], index) => ({
    category: category,
    value: value,
    fill: chartColors[index % chartColors.length], 
  }));

  if (otherCategories.length > 0) {
    const othersTotal = otherCategories.reduce((acc, [, value]) => acc + value, 0);
    chartData.push({
      category: 'Outros',
      value: othersTotal,
      fill: chartColors[chartData.length % chartColors.length],
    });
  }

  return {
    data: chartData,
    totalTransactions: filteredTransactions.length
  };
};

const getChartConfig = (data, type) => {
  if (!data || data.length === 0) {
    return {
      value: { label: "Valor" }
    };
  }

  const config = {
    value: { label: "Valor" },
    ...data.reduce((acc, curr, index) => {
      acc[curr.category.toLowerCase().replace(/\s+/g, '_')] = {
        label: curr.category,
        color: curr.fill,
      };
      return acc;
    }, {}),
  };
  return config;
};

const ChartsSection = ({ filters }) => {
  const { data: accountsData, isLoading: isAccountsLoading } = useAccountsQuery();
  const { data: transactionsData, isLoading: isTransactionsLoading } = useTransactionsQuery(filters);
  const isLoading = isAccountsLoading || isTransactionsLoading;

  console.log('Transactions Data:', transactionsData);
  console.log('Filters:', filters);

  const { data: expenseData, totalTransactions: totalExpenseTransactions } = useMemo(() =>
    processChartData(transactionsData?.transactions || [], 'expense')
    , [transactionsData]);
  const { data: incomeData, totalTransactions: totalIncomeTransactions } = useMemo(() =>
    processChartData(transactionsData?.transactions || [], 'income')
    , [transactionsData]);

  console.log('Expense Data:', expenseData);
  console.log('Income Data:', incomeData);

  const expenseChartConfig = useMemo(() => getChartConfig(expenseData, 'expense'), [expenseData]);
  const incomeChartConfig = useMemo(() => getChartConfig(incomeData, 'income'), [incomeData]);
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
        <span>Carregando dados...</span>
        <Progress value={100} className="w-[20%] mt-2" />
      </div>
    );
  }

  return (
    <>
      <div className="px-20 grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col border-2 border-neutral-300">
          <CardHeader className="items-center pb-0">
            <CardTitle>Despesas</CardTitle>
            <CardDescription>{filters.release_date ? new Date(filters.release_date).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }) : 'Últimos 30 dias'}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            {expenseData.length > 0 ? (
              <ChartContainer
                config={expenseChartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel formatter={(value, name) => [formatCurrency(value), " ",name]} />}
                  />
                  <Pie
                    data={expenseData}
                    dataKey="value"
                    nameKey="category"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {totalExpenseTransactions}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Registros
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="mx-auto aspect-square max-h-[250px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-lg mb-2">Nenhuma despesa</p>
                  <p className="text-sm">No período selecionado</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="text-muted-foreground leading-none">
              Mostrando o total de despesas por categoria
            </div>
          </CardFooter>
        </Card>

        <Card className="flex flex-col border-2 border-neutral-300">
          <CardHeader className="items-center pb-0">
            <CardTitle>Receitas</CardTitle>
            <CardDescription>{filters.release_date ? new Date(filters.release_date).toLocaleString('pt-BR', { month: 'long', year: 'numeric' }) : 'Últimos 30 dias'}</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            {incomeData.length > 0 ? (
              <ChartContainer
                config={incomeChartConfig}
                className="mx-auto aspect-square max-h-[250px]"
              >
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel formatter={(value, name) => [formatCurrency(value)," ", name]} />}
                  />
                  <Pie
                    data={incomeData}
                    dataKey="value"
                    nameKey="category"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {totalIncomeTransactions}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                              >
                                Registros
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="mx-auto aspect-square max-h-[250px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-lg mb-2">Nenhuma receita</p>
                  <p className="text-sm">No período selecionado</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="text-muted-foreground leading-none">
              Mostrando o total de receitas por categoria
            </div>
          </CardFooter>
        </Card>
      </div>
    </>
  );
};

export default ChartsSection;