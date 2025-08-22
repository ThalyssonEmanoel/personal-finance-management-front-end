import React, { useState } from 'react'
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
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

const FiltersSection = () => {
  const [open, setOpen] = useState(false)
  const [date, setDate] = useState(undefined)

  return (
    <div className="px-20 mt-10 flex flex-row justify-between">
      <div className="flex flex-wrap gap-6">
        <div className="flex flex-col">
          <label className="mb-2 text-base font-medium text-gray-700">Selecione a conta</label>
          <Select>
            <SelectTrigger className="w-56 h-10 border-2 border-neutral-300 rounded-sm">
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
                className="w-56 h-10 border-2 border-neutral-300 rounded-sm justify-between"
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
    </div>
  )
}

export default FiltersSection;
