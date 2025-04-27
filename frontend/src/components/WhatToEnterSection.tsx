import { CheckCircle } from "lucide-react";

export default function WhatToEnterSection() {
  return (
    <section id="what-to-enter" className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12">Що тобі потрібно вказати</h2>

        <ul className="space-y-6 mb-12">
          <li className="flex items-center gap-4">
            <CheckCircle className="text-black w-6 h-6" />
            <span className="text-lg">
              Фінансові дані до війни і під час війни
            </span>
          </li>
          <li className="flex items-center gap-4">
            <CheckCircle className="text-black w-6 h-6" />
            <span className="text-lg">Втрати техніки та обладнання</span>
          </li>
          <li className="flex items-center gap-4">
            <CheckCircle className="text-black w-6 h-6" />
            <span className="text-lg">Втрату тварин</span>
          </li>
          <li className="flex items-center gap-4">
            <CheckCircle className="text-black w-6 h-6" />
            <span className="text-lg">Втрачено чи пошкоджену територію</span>
          </li>
          <li className="flex items-center gap-4">
            <CheckCircle className="text-black w-6 h-6" />
            <span className="text-lg">Руйнування будівель та складів</span>
          </li>
        </ul>

        <p className="text-xl font-semibold">
          Не потрібно шукати складні цифри або юридичні довідки — ми все
          підкажемо в процесі!
        </p>
      </div>
    </section>
  );
}
