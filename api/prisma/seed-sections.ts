
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sections = [
    {
        key: "hero",
        title: "Hero / প্রধান পরিচিতি",
        sortOrder: 1,
        content: {
            headingBn: "অধ্যাপক ডা. মুহাম্মদ আব্দুল্লাহেল কাফি",
            headingEn: "Professor Dr. Muhammad Abdullahel Kafi",
            subtitleBn: "গ্যাস্ট্রোএন্টারোলজি বিশেষজ্ঞ",
            subtitleEn: "Gastroenterology Specialist",
            bodyBn: "",
            bodyEn: "",
            ctaTextBn: "যোগাযোগ করুন",
            ctaTextEn: "Contact",
            ctaUrl: "",
            imageUrl: "",
        },
    },
    {
        key: "about",
        title: "About / চিকিৎসক পরিচিতি",
        sortOrder: 2,
        content: {
            headingBn: "চিকিৎসক পরিচিতি",
            headingEn: "About the Doctor",
            bodyBn: "",
            bodyEn: "",
            imageUrl: "",
        },
    },
    {
        key: "qualifications",
        title: "Qualifications / শিক্ষাগত যোগ্যতা",
        sortOrder: 3,
        content: {
            headingBn: "শিক্ষাগত যোগ্যতা",
            headingEn: "Qualifications",
            items: [
                {
                    titleBn: "MBBS",
                    titleEn: "MBBS",
                    descriptionBn: "",
                    descriptionEn: "",
                    metaBn: "",
                    metaEn: "",
                },
                {
                    titleBn: "MCPS (Medicine)",
                    titleEn: "MCPS (Medicine)",
                    descriptionBn: "",
                    descriptionEn: "",
                    metaBn: "",
                    metaEn: "",
                },
                {
                    titleBn: "FCPS (Gastroenterology)",
                    titleEn: "FCPS (Gastroenterology)",
                    descriptionBn: "",
                    descriptionEn: "",
                    metaBn: "",
                    metaEn: "",
                },
            ],
        },
    },
    {
        key: "experience",
        title: "Experience / পেশাগত অভিজ্ঞতা",
        sortOrder: 4,
        content: {
            headingBn: "পেশাগত অভিজ্ঞতা",
            headingEn: "Professional Experience",
            items: [
                {
                    titleBn: "অধ্যাপক, গ্যাস্ট্রোএন্টারোলজি বিভাগ",
                    titleEn: "Professor, Department of Gastroenterology",
                    descriptionBn: "",
                    descriptionEn: "",
                    metaBn: "১৬ বছরের অভিজ্ঞতা",
                    metaEn: "16 years of experience",
                },
                {
                    titleBn: "সাবেক কনসালট্যান্ট",
                    titleEn: "Former Consultant",
                    descriptionBn: "ঢাকা মেডিকেল কলেজ ও হাসপাতাল",
                    descriptionEn: "Dhaka Medical College & Hospital",
                    metaBn: "",
                    metaEn: "",
                },
            ],
        },
    },
    {
        key: "specializations",
        title: "Specializations / বিশেষজ্ঞ সেবা",
        sortOrder: 5,
        content: {
            headingBn: "বিশেষজ্ঞ সেবা",
            headingEn: "Specializations",
            items: [
                {
                    titleBn: "থেরাপিউটিক এন্ডোস্কপি",
                    titleEn: "Therapeutic Endoscopy",
                    descriptionBn: "",
                    descriptionEn: "",
                    metaBn: "",
                    metaEn: "",
                },
                {
                    titleBn: "ERCP",
                    titleEn: "ERCP",
                    descriptionBn: "",
                    descriptionEn: "",
                    metaBn: "",
                    metaEn: "",
                },
                {
                    titleBn: "রেডিওলজিক্যাল ইন্টারভেনশন",
                    titleEn: "Radiological Intervention",
                    descriptionBn: "",
                    descriptionEn: "",
                    metaBn: "",
                    metaEn: "",
                },
            ],
        },
    },
    {
        key: "chambers",
        title: "Chambers / চেম্বার ও কর্মস্থল",
        sortOrder: 6,
        content: {
            headingBn: "চেম্বার ও কর্মস্থল",
            headingEn: "Chambers",
            items: [
                {
                    titleBn: "ইবনে সিনা হাসপাতাল, ধানমন্ডি",
                    titleEn: "IBN Sina Hospital, Dhanmondi",
                    descriptionBn: "",
                    descriptionEn: "",
                    metaBn: "শনিবার–বুধবার, দুপুর ১২:৩০টা–সন্ধ্যা ৬:৩০টা",
                    metaEn: "Saturday–Wednesday, 12:30 PM–6:30 PM",
                },
                {
                    titleBn: "পপুলার হাসপাতাল, ধানমন্ডি",
                    titleEn: "Popular Hospital, Dhanmondi",
                    descriptionBn: "হাউস #১৬, বীর উত্তম এম এ রব সড়ক, ঢাকা ১২০৫",
                    descriptionEn: "House #16, Bir Uttam M A Rab Sarak, Dhaka 1205",
                    metaBn: "শনিবার–বুধবার, সন্ধ্যা ৭টা–রাত ৯:৩০টা",
                    metaEn: "Saturday–Wednesday, 7:00 PM–9:30 PM",
                },
            ],
        },
    },
    {
        key: "contact",
        title: "Contact / যোগাযোগ",
        sortOrder: 7,
        content: {
            headingBn: "যোগাযোগ",
            headingEn: "Contact",
            phone: "09666 787801",
            email: "",
            addressBn: "হাউস #১৬, বীর উত্তম এম এ রব সড়ক, ধানমন্ডি, ঢাকা ১২০৫",
            addressEn: "House #16, Bir Uttam M A Rab Sarak, Dhanmondi, Dhaka 1205",
        },
    },
    {
        key: "seo",
        title: "SEO / সার্চ ইঞ্জিন সেটিংস",
        sortOrder: 8,
        content: {
            metaTitleBn: "অধ্যাপক ডা. মুহাম্মদ আব্দুল্লাহেল কাফি",
            metaTitleEn: "Professor Dr. Muhammad Abdullahel Kafi",
            metaDescriptionBn: "",
            metaDescriptionEn: "",
        },
    },
    {
        key: "branding",
        title: "Branding / ব্র্যান্ডিং",
        sortOrder: 9,
        content: {},
    },
    {
        key: "videoSection",
        title: "Videos / স্বাস্থ্য সচেতনতামূলক ভিডিও",
        sortOrder: 10,
        content: {
            headingBn: "স্বাস্থ্য সচেতনতামূলক ভিডিও",
            headingEn: "Health Awareness Videos",
            subtitleBn: "",
            subtitleEn: "",
        },
    },
];

async function main() {
    for (const section of sections) {
        await prisma.landingSection.upsert({
            where: { key: section.key },
            update: {
                title: section.title,
                sortOrder: section.sortOrder,
            },
            create: {
                key: section.key,
                title: section.title,
                sortOrder: section.sortOrder,
                enabled: true,
                draftContent: section.content,
            },
        });
    }

    console.log(`Initialized ${sections.length} landing-page sections.`);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
