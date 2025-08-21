'use client'

import React, { useEffect, useState } from 'react'
import { useAuth } from "@/hooks/useAuth"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import ButtonC from '@/components/Custom-Button'
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function HomePage() {
  const { getUserInfo, isLoading, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(undefined)

  useEffect(() => {
    if (isLoading()) {
      const interval = setInterval(() => {
        setProgress((oldProgress) => {
          if (oldProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          const diff = Math.random() * 10;
          return Math.min(oldProgress + diff, 100);
        });
      }, 300);

      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (isLoading()) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        gap: '1rem',
        fontSize: '1.2rem'
      }}>
        <span>Carregando...</span>
        <Progress value={progress} className="w-[20%]" />
      </div>
    );
  }

  if (!isAuthenticated()) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem'
      }}>
        Acesso não autorizado
      </div>
    );
  }

  const InfoCard = ({ title, value, isPositive, top3 }) => {
    const valueColor = isPositive ? 'text-green-600' : 'text-red-600';

    return (
      <div className="relative border-2 border-neutral-400 bg-[#FAF9F4] rounded-md shadow-sm pl-10 h-auto min-h-[10rem] flex flex-col justify-center">
        <div className="text-lg font-semibold">{title}</div>
        <div className={`mt-2 text-3xl font-bold ${valueColor}`}>{value}</div>

        {top3 && (
          <ul className="absolute right-6 list-decimal list-inside flex flex-col justify-center text-gray-700 pr-10 leading-relaxed">
            {top3.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="px-20 mt-8 flex flex-row flex-wrap gap-8 items-start justify-between">
        <div className="flex flex-wrap gap-6 items-end">
          <div className="flex flex-col">
            <label className="mb-2 text-base font-medium text-gray-700">Selecione a conta</label>
            <Select>
              <SelectTrigger className="w-56 h-10 border-2 border-neutral-400 rounded-sm">
                <SelectValue placeholder="Todas as contas" value="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Contas</SelectLabel>
                  <SelectItem value="All">Todas as contas</SelectItem>
                  <SelectItem value="apple">Apple</SelectItem>
                  <SelectItem value="banana">Banana</SelectItem>
                  <SelectItem value="blueberry">Blueberry</SelectItem>
                  <SelectItem value="grapes">Grapes</SelectItem>
                  <SelectItem value="pineapple">Pineapple</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col">
            <Label htmlFor="date" className="mb-2 text-base font-medium text-gray-700">
              Mês das transações
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-56 h-10 border-2 border-neutral-400 rounded-sm justify-between"
                >
                  {date ? date.toLocaleDateString() : "Selecionar data"}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  captionLayout="dropdown"
                  onSelect={(date) => {
                    setDate(date);
                    setOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <div className="mt-8">
          <ButtonC texto="Lançar transação" largura="120px" altura="40px" type="submit" />
        </div>
      </div >
      <div className="mt-10 px-20 grid md:grid-cols-3 gap-6">
        <InfoCard
          title="Saldo total"
          value="R$ 5.000,00"
          isPositive={true}
        />
        <InfoCard
          title="Receitas de julho"
          value="R$ 2.500,00"
          isPositive={true}
          top3={["Salário", "Investimentos", "Apostas"]}
        />
        <InfoCard
          title="Despesas de julho"
          value="R$ 1.500,00"
          isPositive={false}
          top3={["Contas", "Mercado", "Lazer"]}
        />
      </div>
    </>
  );
}