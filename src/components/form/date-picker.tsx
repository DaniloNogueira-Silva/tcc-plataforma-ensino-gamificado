"use client";

import { useEffect } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.css";

import { Portuguese } from "flatpickr/dist/l10n/pt";

import Label from "./Label";
import { CalenderIcon } from "../../icons";
import Hook = flatpickr.Options.Hook;
import DateOption = flatpickr.Options.DateOption;

type Position = "above" | "below" | "auto";

type PropsType = {
  id: string;
  mode?: "single" | "multiple" | "range" | "time";
  onChange?: Hook | Hook[];
  defaultDate?: DateOption;
  label?: string;
  placeholder?: string;
  showTimeSelect?: boolean;
  position?: Position;
};

export default function DatePicker({
  id,
  mode,
  onChange,
  label,
  defaultDate,
  placeholder,
  showTimeSelect,
  position,
}: PropsType) {
  useEffect(() => {
    const flatPickr = flatpickr(`#${id}`, {
      locale: Portuguese, 
      mode: mode || "single",
      monthSelectorType: "static",
      defaultDate,
      onChange,
      enableTime: showTimeSelect || false,
      time_24hr: true,
      position: position || "auto",
      dateFormat: showTimeSelect ? "Y-m-d H:i" : "Y-m-d",
      altInput: true,
      altFormat: showTimeSelect ? "d/m/Y H:i" : "d/m/Y",
    });

    return () => {
      if (!Array.isArray(flatPickr)) {
        flatPickr.destroy();
      }
    };
  }, [mode, onChange, id, defaultDate, showTimeSelect, position]);

  return (
    <div>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <input
          id={id}
          placeholder={
            placeholder ||
            (showTimeSelect
              ? "Selecione data e hora..."
              : "Selecione uma data...")
          }
          className="h-11 w-full rounded-lg border appearance-none px-4 py-2.5 text-sm shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3  dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30  bg-transparent text-gray-800 border-gray-300 focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700  dark:focus:border-brand-800"
        />
        <span className="absolute text-gray-500 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
          <CalenderIcon className="size-6" />
        </span>
      </div>
    </div>
  );
}
