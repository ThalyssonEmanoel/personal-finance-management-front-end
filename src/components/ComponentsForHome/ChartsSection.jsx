'use client'

import React, { useMemo, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useTransactionsChartQuery, useAccountsQuery } from '../../utils/apiClient';
import { ColumnChart } from './ColumnChart';
import Decimal from 'decimal.js';

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const processChartData = (transactions, type, sortBy = 'value') => {
  const filteredTransactions = transactions.filter(t => t.type === type);

  if (filteredTransactions.length === 0) {
    return {
      data: [],
      totalTransactions: 0,
      otherCategories: []
    };
  }

  const categoryData = filteredTransactions.reduce((acc, curr) => {
    const categoryName = curr.category || 'Demais categorias';
    const value = new Decimal(curr.value_installment || curr.value || 0).toNumber();

    if (!acc[categoryName]) {
      acc[categoryName] = {
        totalValue: 0,
        transactionCount: 0
      };
    }

    acc[categoryName].totalValue += value;
    acc[categoryName].transactionCount += 1;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryData)
    .sort(([, dataA], [, dataB]) => {
      if (sortBy === 'transactions') {
        return dataB.transactionCount - dataA.transactionCount;
      }
      return dataB.totalValue - dataA.totalValue;
    })
    .filter(([, data]) => data.totalValue > 0);

  const topCategories = sortedCategories.slice(0, 4);
  const otherCategories = sortedCategories.slice(4);

  const chartData = topCategories.map(([category, data], index) => ({
    category: category,
    value: data.totalValue,
    transactionCount: data.transactionCount,
    fill: chartColors[index % chartColors.length],
  }));

  if (otherCategories.length > 0) {
    const othersTotal = otherCategories.reduce((acc, [, data]) => acc + data.totalValue, 0);
    const othersCount = otherCategories.reduce((acc, [, data]) => acc + data.transactionCount, 0);

    chartData.push({
      category: 'Demais categorias',
      value: othersTotal,
      transactionCount: othersCount,
      fill: chartColors[chartData.length % chartColors.length],
    });
  }

  return {
    data: chartData,
    totalTransactions: filteredTransactions.length,
    otherCategories: otherCategories.map(([category, data]) => ({
      name: category,
      transactionCount: data.transactionCount,
      totalValue: data.totalValue
    }))
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

const ChartsSection = ({ filters, onCategoryClick }) => {
  const { data: accountsData, isLoading: isAccountsLoading } = useAccountsQuery();
  const { data: transactionsData, isLoading: isTransactionsLoading } = useTransactionsChartQuery(filters);
  const [expenseSortBy, setExpenseSortBy] = useState('value');
  const [incomeSortBy, setIncomeSortBy] = useState('value');
  const [showExpenseOthers, setShowExpenseOthers] = useState(false);
  const [showIncomeOthers, setShowIncomeOthers] = useState(false);
  const isLoading = isAccountsLoading || isTransactionsLoading;

  const { data: expenseData, totalTransactions: totalExpenseTransactions, otherCategories: expenseOtherCategories } = useMemo(() =>
    processChartData(transactionsData?.transactions || [], 'expense', expenseSortBy)
    , [transactionsData, expenseSortBy]);
  const { data: incomeData, totalTransactions: totalIncomeTransactions, otherCategories: incomeOtherCategories } = useMemo(() =>
    processChartData(transactionsData?.transactions || [], 'income', incomeSortBy)
    , [transactionsData, incomeSortBy]);

  const expenseChartConfig = useMemo(() => getChartConfig(expenseData, 'expense'), [expenseData]);
  const incomeChartConfig = useMemo(() => getChartConfig(incomeData, 'income'), [incomeData]);
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const handlePieClick = (data, type) => {
    if (data.category === 'Demais categorias') {
      if (type === 'expense') {
        setShowExpenseOthers(true);
      } else {
        setShowIncomeOthers(true);
      }
    } else {
      onCategoryClick(data.category);
    }
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
          <div className="flex justify-between items-start pr-6">
            <CardHeader className="items-center pb-0 flex-grow">
              <CardTitle>Despesas</CardTitle>
              <CardDescription>
                {filters.release_date ? (() => {
                  const [year, month, day] = filters.release_date.split('-').map(Number);
                  const date = new Date(year, month - 1, day);

                  const firstDay = date.toLocaleString('pt-BR', { day: 'numeric' });
                  const lastDayDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                  const lastDay = lastDayDate.toLocaleString('pt-BR', { day: 'numeric' });
                  const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                  return `${firstDay} à ${lastDay} de ${monthYear}`;
                })() : 'Todas as transações existentes'}
              </CardDescription>
            </CardHeader>
            <div className="flex flex-col min-w-[200px]">
              <label className="mb-2 text-sm font-medium text-gray-700">Organizar gráficos por:</label>
              <Select value={expenseSortBy} onValueChange={setExpenseSortBy}>
                <SelectTrigger className="w-56 h-8 border-2 border-neutral-300 rounded-sm text-xs">
                  <SelectValue placeholder="Selecione organização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Organização</SelectLabel>
                    <SelectItem value="value">Valores</SelectItem>
                    <SelectItem value="transactions">Quantidade de transações</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardContent className="flex-1 pb-0 flex items-center">
            {expenseData.length > 0 ? (
              <div className={`flex w-full ${showExpenseOthers ? 'ml-20' : ''}`}>
                <ChartContainer
                  config={expenseChartConfig}
                  className="mx-auto aspect-square max-h-[250px] min-w-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                              <p className="font-medium text-gray-900">{data.category}</p>
                              <p className="text-sm text-gray-600">
                                Valor: {formatCurrency(data.value)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Transações: {data.transactionCount}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={expenseData}
                      dataKey={expenseSortBy === 'transactions' ? 'transactionCount' : 'value'}
                      nameKey="category"
                      innerRadius={60}
                      strokeWidth={5}
                      onClick={(data) => handlePieClick(data, 'expense')}
                      className="cursor-pointer"
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
                                  Transações
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
                {showExpenseOthers && (
                  <div className="w-1/2 pl-4">
                    <h4 className="font-semibold mb-2">Demais categorias</h4>
                    <div className={expenseOtherCategories.length > 6 ? "max-h-32 overflow-y-auto" : ""}>
                      <ul>
                        {expenseOtherCategories.map(cat => (
                          <li key={cat.name} className="text-sm mb-1">
                            {cat.name} - {cat.transactionCount} Transações - {formatCurrency(cat.totalValue)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-auto aspect-square max-h-[250px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-lg mb-2">Nenhuma despesa encontrada</p>
                  <p className="text-sm">No período e filtros selecionados</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="text-muted-foreground leading-none">
              Mostrando o total de despesas agrupadas por categoria
            </div>
            <div className="text-xs text-muted-foreground">
              {totalExpenseTransactions} transaç{totalExpenseTransactions !== 1 ? 'ões' : 'ão'} no período
            </div>
          </CardFooter>
        </Card>

        <Card className="flex flex-col border-2 border-neutral-300">
          <div className="flex justify-between items-start pr-6">
            <CardHeader className="items-center pb-0 flex-grow">
              <CardTitle>Receitas</CardTitle>
              <CardDescription>
                {filters.release_date ? (() => {
                  const [year, month, day] = filters.release_date.split('-').map(Number);
                  const date = new Date(year, month - 1, day);

                  const firstDay = date.toLocaleString('pt-BR', { day: 'numeric' });
                  const lastDayDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                  const lastDay = lastDayDate.toLocaleString('pt-BR', { day: 'numeric' });
                  const monthYear = date.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
                  return `${firstDay} à ${lastDay} de ${monthYear}`;
                })() : 'Todas as transações existentes'}
              </CardDescription>
            </CardHeader>
            <div className="flex flex-col min-w-[200px]">
              <label className="mb-2 text-sm font-medium text-gray-700">Organizar gráficos por:</label>
              <Select value={incomeSortBy} onValueChange={setIncomeSortBy}>
                <SelectTrigger className="w-56 h-8 border-2 border-neutral-300 rounded-sm text-xs">
                  <SelectValue placeholder="Selecione organização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Organização</SelectLabel>
                    <SelectItem value="value">Valores</SelectItem>
                    <SelectItem value="transactions">Quantidade de transações</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <CardContent className="flex-1 pb-0 flex items-center">
            {incomeData.length > 0 ? (
              <div className={`flex w-full ${showIncomeOthers ? 'ml-20' : ''}`}>
                <ChartContainer
                  config={incomeChartConfig}
                  className="mx-auto aspect-square max-h-[250px] min-w-[250px]"
                >
                  <PieChart>
                    <ChartTooltip
                      cursor={false}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                              <p className="font-medium text-gray-900">{data.category}</p>
                              <p className="text-sm text-gray-600">
                                Valor: {formatCurrency(data.value)}
                              </p>
                              <p className="text-sm text-gray-600">
                                Transações: {data.transactionCount}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={incomeData}
                      dataKey={incomeSortBy === 'transactions' ? 'transactionCount' : 'value'}
                      nameKey="category"
                      innerRadius={60}
                      strokeWidth={5}
                      onClick={(data) => handlePieClick(data, 'income')}
                      className="cursor-pointer"
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
                                  Transações
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
                {showIncomeOthers && (
                  <div className="w-1/2 pl-4">
                    <h4 className="font-semibold mb-2">Demais categorias</h4>
                    <div className={incomeOtherCategories.length > 6 ? "max-h-32 overflow-y-auto" : ""}>
                      <ul>
                        {incomeOtherCategories.map(cat => (
                          <li key={cat.name} className="text-sm mb-1">
                            {cat.name} - {cat.transactionCount} Transações - {formatCurrency(cat.totalValue)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mx-auto aspect-square max-h-[250px] flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <p className="text-lg mb-2">Nenhuma receita encontrada</p>
                  <p className="text-sm">No período e filtros selecionados</p>
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col gap-2 text-sm">
            <div className="text-muted-foreground leading-none">
              Mostrando o total de receitas agrupadas por categoria
            </div>
            <div className="text-xs text-muted-foreground">
              {totalIncomeTransactions} transaç{totalIncomeTransactions !== 1 ? 'ões' : 'ão'} no período
            </div>
          </CardFooter>
        </Card>
      </div>
      <div className="px-20 mt-10 grid md:grid-cols-2 gap-6">
        <Card className="flex flex-col border-2 border-neutral-300">
          <CardContent className="pt-6">
            <ColumnChart filters={filters} type="expense" />
          </CardContent>
        </Card>
        
        <Card className="flex flex-col border-2 border-neutral-300">
          <CardContent className="pt-6">
            <ColumnChart filters={filters} type="income" />
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default ChartsSection;