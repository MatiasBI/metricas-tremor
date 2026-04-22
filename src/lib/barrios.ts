export const BARRIOS_BY_COMUNA: Record<string, string[]> = {
  C01: [
    "Constitucion",
    "Monserrat",
    "Puerto Madero",
    "Retiro",
    "San Nicolas",
    "San Telmo",
  ],
  C02: ["Recoleta"],
  C03: ["Balvanera", "San Cristobal"],
  C04: ["Barracas", "Boca", "Nueva Pompeya", "Parque Patricios"],
  C05: ["Almagro", "Boedo"],
  C06: ["Caballito"],
  C07: ["Flores", "Parque Chacabuco"],
  C08: ["Villa Lugano", "Villa Riachuelo", "Villa Soldati"],
  C09: ["Liniers", "Mataderos", "Parque Avellaneda"],
  C10: [
    "Floresta",
    "Monte Castro",
    "Velez Sarsfield",
    "Versalles",
    "Villa Luro",
    "Villa Real",
  ],
  C11: [
    "Villa del Parque",
    "Villa Devoto",
    "Villa General Mitre",
    "Villa Santa Rita",
  ],
  C12: ["Coghlan", "Saavedra", "Villa Pueyrredon", "Villa Urquiza"],
  C13: ["Belgrano", "Colegiales", "Nunez"],
  C14: ["Palermo"],
  C15: [
    "Agronomia",
    "Chacarita",
    "La Paternal",
    "Parque Chas",
    "Villa Crespo",
    "Villa Ortuzar",
  ],
}

export function getBarriosForComuna(comuna: string) {
  return BARRIOS_BY_COMUNA[comuna] ?? []
}
