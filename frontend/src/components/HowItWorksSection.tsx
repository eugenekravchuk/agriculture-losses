export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 bg-[#E6EBE6]">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12">Як працює наш сервіс</h2>

        <div className="space-y-10">
          <div className="flex items-start gap-6">
            <div className="text-5xl font-extrabold text-black">1</div>
            <div className="ps-3">
              <h3 className="text-xl font-bold mb-2">Заповни просту форму</h3>
              <p className="text-gray-700">
                У кілька кроків ти внесеш основні дані про свої втрати.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="text-5xl font-extrabold text-black">2</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Отримай розрахунок</h3>
              <p className="text-gray-700">
                Отримай автоматичний розрахунок загальної суми збитків за
                міжнародними стандартами
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6">
            <div className="text-5xl font-extrabold text-black">3</div>
            <div>
              <h3 className="text-xl font-bold mb-2">Завантаж документ</h3>
              <p className="text-gray-700">
                Завантаж готовий документ для використання в судових або
                компенсаційних процедурах.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
