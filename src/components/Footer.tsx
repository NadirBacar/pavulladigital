import { Phone, MapPin, Globe, ArrowUpRight } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-blue-50 py-12  border-t border-gray-200">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          {/* Card: Telefone */}
          <a
            href="tel:+258862629086"
            className="group bg-gray-50 hover:bg-primary/10 rounded-2xl p-4 md:p-6 transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-primary"
          >
            <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 group-hover:bg-primary rounded-xl flex items-center justify-center transition-colors">
                <Phone className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:text-white transition-colors" />
              </div>
              <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-primary transition-colors ml-auto" />
            </div>
            <h3 className="font-bold text-sm md:text-lg text-gray-800 mb-1">Telefone</h3>
            <p className="text-gray-600 group-hover:text-primary transition-colors font-medium text-xs md:text-base">
              +258 86 262 9086
            </p>
          </a>

          {/* Card: Localização */}
          <a
            href="https://maps.google.com/?q=Av.+Vladmir+Lenine+N2978,+Coop+Maputo"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-gray-50 hover:bg-primary/10 rounded-2xl p-4 md:p-6 transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-primary"
          >
            <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 group-hover:bg-primary rounded-xl flex items-center justify-center transition-colors">
                <MapPin className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:text-white transition-colors" />
              </div>
              <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-primary transition-colors ml-auto" />
            </div>
            <h3 className="font-bold text-sm md:text-lg text-gray-800 mb-1">Localização</h3>
            <p className="text-gray-600 text-xs md:text-sm group-hover:text-primary transition-colors">
              Av. Vladmir Lenine N2978, Coop Maputo, Moçambique
            </p>
          </a>

          {/* Card: Website - spans full width on mobile */}
          <a
            href="https://www.pavulla.com"
            target="_blank"
            rel="noopener noreferrer"
            className="col-span-2 md:col-span-1 group bg-gray-50 hover:bg-primary/10 rounded-2xl p-4 md:p-6 transition-all duration-300 hover:shadow-lg border-2 border-transparent hover:border-primary"
          >
            <div className="flex items-center gap-2 md:gap-4 mb-2 md:mb-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 group-hover:bg-primary rounded-xl flex items-center justify-center transition-colors">
                <Globe className="w-5 h-5 md:w-6 md:h-6 text-primary group-hover:text-white transition-colors" />
              </div>
              <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-gray-400 group-hover:text-primary transition-colors ml-auto" />
            </div>
            <h3 className="font-bold text-sm md:text-lg text-gray-800 mb-1">Website</h3>
            <p className="text-gray-600 group-hover:text-primary transition-colors font-medium text-xs md:text-base">
              www.pavulla.com
            </p>
          </a>
        </div>

        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-gray-500 text-sm">© 2025 Pavulla SA. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
