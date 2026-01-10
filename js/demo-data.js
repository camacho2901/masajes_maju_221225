// Datos de demostración para modo offline
const profilesData = {
    profiles: [
        {
            id: 1,
            name: "Sofía",
            category: "tantrico",
            tags: ["Masaje Tántrico", "Sensitivo", "Profesional"],
            experience: "2 años",
            rating: 4.9,
            avatar: "—",
            description: "Masajista profesional especializada en técnicas tántricas y masaje sensitivo.",
            portfolio: ["Masaje tántrico", "Masaje sensitivo", "Relajación profunda"],
            location: "Santa Cruz, Bolivia",
            availability: "full-time",
            featured: true,
            photo: null
        },
        {
            id: 2,
            name: "Valentina",
            category: "tantrico",
            tags: ["Masaje Tántrico", "Sensitivo", "Experta"],
            experience: "3 años",
            rating: 4.8,
            avatar: "—",
            description: "Especialista en masajes tántricos sensitivos para máxima relajación.",
            portfolio: ["Masaje tántrico", "Masaje sensitivo", "Experiencia completa"],
            location: "Santa Cruz, Bolivia",
            availability: "flexible",
            featured: true,
            photo: null
        },
        {
            id: 3,
            name: "Carolina",
            category: "tantrico",
            tags: ["Masaje Tántrico", "Sensitivo", "Discreta"],
            experience: "1 año",
            rating: 4.7,
            avatar: "—",
            description: "Masajista joven y profesional, especializada en masajes tántricos sensitivos.",
            portfolio: ["Masaje tántrico", "Masaje sensitivo", "Ambiente acogedor"],
            location: "Santa Cruz, Bolivia",
            availability: "part-time",
            featured: false,
            photo: null
        }
    ]
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = profilesData;
}

const DEMO_DATA = profilesData;
