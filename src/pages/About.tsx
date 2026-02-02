import React from 'react';
import { motion } from 'framer-motion';
import { Info, ShieldCheck, Code, Heart, Scale, Users, FileText, Lock, Globe, Mail } from 'lucide-react';

const About: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#efede6] py-12 px-4 md:px-8 font-sans text-stone-900">
            <div className="max-w-4xl mx-auto">

                {/* PAGE HEADER */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center justify-center p-3 bg-stone-900 text-boun-gold rounded-full mb-4 shadow-lg"
                    >
                        <Info size={32} />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="font-serif text-3xl md:text-5xl font-bold text-stone-900 mb-2"
                    >
                        Kolektif Hamlin | 1863 Postası
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-stone-500 font-medium uppercase tracking-widest text-xs md:text-sm"
                    >
                        Öğrenci Tarafından, Öğrenci İçin
                    </motion.p>
                </div>

                {/* CONTENT CARD (PAPER STYLE) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-[#fcfbf9] p-8 md:p-12 rounded-lg shadow-xl border border-stone-200/60 relative overflow-hidden space-y-12"
                >
                    {/* Decorative Seal / Watermark */}
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                        <img src="https://cdn.1863postasi.org/bg/otk-logo.png" className="w-64 grayscale" alt="Watermark" />
                    </div>

                    <div className="relative z-10 text-stone-800 leading-relaxed space-y-8">

                        {/* SECTION: INTRO & GOVERNANCE */}
                        <section className="space-y-6">
                            <p className="text-lg text-stone-700 font-serif italic border-l-4 border-boun-gold pl-4 py-1 bg-amber-50/50">
                                Bu platform, yetki ve sorumlulukların paylaşıldığı ikili bir yapı ile yönetilmektedir:
                            </p>

                            <div className="grid md:grid-cols-2 gap-6 mt-4">
                                <div className="bg-white p-6 rounded-lg border border-stone-100 shadow-sm hover:border-boun-blue/30 transition-colors">
                                    <h3 className="flex items-center gap-2 font-bold text-stone-900 mb-3 text-sm uppercase tracking-wider">
                                        <ShieldCheck size={18} className="text-boun-blue" />
                                        Teknik & Altyapı
                                    </h3>
                                    <p className="text-sm text-stone-600">
                                        Projenin teknik altyapısı, giderleri, veri güvenliği ve sürdürülebilirliği
                                        <strong className="text-stone-900"> Boğaziçi Üniversitesi Öğrenci Temsilciliği Kurulu (ÖTK)</strong> sorumluluğundadır.
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-lg border border-stone-100 shadow-sm hover:border-boun-gold/30 transition-colors">
                                    <h3 className="flex items-center gap-2 font-bold text-stone-900 mb-3 text-sm uppercase tracking-wider">
                                        <FileText size={18} className="text-boun-gold" />
                                        İçerik & Kürasyon
                                    </h3>
                                    <p className="text-sm text-stone-600">
                                        Platformun kalbi olan "Arşiv", "Yayınlar" ve "Ortak Öğrenci Takvimi" modüllerinin kürasyonu ve editöryal bağımsızlığı
                                        <strong className="text-stone-900"> Kolektif Hamlin (KH)</strong> inisiyatifindedir.
                                    </p>
                                </div>
                            </div>

                            <div className="bg-stone-50 p-4 rounded border border-stone-200 text-sm text-stone-600 flex gap-3 items-start">
                                <Users size={20} className="shrink-0 mt-0.5 text-stone-400" />
                                <p>Arşiv; başta <strong>Kolektif Hamlin (KH)</strong>, <strong>ÖTK Arşiv Komitesi</strong> ve <strong>BogaziciMemories</strong> olmak üzere kolektif hafızaya önem veren tüm öğrencilerin katkılarıyla oluşturulmuştur.</p>
                            </div>
                        </section>

                        <div className="h-px bg-stone-200 w-full mx-auto" />

                        {/* SECTION: LICENSING */}
                        <section className="space-y-8">
                            <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
                                <Scale size={24} className="text-stone-400" />
                                Lisanslama ve Haklar
                            </h2>
                            <p className="text-stone-700">Proje Hibrit Lisanslama stratejisi izlemektedir:</p>

                            {/* 1. SOFTWARE LICENSE */}
                            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                                <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h3 className="font-bold text-lg text-stone-900 flex items-center gap-2">
                                        <Code size={20} className="text-stone-500" /> 1. Yazılımın Kendisi
                                    </h3>
                                    <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-3 py-1.5 rounded-full text-xs font-bold border border-blue-100">
                                        <img src="/licenses/agpl.png" alt="GNU AGPLv3" className="h-6 w-auto object-contain" />
                                        GNU AGPLv3
                                    </div>
                                </div>
                                <div className="p-6 md:p-8 space-y-4 text-sm text-stone-600 leading-relaxed">
                                    <p>
                                        1863 Postası; Yapay Zeka (LLM) araçlardan yararlanılarak üretilmiştir. Ancak bu araçlardan yalnızca kod düzenleme sırasında yardım alınmış; projenin fikrî varlığı ve özgün karakteri, Ağustos 2025’te başlayıp beş ay süren tartışmalar ve yaratıcı kararlar üzerine inşa edilmiştir.
                                    </p>
                                    <ul className="list-disc pl-5 space-y-1 marker:text-stone-300">
                                        <li>Platformun var oluş amacı, kapsamı ve fikirlerin tüm ayrıntıları,</li>
                                        <li>Backend bağlantıları, sunucu tarafı orkestrasyonu ve servislerin entegrasyon stratejisi,</li>
                                        <li>Karmaşık veritabanı şemaları, arşiv hiyerarşisi ve veri ilişkilerinin kurgusu,</li>
                                        <li>Arayüzdeki estetik tercihler, görsel kimlik ve kullanıcı deneyimi,</li>
                                        <li>Platforma özgü modüllerin çalışma prensipleri,</li>
                                        <li>Veri gizliliği protokolleri, etik ve güvenlik kararlarının teknik uygulaması,</li>
                                        <li>Yapay zekayı yönlendiren teknik kurgular, ve nihai kod denetimi;</li>
                                    </ul>
                                    <p>
                                        Tamamen geliştiricilerin fiziksel ve zihinsel emeği ile ortaya çıkmıştır. Bu sebeple proje; hukuk literatüründeki
                                        <strong> "Derleme Eser" / "Seçki ve Düzenleme Hakkı"</strong> kapsamında özgün bir bütün olarak değerlendirilir.
                                    </p>
                                    <div className="bg-blue-50/50 p-4 rounded border border-blue-100 text-blue-900 mt-4">
                                        <p className="mb-2 font-semibold">Bu özgünlük, bütünlük, insan emeği ve fikir mimarisi; GNU AGPLv3 (Affero General Public License) ile koruma altına alınmıştır.</p>
                                        <p className="opacity-80 text-xs">Kaynak kodlar ve fikirler öğrenime, geliştirmeye ve kopyalamaya açıktır. Ancak ticari amaçla kapalı bir ürüne dönüştürülemez. Türetilen eserler de aynı özgürlükte kalmalıdır.</p>
                                    </div>
                                </div>
                            </div>

                            {/* 2. CONTENT LICENSE */}
                            <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-sm">
                                <div className="bg-stone-50 border-b border-stone-200 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <h3 className="font-bold text-lg text-stone-900 flex items-center gap-2">
                                        <Globe size={20} className="text-stone-500" /> 2. İçerik ve Arşiv
                                    </h3>
                                    <div className="flex items-center gap-2 bg-stone-100 text-stone-800 px-3 py-1.5 rounded-full text-xs font-bold border border-stone-200">
                                        <img src="/licenses/cc.png" alt="CC BY-NC-SA 4.0" className="h-6 w-auto object-contain" />
                                        CC BY-NC-SA 4.0
                                    </div>
                                </div>
                                <div className="p-6 text-sm text-stone-600 leading-relaxed">
                                    <p className="mb-4">
                                        Platformdaki tarihi belgeler, küratörlü metinler ve veritabanı; <strong>CC BY-NC-SA 4.0</strong> (Creative Commons) ile korunmaktadır.
                                    </p>
                                    <p className="italic text-stone-500">
                                        Kaynak göstererek kopyalanabilir ve dağıtabilir; üzerine ekleme yapılabilir fakat ticari amaçla kullanılamaz ve dağıtılamaz.
                                    </p>
                                </div>
                            </div>

                            {/* 3. STUDENT CONTENT */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-lg text-stone-900 flex items-center gap-2">
                                    <Heart size={20} className="text-red-400" /> 3. Öğrenci Üretimleri
                                </h3>
                                <p className="text-sm text-stone-600">
                                    Site/uygulama içerisindeki fanzinler, kulüp veya topluluk yayınları, fotoğraflar ve öğrenci duyurularının telif hakkı
                                    <strong> eser sahibine (Öğrenciye/Kulübe/Topluluğa) </strong> aittir.
                                </p>
                                <p className="text-xs text-stone-500 bg-stone-50 p-3 rounded border border-stone-100">
                                    ÖTK veya Kolektif Hamlin bu eserler üzerinde mülkiyet iddia etmez. Sadece platformda sergilemek için münhasır olmayan yayınlama hakkına sahiptir. Eser sahibi, eserini dilediği başka mecrada kullanmakta ve 1863 Postası’ndan kaldırmakta özgürdür.
                                </p>
                            </div>

                        </section>

                        <div className="h-px bg-stone-200 w-full mx-auto" />

                        {/* SECTION: TECH & FOOTER INFO */}
                        <section className="grid md:grid-cols-2 gap-8 text-sm">
                            <div>
                                <h4 className="font-bold text-stone-900 mb-2">Projede Kullanılan Teknolojiler</h4>
                                <ul className="space-y-1 text-stone-600">
                                    <li><strong className="text-stone-800">Mimari:</strong> React, TypeScript, Firebase, Cloudflare R2</li>
                                    <li><strong className="text-stone-800">Geliştirme:</strong> LLM Teknolojileri, Antigravity</li>
                                    <li><strong className="text-stone-800">Açık Kaynak:</strong> React (MIT), Vite (MIT), Firebase SDK (Apache 2.0)</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
                                    <Lock size={14} /> Gizlilik ve Güvenilirlik
                                </h4>
                                <ul className="space-y-1 text-stone-600 list-disc pl-4">
                                    <li>Öğrenci verileri asla 3. taraflarla paylaşılmaz.</li>
                                    <li>Öğrencilerin platform içi hareketleri (okuduğu fanzinler, forum gezintileri) profillenmez.</li>
                                </ul>
                            </div>
                        </section>
                    </div>

                    {/* FOOTER */}
                    <div className="mt-12 pt-8 border-t border-stone-200 text-center space-y-4">
                        <div className="flex justify-center items-center gap-2 text-stone-600 hover:text-boun-blue transition-colors">
                            <Mail size={16} />
                            <a href="mailto:bogaziciuniversitesiotk@gmail.com" className="text-sm font-medium hover:underline">
                                bogaziciuniversitesiotk@gmail.com
                            </a>
                        </div>
                        <div className="text-xs text-stone-400 font-serif">
                            <p className="font-bold mb-1">Sürüm: v1.0.0 - "Kamusal, Nitelikli, Özgür."</p>
                            <p>© {new Date().getFullYear()} Boğaziçi Üniversitesi Öğrenci Temsilciliği Kurulu | Kolektif Hamlin</p>
                        </div>
                    </div>

                </motion.div>
            </div>
        </div>
    );
};

export default About;
