import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Phone, MapPin, Share2, CheckCircle2, Send, Twitter, Linkedin, Facebook, Instagram } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
  name: z.string().min(2, "يجب أن يحتوي الاسم على حرفين على الأقل"),
  email: z.string().email("يرجى إدخال بريد إلكتروني صحيح"),
  phone: z.string().optional(),
  subject: z.string().min(1, "يرجى اختيار الموضوع"),
  message: z.string().min(10, "يجب أن تحتوي الرسالة على 10 أحرف على الأقل"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function Contact() {
  const [showSuccess, setShowSuccess] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (data: ContactFormValues) => {
    console.log("Form submitted:", data);
    setShowSuccess(true);

    toast({
      title: "تم الإرسال بنجاح!",
      description: "شكراً لتواصلك معنا. سنرد عليك في أقرب وقت ممكن.",
      duration: 5000,
    });

    form.reset();

    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const faqs = [
    {
      question: "ما هو وقت الاستجابة المتوقع؟",
      answer: "نحن نسعى للرد على جميع الاستفسارات خلال 24 ساعة في أيام العمل. للدعم الفني العاجل، عملاء الباقات المدفوعة يحصلون على أولوية في الاستجابة خلال 2-4 ساعات.",
    },
    {
      question: "هل يمكنني حجز موعد مكالمة مع فريق المبيعات؟",
      answer: "نعم بالتأكيد! يمكنك طلب موعد مكالمة من خلال نموذج الاتصال وتحديد \"شراكة تجارية\" أو \"الأسعار والباقات\" كموضوع، وسيتواصل معك أحد أعضاء فريقنا لتحديد موعد مناسب.",
    },
    {
      question: "هل تقدمون دعماً باللغة العربية؟",
      answer: "نعم، فريق الدعم لدينا يتحدث العربية بطلاقة. يمكنك التواصل معنا باللغة العربية عبر البريد الإلكتروني أو الهاتف أو نموذج الاتصال.",
    },
    {
      question: "كيف يمكنني إرسال طلب للحصول على عرض مخصص للمؤسسات؟",
      answer: "يمكنك إرسال طلب من خلال نموذج الاتصال واختيار \"الأسعار والباقات\" كموضوع، أو مراسلتنا مباشرة على sales@tartib.com. سيقوم فريق المبيعات بإعداد عرض مخصص يناسب احتياجاتك.",
    },
    {
      question: "هل يمكن زيارة مكتبكم شخصياً؟",
      answer: "نعم، نرحب بزيارتكم! يُرجى حجز موعد مسبق من خلال التواصل معنا عبر الهاتف أو البريد الإلكتروني لضمان توفر الفريق المناسب لاستقبالكم.",
    },
  ];

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <section
        className="relative overflow-hidden py-24 md:py-32 text-center"
        style={{
          background: `linear-gradient(135deg, rgba(139, 195, 74, 0.85) 0%, rgba(76, 175, 80, 0.90) 100%), url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2000&q=80')`,
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
          <h1
            className="text-4xl md:text-5xl lg:text-[52px] font-bold text-white mb-5"
            style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}
          >
            يسعدنا التواصل معك!
          </h1>
          <p
            className="text-xl md:text-[22px] text-white max-w-2xl mx-auto font-normal"
            style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.2)' }}
          >
            أخبرنا كيف يمكن لترتيب مساعدتك وسنتواصل معك قريباً
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-gradient-to-br from-white to-[#f8f9fa]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 max-w-[1100px] mx-auto">
            {/* Contact Form */}
            <div className="bg-white p-8 md:p-12 rounded-[20px] shadow-[0_5px_25px_rgba(0,0,0,0.08)]">
              <h2 className="text-[32px] text-[#2e7d32] font-bold mb-8">
                أرسل لنا رسالة
              </h2>

              {showSuccess && (
                <div
                  className="bg-gradient-to-r from-[#c8e6c9] to-[#a5d6a7] text-[#1b5e20] p-5 rounded-[10px] flex items-center gap-3 font-semibold mb-6 animate-in slide-in-from-top"
                >
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  <span>تم إرسال رسالتك بنجاح! سنتواصل معك قريباً.</span>
                </div>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#2e7d32] font-semibold text-base">
                            الاسم الكامل *
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="أدخل اسمك الكامل"
                              {...field}
                              className="border-2 border-[#e0e0e0] rounded-[10px] p-5 h-auto text-base focus-visible:ring-0 focus-visible:border-[#4caf50] focus-visible:shadow-[0_0_0_3px_rgba(76,175,80,0.1)] transition-all bg-[#fafafa] focus:bg-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#2e7d32] font-semibold text-base">
                            البريد الإلكتروني *
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="example@email.com"
                              {...field}
                              className="border-2 border-[#e0e0e0] rounded-[10px] p-5 h-auto text-base focus-visible:ring-0 focus-visible:border-[#4caf50] focus-visible:shadow-[0_0_0_3px_rgba(76,175,80,0.1)] transition-all bg-[#fafafa] focus:bg-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#2e7d32] font-semibold text-base">
                            رقم الهاتف
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="tel"
                              placeholder="+966 xx xxx xxxx"
                              {...field}
                              className="border-2 border-[#e0e0e0] rounded-[10px] p-5 h-auto text-base focus-visible:ring-0 focus-visible:border-[#4caf50] focus-visible:shadow-[0_0_0_3px_rgba(76,175,80,0.1)] transition-all bg-[#fafafa] focus:bg-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#2e7d32] font-semibold text-base">
                            الموضوع *
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="border-2 border-[#e0e0e0] rounded-[10px] p-5 h-auto text-base focus:ring-0 focus:border-[#4caf50] focus:shadow-[0_0_0_3px_rgba(76,175,80,0.1)] transition-all bg-[#fafafa] focus:bg-white">
                                <SelectValue placeholder="اختر الموضوع" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="general">استفسار عام</SelectItem>
                              <SelectItem value="support">دعم فني</SelectItem>
                              <SelectItem value="pricing">الأسعار والباقات</SelectItem>
                              <SelectItem value="feature">طلب ميزة جديدة</SelectItem>
                              <SelectItem value="partnership">شراكة تجارية</SelectItem>
                              <SelectItem value="other">أخرى</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#2e7d32] font-semibold text-base">
                          رسالتك *
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="اكتب رسالتك هنا..."
                            className="min-h-[150px] resize-y border-2 border-[#e0e0e0] rounded-[10px] p-5 text-base focus-visible:ring-0 focus-visible:border-[#4caf50] focus-visible:shadow-[0_0_0_3px_rgba(76,175,80,0.1)] transition-all bg-[#fafafa] focus:bg-white"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#8bc34a] to-[#4caf50] hover:translate-y-[-2px] hover:shadow-[0_5px_20px_rgba(76,175,80,0.4)] text-white py-6 text-lg font-bold rounded-xl transition-all duration-300"
                  >
                    <Send className="ml-2 w-5 h-5" />
                    إرسال الرسالة
                  </Button>
                </form>
              </Form>
            </div>

            {/* Contact Info Cards */}
            <div className="space-y-8 flex flex-col">
              <div className="bg-white p-8 rounded-[20px] shadow-[0_5px_25px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-transform duration-300">
                <div className="w-[60px] h-[60px] bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] rounded-full flex items-center justify-center mb-5 mx-auto lg:mx-0">
                  <Mail className="w-7 h-7 text-[#4caf50]" />
                </div>
                <h3 className="text-[22px] font-bold text-[#2e7d32] mb-2.5">
                  البريد الإلكتروني
                </h3>
                <p className="text-[#666] leading-relaxed text-base mb-2.5">
                  راسلنا في أي وقت وسنرد خلال 24 ساعة
                </p>
                <a
                  href="mailto:info@tartib.com"
                  className="text-[#4caf50] font-semibold hover:text-[#2e7d32] transition-colors block mb-1 text-base"
                >
                  info@tartib.com
                </a>
                <a
                  href="mailto:support@tartib.com"
                  className="text-[#4caf50] font-semibold hover:text-[#2e7d32] transition-colors block text-base"
                >
                  support@tartib.com
                </a>
              </div>

              <div className="bg-white p-8 rounded-[20px] shadow-[0_5px_25px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-transform duration-300">
                <div className="w-[60px] h-[60px] bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] rounded-full flex items-center justify-center mb-5 mx-auto lg:mx-0">
                  <Phone className="w-7 h-7 text-[#4caf50]" />
                </div>
                <h3 className="text-[22px] font-bold text-[#2e7d32] mb-2.5">
                  الهاتف
                </h3>
                <p className="text-[#666] leading-relaxed text-base mb-2.5">
                  تواصل معنا عبر الهاتف من السبت إلى الخميس
                </p>
                <a
                  href="tel:+966123456789"
                  className="text-[#4caf50] font-semibold hover:text-[#2e7d32] transition-colors block mb-2 text-base"
                  dir="ltr"
                >
                  +966 12 345 6789
                </a>
                <p className="text-sm text-[#999]">
                  من 9 صباحاً حتى 6 مساءً (توقيت الرياض)
                </p>
              </div>

              <div className="bg-white p-8 rounded-[20px] shadow-[0_5px_25px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-transform duration-300">
                <div className="w-[60px] h-[60px] bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] rounded-full flex items-center justify-center mb-5 mx-auto lg:mx-0">
                  <MapPin className="w-7 h-7 text-[#4caf50]" />
                </div>
                <h3 className="text-[22px] font-bold text-[#2e7d32] mb-2.5">
                  العنوان
                </h3>
                <p className="text-[#666] leading-relaxed text-base mb-2.5">
                  مقرنا الرئيسي في الرياض، المملكة العربية السعودية
                </p>
                <p className="text-[#333]">
                  طريق الملك فهد، الرياض 12271<br />
                  المملكة العربية السعودية
                </p>
              </div>

              <div className="bg-white p-8 rounded-[20px] shadow-[0_5px_25px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-transform duration-300">
                <div className="w-[60px] h-[60px] bg-gradient-to-br from-[#e8f5e9] to-[#c8e6c9] rounded-full flex items-center justify-center mb-5 mx-auto lg:mx-0">
                  <Share2 className="w-7 h-7 text-[#4caf50]" />
                </div>
                <h3 className="text-[22px] font-bold text-[#2e7d32] mb-2.5">
                  تابعنا على وسائل التواصل
                </h3>
                <p className="text-[#666] leading-relaxed text-base mb-5">
                  ابقَ على اطلاع بآخر التحديثات والنصائح
                </p>
                <div className="flex gap-4">
                  <a
                    href="#"
                    className="w-[45px] h-[45px] bg-gradient-to-r from-[#8bc34a] to-[#4caf50] rounded-full flex items-center justify-center text-white hover:-translate-y-[3px] hover:shadow-[0_5px_15px_rgba(76,175,80,0.4)] transition-all duration-300"
                    title="تويتر"
                  >
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-[45px] h-[45px] bg-gradient-to-r from-[#8bc34a] to-[#4caf50] rounded-full flex items-center justify-center text-white hover:-translate-y-[3px] hover:shadow-[0_5px_15px_rgba(76,175,80,0.4)] transition-all duration-300"
                    title="لينكدإن"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-[45px] h-[45px] bg-gradient-to-r from-[#8bc34a] to-[#4caf50] rounded-full flex items-center justify-center text-white hover:-translate-y-[3px] hover:shadow-[0_5px_15px_rgba(76,175,80,0.4)] transition-all duration-300"
                    title="فيسبوك"
                  >
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a
                    href="#"
                    className="w-[45px] h-[45px] bg-gradient-to-r from-[#8bc34a] to-[#4caf50] rounded-full flex items-center justify-center text-white hover:-translate-y-[3px] hover:shadow-[0_5px_15px_rgba(76,175,80,0.4)] transition-all duration-300"
                    title="إنستجرام"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-[#f9fbe7] to-[#f1f8e9]">
        <div className="container mx-auto px-4">
          <div className="max-w-[900px] mx-auto">
            <h2 className="text-[40px] font-bold text-center text-[#2e7d32] mb-5">
              أسئلة شائعة حول التواصل
            </h2>
            <p className="text-center text-lg text-[#666] mb-14">
              لم تجد إجابتك؟ تواصل معنا وسنساعدك
            </p>

            <Accordion type="single" collapsible className="space-y-5">
              {faqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="bg-white rounded-[15px] shadow-[0_3px_15px_rgba(0,0,0,0.08)] border-0 overflow-hidden"
                >
                  <AccordionTrigger
                    className="px-8 py-6 text-right hover:bg-[#f5f5f5] text-lg font-semibold text-[#2e7d32] hover:no-underline [&[data-state=open]>svg]:rotate-180"
                  >
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent
                    className="px-8 pb-6 text-[#666] leading-[1.8] text-base"
                  >
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
