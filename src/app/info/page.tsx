"use client";

import Header from "../components/header";
import { MapPin, Clock, Phone, MessageSquare, Facebook, ExternalLink } from "lucide-react";

export default function InfoPage() {
  const googleMapsUrl = "https://maps.app.goo.gl/jhpqa9pUb6ammkCt8";

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-body pb-24">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-brand-brown font-hand">
            Ghé Thăm Nhà Kim Hương
          </h1>
          <p className="text-stone-500 max-w-2xl mx-auto">
            "Chúng mình tin rằng trải nghiệm tận tay, tận mắt sẽ giúp bạn cảm nhận rõ nhất tâm huyết trong từng món đồ handmade."
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Left: Info Details */}
          <div className="space-y-8">
            {/* Store Cards */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-orange-100 space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                  <MapPin className="text-brand-terracotta" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-brown mb-1">Địa chỉ cửa hàng</h3>
                  <p className="text-stone-600 text-sm leading-relaxed">
                    246 Tân Hương, Tân Quý, Tân Phú,<br />
                    Thành phố Hồ Chí Minh, Việt Nam
                  </p>
                  <p className="text-[10px] text-stone-400 mt-1 italic">Plus code: QJRC+3F Tân Phú</p>
                  <a
                    href={googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-terracotta hover:underline mt-2"
                  >
                    Mở chỉ đường <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div className="flex gap-4 border-t border-stone-50 pt-6">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
                  <Clock className="text-brand-terracotta" />
                </div>
                <div>
                  <h3 className="font-bold text-brand-brown mb-1">Giờ mở cửa</h3>
                  <p className="text-stone-600 text-sm">
                    Mở cửa cả ngày: 07:00 - 23:00<br />
                    (Tất cả các ngày trong tuần)
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Section */}
            <div className="bg-brand-brown p-8 rounded-3xl shadow-xl text-white space-y-6">
              <h3 className="text-xl font-bold">Kết nối với chúng mình</h3>
              <p className="text-stone-400 text-sm">Bạn cần hỏi đường hoặc kiểm tra xem mẫu hàng bạn thích còn ở tiệm không?</p>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href="https://zalo.me/0000000000"
                  target="_blank"
                  className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 py-3 rounded-xl transition-all font-bold text-sm"
                >
                  <MessageSquare size={18} /> Zalo
                </a>
                <a
                  href="#"
                  className="flex items-center justify-center gap-2 bg-[#1877F2]/80 hover:bg-[#1877F2] py-3 rounded-xl transition-all font-bold text-sm"
                >
                  <Facebook size={18} /> Facebook
                </a>
                <a
                  href="tel:0000000000"
                  className="col-span-2 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 py-4 rounded-xl transition-all font-bold text-xl shadow-lg ring-4 ring-orange-100"
                >
                  <Phone size={24} /> Gọi Hotline: 0000 000 000
                </a>
              </div>
            </div>
          </div>

          {/* Right: Map Placeholder / Visual */}
          <div className="space-y-4 h-full">
            <div className="relative aspect-square md:aspect-auto md:h-full min-h-[400px] bg-stone-200 rounded-3xl overflow-hidden border-4 border-white shadow-lg group">
              <iframe
                src="https://maps.google.com/maps?q=Nh%C3%A0%20Kim%20H%C6%B0%C6%A1ng%2C%20246%20T%C3%A2n%20H%C6%B0%C6%A1ng%2C%20T%C3%A2n%20Qu%C3%BD%2C%20T%C3%A2n%20Ph%C3%BA%2C%20Th%C3%A0nh%20ph%E1%BB%91%20H%E1%BB%93%20Ch%C3%AD%20Minh&t=k&z=17&ie=UTF8&iwloc=&output=embed"
                className="absolute inset-0 w-full h-full border-0 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700"
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>

              {/* Badge */}
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur rounded-2xl shadow-lg border border-orange-100">
                <p className="text-xs font-bold text-brand-brown mb-1">📍 Nhà Kim Hương - Corner Studio</p>
                <p className="text-[10px] text-stone-500">246 Tân Hương, Tân Quý, Tân Phú</p>
              </div>
            </div>
          </div>
        </div>

        {/* Experience Section */}

      </main>
    </div>
  );
}
