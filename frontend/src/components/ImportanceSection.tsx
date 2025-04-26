import Image from "next/image";

export default function ImportanceSection() {
  return (
    <section id="importance" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12">Чому це важливо</h2>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-gray-100 rounded-2xl p-6 text-center shadow-md">
            <p className="text-lg">
              Внаслідок агресії ти міг втратити урожай, техніку, тварин, землю,
              будівлі.
            </p>
          </div>
          <div className="bg-gray-100 rounded-2xl p-6 text-center shadow-md">
            <p className="text-lg">
              Ці втрати — це не просто матеріальні речі. Це твої роки праці,
              твоя родина, твоє майбутнє.
            </p>
          </div>
        </div>

        <h3 className="text-2xl font-semibold mb-10">
          Ми створили простий інструмент, який допоможе тобі:
        </h3>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-gray-50 rounded-2xl p-8 text-center border">
            <div className="flex justify-center mb-4">
              <Image src="/coins-icon.png" alt="Coins" width={60} height={60} />
            </div>
            <p className="text-lg font-medium">
              Оцінити свої збитки швидко і правильно
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 text-center border">
            <div className="flex justify-center mb-4">
              <Image
                src="/document-icon.png"
                alt="Document"
                width={60}
                height={60}
              />
            </div>
            <p className="text-lg font-medium">
              Згенерувати юридично оформлений документ
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 text-center border">
            <div className="flex justify-center mb-4">
              <Image
                src="/justice-icon.png"
                alt="Justice"
                width={60}
                height={60}
              />
            </div>
            <p className="text-lg font-medium">
              Захистити своє право на відновлення
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
