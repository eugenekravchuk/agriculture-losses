import Image from "next/image";

export default function ForWhomSection() {
  return (
    <section id="for-whom" className="py-20 bg-blue-50">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl font-bold mb-12">Для кого цей сервіс</h2>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-8 text-center border shadow-sm">
            <div className="flex justify-center mb-4">
              <Image
                src="/farmer-icon.png"
                alt="Farmer"
                width={60}
                height={60}
              />
            </div>
            <p className="text-lg font-medium">
              Фермери і власники агропідприємств
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-8 text-center border shadow-sm">
            <div className="flex justify-center mb-4">
              <Image src="/land-icon.png" alt="Land" width={60} height={60} />
            </div>
            <p className="text-lg font-medium">Орендарі земель</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-8 text-center border shadow-sm">
            <div className="flex justify-center mb-4">
              <Image
                src="/cooperative-icon.png"
                alt="Cooperative"
                width={60}
                height={60}
              />
            </div>
            <p className="text-lg font-medium">Керівники агрокооперативів</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-8 text-center border shadow-sm">
            <div className="flex justify-center mb-4">
              <Image
                src="/war-affected-icon.png"
                alt="War affected"
                width={60}
                height={60}
              />
            </div>
            <p className="text-lg font-medium">
              Постраждалі унаслідок бойових дій
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
