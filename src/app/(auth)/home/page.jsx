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

  const InfoCard = ({ title, value, isPositive }) => {
    const valueColor = isPositive ? 'text-[rgb(2,157,64)]' : 'text-[rgb(190,13,64)]';

    return (
      <div className="border-2 border-neutral-400 bg-[#FAF9F4] h-[160px] w-[500px] rounded-md relative shadow-sm">
        <div className="absolute left-6 top-4 text-black text-base font-medium">{title}</div>
        <div className={`absolute left-6 top-20 text-2xl ${valueColor}`}>{value}</div>
      </div>
    );
  };

  return (
    <>
      <div className="mx-[72px] mt-6 flex flex-row justify-between">
        <div className="flex flex-row gap-x-5">
          {/* Select de Conta */}
          <div className="flex flex-col">
            <label className="mb-2 text-base font-medium text-gray-700">Selecione a conta</label>
            <Select>
              <SelectTrigger className="w-[230px] h-10 border-2 rounded-sm border-neutral-400">
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

          {/* Select de Data */}
          <div className="flex flex-col">
            <Label htmlFor="date" className="mb-2 text-base font-medium text-gray-700">
              Mês das transações
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  id="date"
                  className="w-[230px] h-10 justify-between font-normal border-2 border-neutral-400 rounded-sm"
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
        <div className='mt-6'>
          <ButtonC
            texto="Lançar transação"
            largura="120px"
            altura="40px"
            type="submit"
          />
        </div>
      </div >
      <div className="mt-10 mx-[72px] flex flex-row justify-between flex-wrap gap-y-6">
        <InfoCard title="Saldo total" value="- R$ 1.000,00" isPositive={false} />
        <InfoCard title="Receitas de julho" value="+ R$ 10.000,00" isPositive={true} />
        <InfoCard title="Despesas de julho" value="- R$ 11.000,00" isPositive={false} />
        <InfoCard title="Transferências internas" value="R$ 3.000,00" isPositive={true} />
      </div>
    </>
  );
}