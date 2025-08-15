"use client";

import { useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/button/Button";
import { HttpRequest } from "@/utils/http-request";
import { IShopItem } from "@/utils/interfaces/shop_item.interface";
import { IUserCharacter } from "@/utils/interfaces/user.character";

export default function ShopPage() {
  const http = useMemo(() => new HttpRequest(), []);
  const [items, setItems] = useState<IShopItem[]>([]);
  const [character, setCharacter] = useState<IUserCharacter | null>(null);
  const [filter, setFilter] = useState<string>("TUDO");

  useEffect(() => {
    async function load() {
      const [allItems, userChar] = await Promise.all([
        http.getAllItems(),
        http.getUserCharacter(),
      ]);
      setItems(allItems);
      setCharacter(userChar);
    }
    load();
  }, [http]);

  const purchased = new Set(character?.items || []);

  const handleBuy = async (id: string) => {
    await http.buyItem(id);
    const updated = await http.getUserCharacter();
    setCharacter(updated);
  };

  const types = ["TUDO", "COMUM", "INCOMUM", "RARO", "ÉPICO", "LENDÁRIO"];
  const filteredItems =
    filter === "TUDO" ? items : items.filter((i) => i.type === filter);

  return (
    <div>
      <h1 className="mb-4 text-lg font-semibold">Loja</h1>
      <div className="mb-6 flex items-center gap-2">
        <span>Filtrar:</span>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded p-1"
        >
          {types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div className="ml-auto font-medium">Moedas: {character?.coins ?? 0}</div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredItems.map((item) => {
          const alreadyBought = purchased.has(item._id);
          return (
            <div
              key={item._id}
              className={`border p-4 rounded-lg flex flex-col items-center ${alreadyBought ? "opacity-50" : ""}`}
            >
              <img
                src={`/images/avatar_components/${item.label}.png`}
                alt={item.name}
                className="w-32 h-32 object-contain"
              />
              <h3 className="mt-2 font-medium">{item.name}</h3>
              <p className="text-sm mb-2">{item.price} moedas</p>
              {alreadyBought ? (
                <span className="text-xs text-gray-500">Já comprado</span>
              ) : (
                <Button onClick={() => handleBuy(item._id)} className="mt-auto">
                  Comprar
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
