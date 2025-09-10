'use client'

import React, { useMemo, useState, memo, useCallback } from 'react';
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
import { useTransactionsChartQuery, useAccountsQuery } from '../../utils/apiClient';
import { ColumnChart } from './ColumnChart';
import { withPerformanceOptimization, useStableDimensions } from '@/hooks/usePerformanceOptimization';
import AccessibleSelect from '@/components/AccessibleSelect';
import Decimal from 'decimal.js';

const chartColors = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

// Função de processamento de dados otimizada
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

// Componente otimizado para tooltip customizado
const CustomTooltip = memo(({ active, payload, formatCurrency }) => {
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
});

CustomTooltip.displayName = 'CustomTooltip';

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

// Componente de gráfico individual otimizado
const ChartCard = memo(({ 
  title, 
  data, 
  totalTransactions, 
  otherCategories, 
  sortBy, 
  onSortChange, 
  showOthers, 
  onToggleOthers, 
  onPieClick, 
  filters, 
  formatCurrency,
  chartConfig 
}) => {
  const { dimensions, elementRef } = useStableDimensions({
    minHeight: '400px'
  });

  const sortOptions = [
    { value: 'value', label: 'Valores' },
    { value: 'transactions', label: 'Quantidade de transações' }
  ];

  return (
    <Card 
      ref={elementRef}
      className="flex flex-col border-2 border-neutral-300"
      style={{ minHeight: dimensions.minHeight }}
    >
      <div className="flex justify-between items-start pr-6">
        <CardHeader className="items-center pb-0 flex-grow">
          <CardTitle>{title}</CardTitle>
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
          <AccessibleSelect
            value={sortBy}
            onValueChange={onSortChange}
            label="Organizar gráficos por:"
            ariaLabel={`Organizar gráfico de ${title.toLowerCase()} por`}
            items={sortOptions}
            className="w-56 h-8 border-2 border-neutral-300 rounded-sm text-xs"
          />
        </div>
      </div>
      <CardContent className="flex-1 pb-0 flex items-center">
        {data.length > 0 ? (
          <div className={`flex w-full ${showOthers ? 'ml-20' : ''}`}>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-[250px] min-w-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={(props) => <CustomTooltip {...props} formatCurrency={formatCurrency} />}
                />
                <Pie
                  data={data}
                  dataKey={sortBy === 'transactions' ? 'transactionCount' : 'value'}
                  nameKey="category"
                  innerRadius={60}
                  strokeWidth={5}
                  onClick={onPieClick}
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
                              {totalTransactions}
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
            {showOthers && (
              <div className="w-1/2 pl-4 mt-4">
                <h4 className="font-semibold mb-2">Demais categorias</h4>
                <div className={otherCategories.length > 6 ? "max-h-32 overflow-y-auto" : ""}>
                  <ul>
                    {otherCategories.map(cat => (
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
              <p className="text-lg mb-2">Nenhuma {title.toLowerCase()} encontrada</p>
              <p className="text-sm">No período e filtros selecionados</p>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Mostrando o total de {title.toLowerCase()} agrupadas por categoria
        </div>
        <div className="text-xs text-muted-foreground">
          {totalTransactions} transaç{totalTransactions !== 1 ? 'ões' : 'ão'} no período
        </div>
      </CardFooter>
    </Card>
  );
});

ChartCard.displayName = 'ChartCard';

const ChartsSection = memo(({ filters, onCategoryClick }) => {
  const { data: accountsData, isLoading: isAccountsLoading } = useAccountsQuery();
  const { data: transactionsData, isLoading: isTransactionsLoading } = useTransactionsChartQuery(filters);
  const [expenseSortBy, setExpenseSortBy] = useState('value');
  const [incomeSortBy, setIncomeSortBy] = useState('value');
  const [showExpenseOthers, setShowExpenseOthers] = useState(false);
  const [showIncomeOthers, setShowIncomeOthers] = useState(false);
  
  const isLoading = isAccountsLoading || isTransactionsLoading;

  // Memoização dos dados processados para evitar recálculos
  const chartData = useMemo(() => {
    const transactions = transactionsData?.transactions || [];
    
    const expenseData = processChartData(transactions, 'expense', expenseSortBy);
    const incomeData = processChartData(transactions, 'income', incomeSortBy);
    
    return {
      expense: expenseData,
      income: incomeData
    };
  }, [transactionsData, expenseSortBy, incomeSortBy]);

  // Memoização das configurações de gráfico
  const chartConfigs = useMemo(() => ({
    expense: getChartConfig(chartData.expense.data, 'expense'),
    income: getChartConfig(chartData.income.data, 'income')
  }), [chartData]);

  // Memoização da função de formatação
  const formatCurrency = useMemo(() => {
    return (value) => {
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(value || 0);
    };
  }, []);

  // Callbacks otimizados
  const handlePieClick = useCallback((data, type) => {
    if (data.category === 'Demais categorias') {
      if (type === 'expense') {
        setShowExpenseOthers(true);
      } else {
        setShowIncomeOthers(true);
      }
    } else {
      onCategoryClick(data.category);
    }
  }, [onCategoryClick]);

  const handleExpensePieClick = useCallback((data) => {
    handlePieClick(data, 'expense');
  }, [handlePieClick]);

  const handleIncomePieClick = useCallback((data) => {
    handlePieClick(data, 'income');
  }, [handlePieClick]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh]">
        <span>Carregando dados...</span>
        <Progress value={100} className="w-[20%] mt-2" />
      </div>
    );
  }

  return (
    <div role="region" aria-label="Seção de gráficos e análises">
      <div className="px-20 grid md:grid-cols-2 gap-6" style={{ minHeight: '400px' }}>
        <ChartCard
          title="Despesas"
          data={chartData.expense.data}
          totalTransactions={chartData.expense.totalTransactions}
          otherCategories={chartData.expense.otherCategories}
          sortBy={expenseSortBy}
          onSortChange={setExpenseSortBy}
          showOthers={showExpenseOthers}
          onToggleOthers={setShowExpenseOthers}
          onPieClick={handleExpensePieClick}
          filters={filters}
          formatCurrency={formatCurrency}
          chartConfig={chartConfigs.expense}
        />
        
        <ChartCard
          title="Receitas"
          data={chartData.income.data}
          totalTransactions={chartData.income.totalTransactions}
          otherCategories={chartData.income.otherCategories}
          sortBy={incomeSortBy}
          onSortChange={setIncomeSortBy}
          showOthers={showIncomeOthers}
          onToggleOthers={setShowIncomeOthers}
          onPieClick={handleIncomePieClick}
          filters={filters}
          formatCurrency={formatCurrency}
          chartConfig={chartConfigs.income}
        />
      </div>
      
      <div className="px-20 mt-10 grid md:grid-cols-2 gap-6" style={{ minHeight: '300px' }}>
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
    </div>
  );
});

ChartsSection.displayName = 'ChartsSection';

export default withPerformanceOptimization(ChartsSection);