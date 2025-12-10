"use client"

import React, { useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGoalsQuery } from "@/utils/apiClient";
import Decimal from "decimal.js";

export function ColumnChart({ filters, type = "expense" }) {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const goalsDateFilter = selectedMonth && selectedYear ? 
    `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01` : '';
  const goalsFilters = {
    ...filters,
    goalsDate: goalsDateFilter
  };
  const { data: goalsData, isLoading: isGoalsLoading } = useGoalsQuery(goalsFilters, type);
  const allGoalsFilters = {
    ...filters,
    goalsDate: ''
  };
  const { data: allGoalsData } = useGoalsQuery(allGoalsFilters, type);
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value || 0);
  };

  const getChartConfig = () => {
    return {
      metas: {
        label: "Metas",
        color: type === "income" ? "#7BF1A8" : "#FFB86A",
      },
      transacoes: {
        label: type === "income" ? "Receitas" : "Despesas",
        color: type === "income" ? "#00C950" : "#FF6900", 
      },
    };
  };

  const generateMonthOptions = () => {
    const months = [
      { value: 1, label: 'Janeiro' },
      { value: 2, label: 'Fevereiro' },
      { value: 3, label: 'Março' },
      { value: 4, label: 'Abril' },
      { value: 5, label: 'Maio' },
      { value: 6, label: 'Junho' },
      { value: 7, label: 'Julho' },
      { value: 8, label: 'Agosto' },
      { value: 9, label: 'Setembro' },
      { value: 10, label: 'Outubro' },
      { value: 11, label: 'Novembro' },
      { value: 12, label: 'Dezembro' },
    ];
    return months;
  };

  const generateYearOptions = () => {
    if (allGoalsData?.years && Array.isArray(allGoalsData.years)) {
      return allGoalsData.years
        .map(year => {
          const fullYear = year < 100 ? 2000 + year : year;
          return { value: fullYear, label: fullYear.toString() };
        })
        .sort((a, b) => b.value - a.value); 
    }
    
    return [];
  };

  const getDateRangeText = () => {
    if (!selectedMonth || !selectedYear) return '';
    
    const currentYear = new Date().getFullYear();
    
    if (selectedYear === currentYear) {
      return `Do mês ${String(selectedMonth).padStart(2, '0')} ao mês 12 do ano atual`;
    } else {
      return `Do mês ${String(selectedMonth).padStart(2, '0')} ao mês 12 de ${selectedYear}`;
    }
  };

  const processChartData = () => {
    if (!goalsData?.goals) return [];

    const filteredGoals = goalsData.goals.filter(goal => goal.transaction_type === type);
    const monthlyData = {};

    filteredGoals.forEach(goal => {
      const date = new Date(goal.date);
      const year = date.getFullYear();
      const month = date.getMonth();
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`; 
      const monthDisplay = date.toLocaleDateString('pt-BR', { month: 'short' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthDisplay,
          monthKey: monthKey,
          metas: 0,
          transacoes: 0,
          sortOrder: year * 100 + month,
        };
      }
      
      monthlyData[monthKey].metas += (goal.value || 0);

      const totalValue = type === 'expense' ?
        new Decimal(goal.expenseTotal || 0).toNumber() :
        new Decimal(goal.incomeTotal || 0).toNumber();

      monthlyData[monthKey].transacoes += totalValue;
    });


    if (filteredGoals.length === 0) {
      return [{ month: 'Nenhuma meta encontrada', metas: 0, transacoes: 0, monthKey: '0-00', sortOrder: 0 }];
      
    }

    return Object.values(monthlyData).sort((a, b) => a.sortOrder - b.sortOrder);
  };

  const chartData = processChartData();
  const chartConfig = getChartConfig();

  const isLoading = isGoalsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <span>Carregando gráfico...</span>
      </div>
    );
  }

  const title = type === "expense" ? "Metas vs Despesas" : "Metas vs Receitas";
  const monthOptions = generateMonthOptions();
  const yearOptions = generateYearOptions();

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div className="flex flex-col w-full sm:w-auto">
          <h3 className="text-base sm:text-lg font-semibold">{title}</h3>
          {selectedMonth && selectedYear && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {getDateRangeText()}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="flex flex-col flex-1 sm:flex-initial">
            <label className="mb-2 text-xs sm:text-sm font-medium text-gray-700" htmlFor="month-select">Selecione o mês:</label>
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger 
                id="month-select"
                className="w-full sm:w-32 h-8 border-2 border-neutral-300 rounded-sm text-xs"
                aria-label="Selecionar mês para filtrar gráfico"
              >
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col flex-1 sm:flex-initial">
            <label className="mb-2 text-xs sm:text-sm font-medium text-gray-700" htmlFor="year-select">Selecione o ano:</label>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger 
                id="year-select"
                className="w-full sm:w-24 h-8 border-2 border-neutral-300 rounded-sm text-xs"
                aria-label="Selecionar ano para filtrar gráfico"
              >
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <ChartContainer config={chartConfig} className="min-h-[250px] sm:min-h-[300px] w-full">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart 
            data={chartData} 
            margin={{ 
              top: 20, 
              right: 10, 
              left: 0, 
              bottom: 5 
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip 
              content={<ChartTooltipContent 
                formatter={(value, name) => [formatCurrency(value), " ", name]}
              />} 
            />
            <ChartLegend content={<ChartLegendContent className="flex-wrap" />} />
            <Bar dataKey="metas" fill="var(--color-metas)" radius={4} />
            <Bar dataKey="transacoes" fill="var(--color-transacoes)" radius={4} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
}