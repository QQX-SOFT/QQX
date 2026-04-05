"use client";

import React, { useState, useEffect, Suspense } from "react";
import { 
    Loader2, 
    CheckCircle2, 
    ArrowRight, 
    Car, 
    ShieldCheck, 
    FileText, 
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Briefcase,
    Upload,
    FileCheck,
    Globe,
    Languages,
    BadgeCheck,
    AlertCircle,
    ChevronDown,
    Search
} from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Autocomplete } from "@react-google-maps/api";
import GoogleMapsProvider from "@/components/GoogleMapsProvider";

const translations: any = {
    DE: {
        title: "Fahrer werden",
        subtitle: "Starten Sie Ihre Karriere bei QQX. Füllen Sie das Formular aus.",
        joinFleet: "Join the Fleet",
        workPermit: "Haben Sie eine gültige Arbeitsbewilligung?",
        yes: "Ja",
        no: "Nein",
        contractType: "Wählen Sie Ihren Vertragstyp",
        personalInfo: "Persönliche Informationen",
        address: "Anschrift",
        legal: "Rechtliches",
        bank: "Bankverbindung",
        documents: "Geforderte Dokumente (PDF / Foto)",
        firstName: "Vorname",
        lastName: "Nachname",
        email: "E-Mail Adresse",
        phone: "Telefonnummer",
        birthday: "Geburtsdatum",
        placeOfBirth: "Geburtsort",
        nationality: "Staatsbürgerschaft",
        religion: "Religionszugehörigkeit",
        maritalStatus: "Familienstand",
        street: "Straße / Hausnummer",
        zip: "PLZ",
        city: "Stadt",
        ssn: "SV-Nummer (SSN)",
        taxId: "UID-Nummer (Steuer-ID)",
        gisa: "GISA-Zahl",
        check: "Prüfen",
        iban: "IBAN",
        bic: "BIC",
        upload: "Hochladen",
        change: "Ändern",
        loading: "Wird geladen...",
        uploaded: "Erfolgreich hochgeladen",
        notUploaded: "Nicht hochgeladen",
        terms: "Ich habe die Datenschutzerklärung gelesen und akzeptiere diese. Ich stimme der Verarbeitung meiner Daten zum Zwecke der Bewerbung zu.",
        submit: "Jetzt Bewerbung absenden",
        successTitle: "Bewerbung gesendet!",
        successText: "Vielen Dank für Ihr Interesse! Wir haben Ihre Unterlagen erhalten und werden diese umgehend prüfen. Unser Team wird sich in Kürze per E-Mail bei Ihnen melden.",
        backToHome: "Zurück zur Startseite",
        types: {
            ECHTER_DIENSTNEHMER: { label: "Dienstnehmer", sub: "Geregeltes Dienstverhältnis" },
            FREIER_DIENSTNEHMER: { label: "Freier Dienstnehmer", sub: "Selbstständige Basis" },
            SELBSTSTANDIG: { label: "Unternehmer (SFU)", sub: "Eigener Gewerbeschein" }
        }
    },
    EN: {
        title: "Become a Driver",
        subtitle: "Start your career with QQX. Please fill out the form.",
        joinFleet: "Join the Fleet",
        workPermit: "Do you have a valid work permit?",
        yes: "Yes",
        no: "No",
        contractType: "Select Your Contract Type",
        personalInfo: "Personal Information",
        address: "Address",
        legal: "Legal Info",
        bank: "Bank Connection",
        documents: "Required Documents (PDF / Photo)",
        firstName: "First Name",
        lastName: "Last Name",
        email: "Email Address",
        phone: "Phone Number",
        birthday: "Date of Birth",
        placeOfBirth: "Place of Birth",
        nationality: "Nationality",
        religion: "Religion",
        maritalStatus: "Marital Status",
        street: "Street / Number",
        zip: "ZIP",
        city: "City",
        ssn: "SSN (Social Security)",
        taxId: "UID (VAT Number)",
        gisa: "GISA Number",
        check: "Check",
        iban: "IBAN",
        bic: "BIC",
        upload: "Upload",
        change: "Change",
        loading: "Loading...",
        uploaded: "Successfully uploaded",
        notUploaded: "Not uploaded",
        terms: "I have read and accept the privacy policy. I agree to process my data for the application purpose.",
        submit: "Submit Application Now",
        successTitle: "Application Sent!",
        successText: "Thank you for your interest! We have received your documents and will review them immediately. Our team will contact you via email shortly.",
        backToHome: "Back to Home",
        types: {
            ECHTER_DIENSTNEHMER: { label: "Employee", sub: "Regular Employment" },
            FREIER_DIENSTNEHMER: { label: "Freelancer", sub: "Self-employed Basis" },
            SELBSTSTANDIG: { label: "Entrepreneur (SFU)", sub: "Own Business License" }
        }
    },
    AR: {
        title: "كن سائقاً",
        subtitle: "ابدأ مسيرتك المهنية مع QQX. يرجى ملء النموذج.",
        joinFleet: "انضم إلى الأسطول",
        workPermit: "هل لديك تصريح عمل ساري المفعول؟",
        yes: "نعم",
        no: "لا",
        contractType: "اختر نوع عقدك",
        personalInfo: "المعلومات الشخصية",
        address: "العنوان",
        legal: "المعلومات القانونية",
        bank: "بيانات البنك",
        documents: "المستندات المطلوبة (PDF / صور)",
        firstName: "الاسم الأول",
        lastName: "اسم العائلة",
        email: "البريد الإلكتروني",
        phone: "رقم الهاتف",
        birthday: "تاريخ الميلاد",
        placeOfBirth: "مكان الولادة",
        nationality: "الجنسية",
        religion: "الديانة (اختياري)",
        maritalStatus: "الحالة الاجتماعية",
        street: "الشارع / الرقم",
        zip: "الرمز البريدي",
        city: "المدينة",
        ssn: "رقم التأمين (SSN)",
        taxId: "رقم الضريبة (UID)",
        gisa: "رقم GISA",
        check: "تحقق",
        iban: "رقم الآيبان",
        bic: "رمز الـ BIC",
        upload: "تحميل",
        change: "تغيير",
        loading: "جارٍ التحميل...",
        uploaded: "تم التحميل بنجاح",
        notUploaded: "لم يتم التحميل",
        terms: "لقد قرأت وأوافق على سياسة الخصوصية. أوافق على معالجة بياناتي لغرض الطلب.",
        submit: "أرسل الطلب الآن",
        successTitle: "تم إرسال الطلب!",
        successText: "شكراً لاهتمامك! لقد استلمنا مستنداتك وسنقوم بمراجعتها فوراً. سيتواصل معك فريقنا عبر البريد الإلكتروني قريباً.",
        backToHome: "العودة للرئيسية",
        types: {
            ECHTER_DIENSTNEHMER: { label: "موظف", sub: "علاقة توظيف منتظمة" },
            FREIER_DIENSTNEHMER: { label: "عامل حر", sub: "أساس العمل الحر" },
            SELBSTSTANDIG: { label: "رائد أعمال (SFU)", sub: "ترخيص تجاري خاص" }
        }
    }
};

const SearchableSelect = ({ label, value, options, onChange, isRtl }: any) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [open, setOpen] = useState(false);

    const filtered = options.filter((o: any) => 
        o.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="relative">
            <button 
                type="button"
                onClick={() => setOpen(!open)}
                className={cn(
                    "w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold text-slate-900 flex justify-between items-center transition-all",
                    open && "border-blue-500 ring-4 ring-blue-500/5",
                    isRtl ? "text-right flex-row-reverse" : "text-left flex-row"
                )}
            >
                <span className={cn(!value && "text-slate-400")}>{value || label}</span>
                <ChevronDown size={16} className={cn("transition-transform opacity-30", open && "rotate-180 opacity-100 text-blue-500")} />
            </button>
            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className={cn(
                        "absolute z-50 top-[110%] left-0 right-0 bg-white border border-slate-100 rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200",
                        isRtl ? "text-right" : "text-left"
                    )}>
                        <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex items-center gap-3">
                            <Search size={14} className="text-slate-300" />
                            <input 
                                className="w-full bg-transparent border-none outline-none text-xs font-bold placeholder:text-slate-300"
                                placeholder={isRtl ? "...بحث" : "Suchen..."}
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="max-h-64 overflow-y-auto overscroll-contain custom-scrollbar">
                            {filtered.map((o: any) => (
                                <button
                                    key={o.code}
                                    type="button"
                                    onClick={() => {
                                        onChange(o.name);
                                        setOpen(false);
                                        setSearchTerm("");
                                    }}
                                    className={cn(
                                        "w-full p-5 text-xs font-bold transition-colors border-b border-slate-50/50 last:border-0 hover:bg-blue-50 hover:text-blue-600",
                                        value === o.name ? "bg-blue-50 text-blue-600" : "text-slate-600",
                                        isRtl ? "text-right" : "text-left"
                                    )}
                                >
                                    {o.name}
                                </button>
                            ))}
                            {filtered.length === 0 && (
                                <div className="p-10 text-center space-y-2">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Keine Treffer</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export function BecomeADriverForm() {
    const [lang, setLang] = useState<"DE" | "EN" | "AR">("DE");
    const t = translations[lang];
    const isRtl = lang === "AR";

    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [autocomplete, setAutocomplete] = useState<any>(null);
    const [countries, setCountries] = useState<{ code: string, name: string }[]>([]);

    useEffect(() => {
        const fetchCountries = async () => {
            try {
                const { data } = await api.get('/applications/countries');
                setCountries(data);
            } catch (e) {
                console.error("Failed to fetch countries", e);
            }
        };
        fetchCountries();
    }, []);

    const onPlaceChanged = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            let route = "";
            let streetNumber = "";
            let postalCode = "";
            let locality = "";

            place.address_components?.forEach((c: any) => {
                const types = c.types;
                if (types.includes("route")) route = c.long_name;
                if (types.includes("street_number")) streetNumber = c.long_name;
                if (types.includes("postal_code")) postalCode = c.long_name;
                if (types.includes("locality")) {
                    locality = c.long_name;
                } else if (!locality && types.includes("administrative_area_level_2")) {
                    locality = c.long_name;
                }
            });

            setFormData((prev: any) => ({
                ...prev,
                street: route ? `${route} ${streetNumber}` : `${place.name || ""}`,
                zip: postalCode,
                city: locality
            }));
        }
    };
    const [formData, setFormData] = useState<any>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        birthday: "",
        placeOfBirth: "",
        nationality: "",
        religion: "",
        maritalStatus: "",
        employmentType: "ECHTER_DIENSTNEHMER",
        street: "",
        zip: "",
        city: "",
        ssn: "",
        taxId: "",
        gisaNumber: "",
        hasWorkPermit: true,
        idCardUrl: "",
        licenseUrl: "",
        meldezettelUrl: "",
        eCardUrl: "",
        greyCardUrl: "",
        gisaExtractUrl: "",
        svsConfirmationUrl: "",
        businessRegUrl: "",
        iban: "",
        bic: "",
        acceptedTerms: false,
    });

    const [uploadingField, setUploadingField] = useState<string | null>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingField(field);
        const fData = new FormData();
        fData.append("file", file);

        try {
            const { data } = await api.post("/upload", fData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setFormData((prev: any) => ({ ...prev, [field]: data.url }));
        } catch (e) {
            alert(lang === "AR" ? "فشل التحميل" : (lang === "EN" ? "Upload failed" : "Upload fehlgeschlagen."));
        } finally {
            setUploadingField(null);
        }
    };

    const docRequirements: any = {
        ECHTER_DIENSTNEHMER: [
            { id: "idCardUrl", label: "Ausweis / Reisepass", required: true },
            { id: "licenseUrl", label: "Führerschein B", required: true },
            { id: "meldezettelUrl", label: "Meldezettel", required: true },
            { id: "eCardUrl", label: "e-Card", required: true },
        ],
        FREIER_DIENSTNEHMER: [
            { id: "idCardUrl", label: "Ausweis / Reisepass", required: true },
            { id: "licenseUrl", label: "Führerschein B", required: true },
            { id: "meldezettelUrl", label: "Meldezettel", required: true },
            { id: "eCardUrl", label: "e-Card", required: true },
            { id: "greyCardUrl", label: "Graue Karte / Zulassung", required: true },
            { id: "svsConfirmationUrl", label: "SVS Bestätigung", required: true },
        ],
        SELBSTSTANDIG: [
            { id: "idCardUrl", label: "Ausweis / Reisepass", required: true },
            { id: "licenseUrl", label: "Führerschein B", required: true },
            { id: "meldezettelUrl", label: "Meldezettel", required: true },
            { id: "eCardUrl", label: "e-Card", required: true },
            { id: "greyCardUrl", label: "Graue Karte / Zulassung", required: true },
            { id: "businessRegUrl", label: "Gewerbeschein", required: true },
            { id: "gisaExtractUrl", label: "GISA-Auszug", required: true },
            { id: "svsConfirmationUrl", label: "SVS Bestätigung", required: true },
        ]
    };

    const [checkingGisa, setCheckingGisa] = useState(false);
    const [gisaResult, setGisaResult] = useState<any>(null);

    const [checkingVat, setCheckingVat] = useState(false);
    const [vatResult, setVatResult] = useState<any>(null);

    const checkVat = async () => {
        if (!formData.taxId) return alert(lang === "AR" ? "رقم UID مفقود!" : (lang === "EN" ? "UID missing!" : "UID-Nummer fehlt!"));
        setCheckingVat(true);
        try {
            const { data } = await api.post("/vat/validate", { vatNumber: formData.taxId });
            setVatResult(data);
        } catch (e) {
            setVatResult({ valid: false });
        } finally {
            setCheckingVat(false);
        }
    };

    const checkGisa = async () => {
        if (!formData.gisaNumber) return alert(lang === "AR" ? "رقم GISA مفقود!" : (lang === "EN" ? "GISA number missing!" : "GISA-Zahl fehlt!"));
        setCheckingGisa(true);
        try {
            const { data } = await api.post("/gisa/validate", { 
                gisaNumber: formData.gisaNumber,
                name: formData.lastName || formData.firstName 
            });
            setGisaResult(data);
        } catch (e) {
            setGisaResult({ valid: false });
        } finally {
            setCheckingGisa(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.post("/applications", formData);
            setSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            alert(lang === "AR" ? "فشل إرسال الطلب" : (lang === "EN" ? "Failed to send application" : "Fehler beim Senden der Bewerbung."));
        } finally {
            setSubmitting(false);
        }
    };

    if (success) {
        return (
            <div className={cn("min-h-screen bg-slate-50 flex items-center justify-center p-6", isRtl ? "text-right" : "text-left")} dir={isRtl ? "rtl" : "ltr"}>
                <div className="max-w-xl w-full bg-white p-12 rounded-[3rem] shadow-2xl border border-slate-100 text-center space-y-8 animate-in zoom-in-95 duration-500">
                    <div className="w-24 h-24 bg-green-50 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="text-green-500" size={48} />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4">{t.successTitle}</h1>
                        <p className="text-slate-500 font-medium leading-relaxed">{t.successText}</p>
                    </div>
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition shadow-xl"
                    >
                        {t.backToHome}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 py-20 px-6 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]" dir={isRtl ? "rtl" : "ltr"}>
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Language Switcher */}
                {/* Language switcher removed for German-only enforcement */}

                {/* Header */}
                <header className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
                        <Car size={14} />
                        {t.joinFleet}
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight">{t.title}</h1>
                    <p className="text-slate-500 font-medium max-w-lg mx-auto">{t.subtitle}</p>
                </header>

                <form onSubmit={handleSubmit} className="bg-white rounded-[3.5rem] p-8 lg:p-16 border border-slate-200 shadow-2xl space-y-12">
                    
                    {/* Work Permit Section */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-900 rounded-xl"><BadgeCheck size={18} className="text-white" /></div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.workPermit}</h3>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, hasWorkPermit: true})}
                                className={cn(
                                    "flex-1 py-6 rounded-[2rem] border-2 font-black text-[10px] uppercase tracking-widest transition-all",
                                    formData.hasWorkPermit ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-100 bg-white text-slate-400"
                                )}
                            >
                                {t.yes}
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({...formData, hasWorkPermit: false})}
                                className={cn(
                                    "flex-1 py-6 rounded-[2rem] border-2 font-black text-[10px] uppercase tracking-widest transition-all",
                                    !formData.hasWorkPermit ? "border-red-600 bg-red-50 text-red-600" : "border-slate-100 bg-white text-slate-400"
                                )}
                            >
                                {t.no}
                            </button>
                        </div>
                        {!formData.hasWorkPermit && (
                            <div className="p-6 bg-red-50 border border-red-100 rounded-3xl flex items-center gap-4 animate-in slide-in-from-top-4">
                                <AlertCircle className="text-red-500" size={24} />
                                <p className="text-[10px] font-black uppercase text-red-600 tracking-widest leading-relaxed">
                                    {lang === "DE" ? "Ohne gültige Arbeitsbewilligung können wir Ihre Bewerbung leider nicht bearbeiten." : 
                                     lang === "EN" ? "Without a valid work permit, we cannot process your application." :
                                     "بدون تصريح عمل ساري المفعول، لا يمكننا معالجة طلبك."}
                                </p>
                            </div>
                        )}
                    </section>
                    
                    {/* Employment Type Selector */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-900 rounded-xl"><Briefcase size={18} className="text-white" /></div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.contractType}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {Object.keys(t.types).map((typeId) => (
                                <button
                                    key={typeId}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, employmentType: typeId })}
                                    className={cn(
                                        "p-6 rounded-[2rem] border-2 transition-all duration-300",
                                        isRtl ? "text-right" : "text-left",
                                        formData.employmentType === typeId 
                                            ? "border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-500/10 ring-4 ring-blue-500/5 scale-[1.02]" 
                                            : "border-slate-100 bg-white hover:border-slate-200"
                                    )}
                                >
                                    <p className={cn("font-black text-sm uppercase mb-1", formData.employmentType === typeId ? "text-blue-600" : "text-slate-900")}>{t.types[typeId].label}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase leading-tight">{t.types[typeId].sub}</p>
                                </button>
                            ))}
                        </div>
                    </section>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Personal Info */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-900 rounded-xl"><User size={18} className="text-white" /></div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.personalInfo}</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder={t.firstName} required className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                                    <input placeholder={t.lastName} required className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                                </div>
                                <div className="relative text-black">
                                    <Mail className={cn("absolute top-5 text-slate-300", isRtl ? "right-5" : "left-5")} size={18} />
                                    <input type="email" placeholder={t.email} required className={cn("w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold", isRtl ? "pr-14" : "pl-14")} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                </div>
                                <div className="relative text-black">
                                    <Phone className={cn("absolute top-5 text-slate-300", isRtl ? "right-5" : "left-5")} size={18} />
                                    <input placeholder={t.phone} required className={cn("w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold", isRtl ? "pr-14" : "pl-14")} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <input type="date" required className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold text-slate-500 uppercase text-[10px] tracking-widest" value={formData.birthday} onChange={e => setFormData({ ...formData, birthday: e.target.value })} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input 
                                        placeholder={t.placeOfBirth} 
                                        className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" 
                                        value={formData.placeOfBirth} 
                                        onChange={e => setFormData({ ...formData, placeOfBirth: e.target.value })} 
                                        required 
                                    />
                                    <SearchableSelect 
                                        label={t.nationality}
                                        value={formData.nationality}
                                        options={countries}
                                        isRtl={isRtl}
                                        onChange={(val: string) => setFormData({ ...formData, nationality: val })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder={t.maritalStatus} required className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={formData.maritalStatus} onChange={e => setFormData({ ...formData, maritalStatus: e.target.value })} />
                                    <input placeholder={t.religion} required className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={formData.religion} onChange={e => setFormData({ ...formData, religion: e.target.value })} />
                                </div>
                            </div>
                        </section>

                        {/* Address */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-900 rounded-xl"><MapPin size={18} className="text-white" /></div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.address}</h3>
                            </div>
                            <div className="space-y-4">
                                <Autocomplete
                                    onLoad={setAutocomplete}
                                    onPlaceChanged={onPlaceChanged}
                                >
                                    <input placeholder={t.street} className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={formData.street} onChange={e => setFormData({ ...formData, street: e.target.value })} />
                                </Autocomplete>
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder={t.zip} className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={formData.zip} onChange={e => setFormData({ ...formData, zip: e.target.value })} />
                                    <input placeholder={t.city} className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Legal & Bank */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-900 rounded-xl"><FileText size={18} className="text-white" /></div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.legal}</h3>
                            </div>
                            <div className="space-y-4">
                                {(formData.employmentType === "ECHTER_DIENSTNEHMER" || formData.employmentType === "FREIER_DIENSTNEHMER") && (
                                    <input placeholder={t.ssn} required className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" value={formData.ssn} onChange={e => setFormData({ ...formData, ssn: e.target.value })} />
                                )}
                                {(formData.employmentType === "SELBSTSTANDIG" || formData.employmentType === "FREIER_DIENSTNEHMER") && (
                                    <div className="space-y-6">
                                        {/* UID Section */}
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.taxId}</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    placeholder="ATU..." 
                                                    required
                                                    className="flex-1 bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" 
                                                    value={formData.taxId} 
                                                    onChange={e => setFormData({ ...formData, taxId: e.target.value.toUpperCase() })} 
                                                />
                                                <button type="button" onClick={checkVat} disabled={checkingVat} className="px-6 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition">
                                                    {checkingVat ? <Loader2 className="animate-spin" size={16} /> : t.check}
                                                </button>
                                            </div>
                                            {vatResult && (
                                                <div className={cn("p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest", vatResult.valid ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200")}>
                                                    {vatResult.valid ? `✓ Valid: ${vatResult.name}` : "✗ Invalid"}
                                                </div>
                                            )}
                                        </div>

                                        {/* GISA Section */}
                                        <div className="space-y-3">
                                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">{t.gisa}</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    placeholder={t.gisa} 
                                                    required
                                                    className="flex-1 bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-bold" 
                                                    value={formData.gisaNumber} 
                                                    onChange={e => setFormData({ ...formData, gisaNumber: e.target.value })} 
                                                />
                                                <button type="button" onClick={checkGisa} disabled={checkingGisa} className="px-6 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-black transition">
                                                    {checkingGisa ? <Loader2 className="animate-spin" size={16} /> : t.check}
                                                </button>
                                            </div>
                                            {gisaResult && (
                                                <div className={cn("p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest", gisaResult.valid ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-red-50 text-red-700 border-red-200")}>
                                                    {gisaResult.valid ? `✓ Active: ${gisaResult.name}` : "✗ Not Found"}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-900 rounded-xl"><CreditCard size={18} className="text-white" /></div>
                                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.bank}</h3>
                            </div>
                            <div className="space-y-4">
                                <input placeholder={t.iban} required className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-mono font-bold" value={formData.iban} onChange={e => setFormData({ ...formData, iban: e.target.value.toUpperCase() })} />
                                <input placeholder={t.bic} required className="w-full bg-slate-50 p-5 rounded-2xl border border-slate-100 outline-none focus:border-blue-500 font-mono font-bold" value={formData.bic} onChange={e => setFormData({ ...formData, bic: e.target.value.toUpperCase() })} />
                            </div>
                        </section>
                    </div>

                    {/* Documents Upload Section */}
                    <section className="space-y-6 pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-slate-900 rounded-xl"><Upload size={18} className="text-white" /></div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.documents}</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {docRequirements[formData.employmentType].map((doc: any) => (
                                <div key={doc.id} className={cn(
                                    "p-6 rounded-[2rem] border-2 transition-all relative group overflow-hidden",
                                    formData[doc.id as keyof typeof formData] 
                                        ? "border-green-100 bg-green-50/30" 
                                        : "border-slate-50 bg-slate-50/50 hover:border-slate-100"
                                )}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "p-3 rounded-2xl",
                                                formData[doc.id as keyof typeof formData] ? "bg-green-100 text-green-600" : "bg-white text-slate-400"
                                            )}>
                                                {formData[doc.id as keyof typeof formData] ? <FileCheck size={20} /> : <FileText size={20} />}
                                            </div>
                                            <div className="flex flex-col">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">{doc.label}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase mt-0.5">
                                                    {formData[doc.id as keyof typeof formData] ? t.uploaded : t.notUploaded}
                                                </p>
                                            </div>
                                        </div>
                                        <label className="cursor-pointer">
                                            <input 
                                                type="file" 
                                                className="hidden" 
                                                accept="application/pdf,image/*" 
                                                onChange={(e) => handleFileUpload(e, doc.id)}
                                                disabled={uploadingField === doc.id}
                                            />
                                            <div className={cn(
                                                "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                                uploadingField === doc.id ? "bg-slate-200 text-slate-400 animate-pulse" :
                                                formData[doc.id as keyof typeof formData] ? "bg-white text-green-600 border border-green-100" : "bg-slate-900 text-white hover:scale-105"
                                            )}>
                                                {uploadingField === doc.id ? t.loading : formData[doc.id as keyof typeof formData] ? t.change : t.upload}
                                            </div>
                                        </label>
                                    </div>
                                    {doc.required && !formData[doc.id as keyof typeof formData] && (
                                        <div className="absolute top-0 right-0 p-2">
                                            <div className="w-1.5 h-1.5 bg-red-400 rounded-full" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="pt-8 border-t border-slate-100 space-y-6">
                        <div className="flex items-start gap-3 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-100">
                           <input 
                             type="checkbox" 
                             id="terms" 
                             required 
                             className="mt-1 w-5 h-5 rounded-lg border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer" 
                             checked={formData.acceptedTerms}
                             onChange={e => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                           />
                           <label htmlFor="terms" className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed cursor-pointer">
                              {t.terms}
                           </label>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || !!uploadingField || !formData.hasWorkPermit}
                            className={cn(
                                "w-full py-8 text-white rounded-3xl font-black text-sm uppercase tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-2xl",
                                !formData.hasWorkPermit ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] shadow-blue-500/20"
                            )}
                        >
                            {submitting ? <Loader2 className="animate-spin" size={24} /> : (
                                <>
                                    {t.submit}
                                    <ArrowRight size={20} className={cn(isRtl ? "rotate-180" : "")} />
                                </>
                            )}
                        </button>
                    </div>
                </form>

                <footer className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.5em] pb-20">
                    QQX Logistics Fleet Management • Austria
                </footer>
            </div>
        </div>
    );
}

export default function BecomeADriverPage() {
    return (
        <GoogleMapsProvider>
            <Suspense fallback={<div className="flex h-screen items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-500" size={48} /></div>}>
                <BecomeADriverForm />
            </Suspense>
        </GoogleMapsProvider>
    );
}
