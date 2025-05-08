"use client";

import React, { useState } from "react";

import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";

export default function DropdownWithIcon() {
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="relative inline-block">
      <button
        onClick={toggleDropdown}
        className="inline-flex items-center dropdown-toggle gap-2 px-4 py-3 text-sm font-medium text-white rounded-lg bg-brand-500 hover:bg-brand-600"
      >
        Account Menu
        <svg
          className={`duration-200 ease-in-out stroke-current ${
            isOpen ? "rotate-180" : ""
          }`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.79199 7.396L10.0003 12.6043L15.2087 7.396"
            stroke=""
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        className="absolute left-0 top-full z-40 mt-2 w-full min-w-[260px] rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-[#1E2635]"
        isOpen={isOpen}
        onClose={closeDropdown}
      >
        <ul className="flex flex-col gap-1">
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-white/5"
            >
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M15.101 19.247C14.6867 19.247 14.351 18.9112 14.351 18.497L14.351 14.245H12.851V18.497C12.851 19.7396 13.8583 20.747 15.101 20.747H18.501C19.7436 20.747 20.751 19.7396 20.751 18.497L20.751 5.49609C20.751 4.25345 19.7436 3.24609 18.5009 3.24609H15.101C13.8583 3.24609 12.851 4.25345 12.851 5.49609V9.74501L14.351 9.74501V5.49609C14.351 5.08188 14.6867 4.74609 15.101 4.74609L18.5009 4.74609C18.9152 4.74609 19.251 5.08188 19.251 5.49609L19.251 18.497C19.251 18.9112 18.9152 19.247 18.501 19.247H15.101ZM3.25098 11.9984C3.25098 12.2144 3.34229 12.4091 3.48841 12.546L8.09508 17.1556C8.38788 17.4485 8.86275 17.4487 9.15574 17.1559C9.44872 16.8631 9.44887 16.3882 9.15607 16.0952L5.81141 12.7484L16.001 12.7484C16.4152 12.7484 16.751 12.4127 16.751 11.9984C16.751 11.5842 16.4152 11.2484 16.001 11.2484L5.81553 11.2484L9.15609 7.90554C9.44888 7.61255 9.44871 7.13767 9.15572 6.84488C8.86272 6.55209 8.38785 6.55226 8.09506 6.84525L3.52333 11.4202C3.35698 11.5577 3.25098 11.7657 3.25098 11.9984Z"
                  fill=""
                />
              </svg>
              Sair
            </DropdownItem>
          </li>
        </ul>
      </Dropdown>
    </div>
  );
}
