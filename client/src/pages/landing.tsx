import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Check,
  X,
  Play,
  Crown,
  Rocket,
  ArrowLeft,
  RefreshCw, // sync-alt substitute
  LineChart, // chart-line substitute
  Globe,
  Bell,
  Code,
  Headset,
  Quote,
  Star,
  ChevronDown
} from "lucide-react";
import { useState } from "react";

export default function Landing() {
  const [demoUrl, setDemoUrl] = useState("");
  const [demoKeyword, setDemoKeyword] = useState("");

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('هذه ميزة تجريبية للعرض فقط سيتم تفعيلها قريباً!');
  };

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28 text-center text-white"
        style={{
          background: `linear-gradient(135deg, rgba(139, 195, 74, 0.92) 0%, rgba(76, 175, 80, 0.95) 100%), url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2000&q=80')`,
          backgroundAttachment: 'fixed',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0 z-0 opacity-30"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
            backgroundSize: '60px 60px'
          }}
        />

        <div className="container mx-auto px-4 relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/30 text-sm font-semibold mb-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
            <Crown className="w-4 h-4 text-white" />
            <span>الأداة الأولى لتتبع الترتيب في السوق العربي</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-[58px] font-bold mb-6 leading-tight text-shadow-sm animate-in fade-in slide-in-from-bottom-5 duration-700 delay-100">
            حسّن ترتيب موقعك في جوجل<br />
            وزد زياراتك بـ <span className="bg-gradient-to-br from-[#ffeb3b] to-[#ffc107] bg-clip-text text-transparent">300%</span>
          </h1>

          <p className="text-xl md:text-2xl opacity-95 max-w-3xl mx-auto mb-10 text-shadow-sm animate-in fade-in slide-in-from-bottom-5 duration-700 delay-200">
            تتبع دقيق لترتيب كلماتك المفتاحية مع تحديثات يومية تلقائية وتقارير احترافية قابلة للتخصيص
          </p>

          <div className="flex flex-col md:flex-row gap-5 justify-center mb-12 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-300">
            <Button
              size="lg"
              className="bg-white text-[#4caf50] hover:bg-white/90 hover:-translate-y-1 hover:shadow-xl text-lg px-10 py-7 rounded-full font-bold transition-all"
              asChild
            >
              <a href="/register" className="flex items-center gap-2">
                <Rocket className="w-5 h-5" />
                ابدأ تجربتك المجانية - 14 يوم
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-2 border-white/50 text-white hover:bg-white/20 hover:border-white hover:text-white text-lg px-10 py-7 rounded-full font-bold transition-all"
              asChild
            >
              <a href="#demo" className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                شاهد عرض توضيحي
              </a>
            </Button>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-10 mt-12 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-500">
            {[
              { number: "+500", label: "عميل نشط" },
              { number: "+10K", label: "كلمة متتبعة" },
              { number: "99.9%", label: "وقت تشغيل" },
              { number: "4.9/5", label: "تقييم العملاء" }
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-10 last:gap-0">
                <div className="flex flex-col items-center gap-2">
                  <span className="text-3xl font-bold">{stat.number}</span>
                  <span className="text-sm opacity-90">{stat.label}</span>
                </div>
                {i < 3 && <div className="hidden md:block w-px h-10 bg-white/30"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-12 bg-white shadow-[0_-5px_20px_rgba(0,0,0,0.05)] relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="flex-1 text-center lg:text-right">
              <h3 className="text-xl text-[#2e7d32] font-semibold mb-4">
                موثوق به من قبل أكثر من 500 مسوق رقمي ووكالة في الوطن العربي
              </h3>
              <div className="flex items-center justify-center lg:justify-start -space-x-3 space-x-reverse">
                {['أ', 'م', 'س', 'ف', 'ك'].map((char, i) => (
                  <div
                    key={i}
                    className={`w-11 h-11 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-base shadow-md`}
                    style={{ background: `linear-gradient(135deg, ${['#66bb6a', '#8bc34a', '#9ccc65', '#aed581', '#c5e1a5'][i]} 0%, #43a047 100%)` }}
                  >
                    {char}
                  </div>
                ))}
                <div className="w-11 h-11 rounded-full border-4 border-white bg-gradient-to-br from-[#c5e1a5] to-[#9ccc65] flex items-center justify-center text-white font-bold text-sm shadow-md">
                  +495
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-8 sm:gap-12">
              {[
                { number: "24/7", label: "مراقبة مستمرة" },
                { number: "100%", label: "دعم عربي" },
                { number: "30 يوم", label: "ضمان الاسترداد" }
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-3xl font-bold text-[#4caf50] mb-1">{stat.number}</div>
                  <div className="text-sm text-[#666]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Video Demo */}
      <section id="demo" className="py-24 bg-gradient-to-br from-[#f1f8e9] to-[#e8f5e9]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="fade-in">
              <h2 className="text-4xl lg:text-[42px] font-bold text-[#2e7d32] mb-5 leading-tight">
                شاهد ترتيب في العمل
              </h2>
              <p className="text-lg text-[#666] mb-8 leading-relaxed">
                اكتشف كيف يمكن لترتيب أن يساعدك على تتبع وتحسين ظهور موقعك في نتائج البحث بسهولة وفعالية.
              </p>

              <ul className="space-y-4 mb-8">
                {[
                  "واجهة سهلة الاستخدام بالعربية 100%",
                  "تقارير مرئية وتفاعلية في الوقت الفعلي",
                  "تنبيهات فورية عند تغير الترتيب",
                  "تكامل سلس مع أدواتك المفضلة"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-lg text-[#555]">
                    <CheckCircleIcon className="w-5 h-5 text-[#4caf50]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className="bg-gradient-to-r from-[#8bc34a] to-[#4caf50] text-white hover:shadow-lg transition-all text-lg px-8 py-6 rounded-full"
                asChild
              >
                <a href="/register" className="flex items-center gap-2">
                  جرب الآن مجاناً
                  <ArrowLeft className="w-5 h-5" />
                </a>
              </Button>
            </div>

            <div className="bg-white rounded-[20px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden aspect-video relative group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] flex items-center justify-center">
                <div className="w-20 h-20 bg-[#4caf50]/95 rounded-full flex items-center justify-center shadow-[0_5px_25px_rgba(76,175,80,0.4)] group-hover:scale-110 transition-transform duration-300">
                  <Play className="w-8 h-8 text-white ml-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section id="features" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <span className="inline-block bg-[#e8f5e9] text-[#2e7d32] px-5 py-2 rounded-full text-sm font-semibold mb-4">
              لماذا ترتيب؟
            </span>
            <h2 className="text-4xl lg:text-[42px] font-bold text-[#2e7d32] mb-5">
              كل ما تحتاجه لتحسين ترتيبك
            </h2>
            <p className="text-lg text-[#666] leading-relaxed">
              أدوات قوية ومميزات شاملة تجعل تتبع وتحسين ترتيب موقعك أمراً سهلاً وفعالاً
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: RefreshCw, title: "تحديثات يومية تلقائية", desc: "تُحدّث جميع كلماتك المفتاحية تلقائياً كل 24 ساعة، مع إمكانية التحديث الفوري عند الطلب بشكل غير محدود." },
              { icon: LineChart, title: "تقارير احترافية مخصصة", desc: "أنشئ تقارير مفصلة بشعارك وألوانك الخاصة، مثالية لتقديمها للعملاء أو الإدارة." },
              { icon: Globe, title: "دعم كامل للسوق العربي", desc: "تتبع دقيق لجميع دول الخليج والوطن العربي مع دعم البحث المحلي وحزمة الخرائط المحلية." },
              { icon: Bell, title: "تنبيهات ذكية فورية", desc: "احصل على إشعارات فورية عبر البريد عند حدوث تغييرات مهمة في ترتيب كلماتك المفتاحية." },
              { icon: Code, title: "API قوي ومرن", desc: "تكامل سلس مع أنظمتك الحالية من خلال واجهة برمجة تطبيقات قوية وموثقة بشكل جيد." },
              { icon: Headset, title: "دعم فني متميز", desc: "فريق دعم عربي متاح للمساعدة في أي وقت، مع استجابة سريعة وحلول فعالة." },
            ].map((feature, i) => (
              <div key={i} className="group bg-gradient-to-br from-white to-[#f9fbe7] p-10 rounded-[20px] text-center border-2 border-transparent hover:border-[#8bc34a] hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(76,175,80,0.15)] transition-all duration-300">
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#8bc34a] to-[#4caf50] rounded-full flex items-center justify-center shadow-[0_5px_20px_rgba(76,175,80,0.3)] mb-6">
                  <feature.icon className="w-9 h-9 text-white" />
                </div>
                <h3 className="text-[22px] font-bold text-[#2e7d32] mb-4">{feature.title}</h3>
                <p className="text-[#666] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo */}
      <section className="py-24 bg-gradient-to-br from-[#1b5e20] to-[#2e7d32] text-white relative overflow-hidden">
        <div
          className="absolute inset-0 z-0 opacity-5"
          style={{
            backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`
          }}
        />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl lg:text-[42px] font-bold mb-5">جرب ترتيب مباشرة</h2>
          <p className="text-lg opacity-90 mb-12">اختبر قوة ترتيب في تتبع موقعك الآن</p>

          <div className="bg-white rounded-[20px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-4xl mx-auto">
            <form onSubmit={handleDemoSubmit} className="flex flex-col md:flex-row gap-4 mb-8">
              <input
                type="text"
                placeholder="أدخل نطاق موقعك (مثال: example.com)"
                className="flex-1 p-4 border-2 border-[#e0e0e0] rounded-xl text-black focus:outline-none focus:border-[#4caf50] transition-colors"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
              />
              <input
                type="text"
                placeholder="أدخل كلمة مفتاحية"
                className="flex-1 p-4 border-2 border-[#e0e0e0] rounded-xl text-black focus:outline-none focus:border-[#4caf50] transition-colors"
                value={demoKeyword}
                onChange={(e) => setDemoKeyword(e.target.value)}
              />
              <button className="bg-gradient-to-r from-[#8bc34a] to-[#4caf50] text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all whitespace-nowrap">
                تتبع الآن
              </button>
            </form>
            <div className="bg-[#f9fbe7] rounded-[15px] h-[200px] flex items-center justify-center text-[#666]">
              <p>أدخل معلومات موقعك أعلاه لرؤية نتيجة فورية</p>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <span className="inline-block bg-[#e8f5e9] text-[#2e7d32] px-5 py-2 rounded-full text-sm font-semibold mb-4">
              المقارنة
            </span>
            <h2 className="text-4xl lg:text-[42px] font-bold text-[#2e7d32] mb-5">
              ترتيب vs المنافسون
            </h2>
            <p className="text-lg text-[#666] leading-relaxed">
              اكتشف لماذا يختار المسوقون الأذكياء ترتيب
            </p>
          </div>

          <div className="bg-white rounded-[20px] overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.08)] max-w-5xl mx-auto border border-[#f0f0f0]">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-[#8bc34a] to-[#4caf50] text-white">
                  <th className="p-6 text-right font-bold text-lg">الميزة</th>
                  <th className="p-6 text-center font-bold text-lg">ترتيب</th>
                  <th className="p-6 text-center font-bold text-lg hidden sm:table-cell opacity-90">المنافس أ</th>
                  <th className="p-6 text-center font-bold text-lg hidden sm:table-cell opacity-90">المنافس ب</th>
                </tr>
              </thead>
              <tbody>
                {[
                  "تحديثات يومية تلقائية",
                  "فحوصات غير محدودة",
                  "واجهة عربية 100%",
                  "دعم السوق الخليجي",
                  "تقارير بالشعار الخاص",
                  "دعم عربي 24/7"
                ].map((feature, i) => (
                  <tr key={i} className="border-b border-[#f0f0f0] hover:bg-[#f9fbe7] transition-colors">
                    <td className="p-5 text-[#2e7d32] font-semibold">{feature}</td>
                    <td className="p-5 text-center"><Check className="w-6 h-6 text-[#4caf50] mx-auto" /></td>
                    <td className="p-5 text-center hidden sm:table-cell"><X className="w-5 h-5 text-[#ccc] mx-auto" /></td>
                    <td className="p-5 text-center hidden sm:table-cell text-[#ccc]"><X className="w-5 h-5 text-[#ccc] mx-auto" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-[#e8f5e9] to-[#f1f8e9]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <span className="inline-block bg-white text-[#2e7d32] px-5 py-2 rounded-full text-sm font-semibold mb-4 shadow-sm">
              آراء العملاء
            </span>
            <h2 className="text-4xl lg:text-[42px] font-bold text-[#2e7d32] mb-5">
              ماذا يقول عملاؤنا؟
            </h2>
            <p className="text-lg text-[#666] leading-relaxed">
              انضم إلى مئات المسوقين الذين يثقون في ترتيب
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                text: "ترتيب غيّر طريقة عملنا تماماً. التقارير المخصصة وفرت علينا ساعات من العمل اليدوي، والعملاء منبهرون بالمستوى الاحترافي.",
                name: "أحمد محمد",
                role: "مدير تسويق رقمي - الرياض",
                char: "أ"
              },
              {
                text: "الدعم الفني باللغة العربية كان عامل حاسم بالنسبة لنا. فريق ترتيب متعاون جداً ويفهم احتياجات السوق العربي.",
                name: "فاطمة العلي",
                role: "مستشارة SEO - دبي",
                char: "ف"
              },
              {
                text: "سهولة الاستخدام والدقة في النتائج جعلت ترتيب الأداة المفضلة لوكالتنا. نستخدمه لأكثر من 50 عميل بنجاح كبير.",
                name: "خالد السعيد",
                role: "مؤسس وكالة تسويق - جدة",
                char: "خ"
              }
            ].map((t, i) => (
              <div key={i} className="bg-white p-9 rounded-[20px] shadow-[0_5px_25px_rgba(0,0,0,0.08)] relative">
                <Quote className="absolute top-5 left-8 w-12 h-12 text-[#4caf50]/20" />
                <div className="flex gap-1 mb-4 text-[#ffc107]">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-[#666] leading-relaxed mb-6 font-normal">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8bc34a] to-[#4caf50] flex items-center justify-center text-white font-bold text-xl">
                    {t.char}
                  </div>
                  <div>
                    <h4 className="text-[#2e7d32] font-bold text-base">{t.name}</h4>
                    <p className="text-sm text-[#999]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section id="pricing" className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <span className="inline-block bg-[#e8f5e9] text-[#2e7d32] px-5 py-2 rounded-full text-sm font-semibold mb-4">
              الأسعار
            </span>
            <h2 className="text-4xl lg:text-[42px] font-bold text-[#2e7d32] mb-5">
              خطط تناسب جميع الاحتياجات
            </h2>
            <p className="text-lg text-[#666] leading-relaxed">
              اختر الباقة المناسبة لك - يمكنك الترقية أو التخفيض في أي وقت
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="bg-gradient-to-br from-white to-[#f9fbe7] p-10 rounded-[25px] text-center border-2 border-transparent hover:border-[#4caf50] hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(76,175,80,0.2)] transition-all">
              <h3 className="text-2xl font-bold text-[#2e7d32] mb-5">المبتدئ</h3>
              <div className="text-5xl font-bold text-[#4caf50] mb-2.5">99 <span className="text-lg text-[#666] font-normal">ريال/شهر</span></div>
              <ul className="space-y-3 my-8 text-right">
                {[
                  "25 كلمة مفتاحية",
                  "تحديثات يومية",
                  "موقع واحد",
                  "فحوصات غير محدودة"
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#555] border-b border-[#f0f0f0] pb-3 last:border-0">
                    <Check className="w-5 h-5 text-[#4caf50]" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-gradient-to-r from-[#8bc34a] to-[#4caf50] text-white py-6 rounded-full font-bold text-lg" asChild>
                <a href="/pricing">ابدأ الآن</a>
              </Button>
            </div>

            <div className="bg-gradient-to-br from-white to-[#f9fbe7] p-10 rounded-[25px] text-center border-2 border-[#4caf50] transform scale-105 shadow-[0_15px_40px_rgba(76,175,80,0.15)] relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#4caf50] text-white px-4 py-1 rounded-b-lg text-sm font-bold">الأكثر شعبية</div>
              <h3 className="text-2xl font-bold text-[#2e7d32] mb-5">المحترف ⭐</h3>
              <div className="text-5xl font-bold text-[#4caf50] mb-2.5">299 <span className="text-lg text-[#666] font-normal">ريال/شهر</span></div>
              <ul className="space-y-3 my-8 text-right">
                {[
                  "100 كلمة مفتاحية",
                  "تحديثات يومية",
                  "5 مواقع",
                  "تقارير مخصصة",
                  "API وصول"
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#555] border-b border-[#f0f0f0] pb-3 last:border-0">
                    <Check className="w-5 h-5 text-[#4caf50]" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-gradient-to-r from-[#8bc34a] to-[#4caf50] text-white py-6 rounded-full font-bold text-lg" asChild>
                <a href="/pricing">ابدأ الآن</a>
              </Button>
            </div>

            <div className="bg-gradient-to-br from-white to-[#f9fbe7] p-10 rounded-[25px] text-center border-2 border-transparent hover:border-[#4caf50] hover:-translate-y-2 hover:shadow-[0_15px_40px_rgba(76,175,80,0.2)] transition-all">
              <h3 className="text-2xl font-bold text-[#2e7d32] mb-5">المؤسسات</h3>
              <div className="text-5xl font-bold text-[#4caf50] mb-2.5">599 <span className="text-lg text-[#666] font-normal">ريال/شهر</span></div>
              <ul className="space-y-3 my-8 text-right">
                {[
                  "500 كلمة مفتاحية",
                  "مواقع غير محدودة",
                  "مدير حساب مخصص",
                  "دعم 24/7"
                ].map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-[#555] border-b border-[#f0f0f0] pb-3 last:border-0">
                    <Check className="w-5 h-5 text-[#4caf50]" />
                    {feat}
                  </li>
                ))}
              </ul>
              <Button variant="outline" className="w-full border-2 border-[#4caf50] text-[#4caf50] hover:bg-[#4caf50] hover:text-white py-6 rounded-full font-bold text-lg" asChild>
                <a href="/contact">تواصل معنا</a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-gradient-to-br from-[#f9fbe7] to-[#f1f8e9]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-[700px] mx-auto mb-16">
            <span className="inline-block bg-white text-[#2e7d32] px-5 py-2 rounded-full text-sm font-semibold mb-4 shadow-sm">
              الأسئلة الشائعة
            </span>
            <h2 className="text-4xl lg:text-[42px] font-bold text-[#2e7d32] mb-5">
              لديك أسئلة؟ لدينا إجابات
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {[
              { q: "كم عدد الكلمات المفتاحية التي يمكنني تتبعها؟", a: "يعتمد ذلك على الباقة التي تختارها. نبدأ من 25 كلمة في باقة المبتدئ وصولاً إلى 500 كلمة في باقة المؤسسات." },
              { q: "هل يمكنني تجربة الخدمة مجاناً؟", a: "نعم! نوفر فترة تجريبية مجانية لمدة 14 يوم لجميع الباقات بدون الحاجة لبطاقة ائتمان." },
              { q: "كم مرة يتم تحديث البيانات؟", a: "يتم تحديث جميع الكلمات المفتاحية تلقائياً كل 24 ساعة، مع إمكانية التحديث الفوري عند الطلب بشكل غير محدود." },
              { q: "هل تدعمون البحث المحلي في الدول العربية؟", a: "نعم، ندعم بشكل كامل جميع الدول العربية ودول الخليج مع إمكانية تحديد الموقع الجغرافي بدقة." },
              { q: "هل يمكنني إلغاء الاشتراك في أي وقت؟", a: "بالتأكيد! يمكنك إلغاء اشتراكك في أي وقت من لوحة التحكم بنقرة واحدة، بدون أي رسوم إضافية." },
              { q: "هل تقدمون خصومات للمؤسسات والوكالات؟", a: "نعم، لدينا باقات مخصصة للمؤسسات والوكالات بأسعار تنافسية. تواصل معنا للحصول على عرض خاص." }
            ].map((faq, i) => (
              <Accordion key={i} type="single" collapsible>
                <AccordionItem value="item-1" className="bg-white rounded-[15px] shadow-[0_3px_15px_rgba(0,0,0,0.08)] border-0 overflow-hidden">
                  <AccordionTrigger className="px-8 py-6 text-right hover:bg-[#f5f5f5] text-lg font-semibold text-[#2e7d32] hover:no-underline [&[data-state=open]>svg]:rotate-180">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="px-8 pb-6 text-[#666] leading-[1.8] text-base">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center text-white relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2e7d32, #4caf50)' }}>
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)' }}
        />
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">جاهز لتحسين ترتيب موقعك؟</h2>
          <p className="text-xl lg:text-2xl opacity-90 mb-10 max-w-2xl mx-auto">انضم إلى مئات المسوقين الذين يستخدمون ترتيب لتحقيق نتائج مذهلة</p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button
              size="lg"
              className="bg-white text-[#4caf50] hover:bg-white/90 hover:scale-105 shadow-xl text-xl px-12 py-8 rounded-full font-bold transition-all"
              asChild
            >
              <a href="/register" className="flex items-center gap-2">
                <Rocket className="w-6 h-6" />
                ابدأ تجربتك المجانية الآن
              </a>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-transparent border-2 border-white/50 text-white hover:bg-white/10 hover:border-white text-xl px-12 py-8 rounded-full font-bold transition-all"
              asChild
            >
              <a href="/contact" className="flex items-center gap-2">
                <div className="w-6 h-6"><span className="text-xl">💬</span></div>
                تحدث مع فريق المبيعات
              </a>
            </Button>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
    </svg>
  )
}
