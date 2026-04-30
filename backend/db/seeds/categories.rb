puts "📂 Creando categorías..."

categories_data = [
  {
    id: 1, name: "Lubricantes", description: "Aceites y lubricantes para todo tipo de vehículos y maquinaria", parent_id: nil,
    children: [
      {
        id: 11, name: "Aceites de Motor", description: "Aceites para motores de vehículos a nafta y diésel", parent_id: 1,
        children: [
          { id: 111, name: "Sintéticos",      description: "Aceites 100% sintéticos de alta performance",            parent_id: 11 },
          { id: 112, name: "Semisintéticos",  description: "Mezcla de base mineral y sintética, buena relación precio/calidad", parent_id: 11 },
          { id: 113, name: "Minerales",       description: "Aceites de base mineral para motores convencionales",   parent_id: 11 }
        ]
      },
      {
        id: 12, name: "Transmisión y Diferencial", description: "Lubricantes para cajas de cambios y diferenciales", parent_id: 1,
        children: [
          { id: 121, name: "Cajas Manuales",         description: "Aceites para transmisiones manuales",                        parent_id: 12 },
          { id: 122, name: "Cajas Automáticas (ATF)", description: "Fluidos para transmisiones automáticas y CVT",               parent_id: 12 }
        ]
      },
      {
        id: 13, name: "Motos", description: "Aceites especiales para motocicletas", parent_id: 1,
        children: [
          { id: 131, name: "Motores 4T", description: "Aceites para motores de cuatro tiempos",    parent_id: 13 },
          { id: 132, name: "Motores 2T", description: "Aceites para motores de dos tiempos",       parent_id: 13 }
        ]
      }
    ]
  },
  {
    id: 2, name: "Filtros", description: "Filtros de motor, aire, combustible y habitáculo", parent_id: nil,
    children: [
      { id: 21, name: "Filtros de Aceite",      description: "Filtros para el circuito de lubricación del motor", parent_id: 2 },
      { id: 22, name: "Filtros de Aire",        description: "Filtros del sistema de admisión de aire",           parent_id: 2 },
      {
        id: 23, name: "Filtros de Combustible", description: "Filtros para circuito de combustible",              parent_id: 2,
        children: [
          { id: 231, name: "Nafta",         description: "Filtros para vehículos a nafta/gasolina", parent_id: 23 },
          { id: 232, name: "Diesel / Gasoil", description: "Filtros para vehículos a gasoil/diésel", parent_id: 23 }
        ]
      },
      { id: 24, name: "Filtros de Habitáculo", description: "Filtros de aire para el interior del vehículo", parent_id: 2 }
    ]
  },
  {
    id: 3, name: "Fluidos y Químicos", description: "Refrigerantes, líquidos de freno y otros fluidos técnicos", parent_id: nil,
    children: [
      { id: 31, name: "Refrigerantes y Anticongelantes", description: "Fluidos para el sistema de refrigeración del motor",        parent_id: 3 },
      { id: 32, name: "Líquidos de Freno",               description: "Fluidos hidráulicos para el sistema de frenos",             parent_id: 3 },
      { id: 33, name: "Líquido Limpia Parabrisas",       description: "Fluidos para el limpiaparabrisas y sistema de lavado",      parent_id: 3 },
      { id: 34, name: "Fluidos de Dirección Hidráulica", description: "Aceites para la dirección hidráulica y servodirección",     parent_id: 3 },
      { id: 35, name: "Agua Destilada",                  description: "Agua desmineralizada para baterías y sistemas de refrigeración", parent_id: 3 }
    ]
  },
  {
    id: 4, name: "Aditivos", description: "Aditivos para combustible, motor y sistemas de enfriamiento", parent_id: nil,
    children: [
      { id: 41, name: "Aditivos para Combustible", description: "Mejoran la calidad y rendimiento del combustible",           parent_id: 4 },
      { id: 42, name: "Tratamientos para Motor",   description: "Aditivos que protegen y mejoran el desempeño del motor",    parent_id: 4 },
      { id: 43, name: "Limpieza de Radiadores",    description: "Productos para limpiar y mantener el sistema de enfriamiento", parent_id: 4 }
    ]
  },
  {
    id: 5, name: "Repuestos e Iluminación", description: "Baterías, bujías, lámparas y correas de distribución", parent_id: nil,
    children: [
      { id: 51, name: "Baterías", description: "Baterías de arranque para autos, camionetas y motos",       parent_id: 5 },
      { id: 52, name: "Bujías",   description: "Bujías de encendido para motores a nafta y gas",            parent_id: 5 },
      { id: 53, name: "Lámparas", description: "Lámparas halógenas, LED y xenón para iluminación vehicular", parent_id: 5 },
      { id: 54, name: "Correas",  description: "Correas de distribución, alternador y accesorios",          parent_id: 5 }
    ]
  },
  {
    id: 6, name: "Accesorios de Mantenimiento", description: "Escobillas, tapones de carter y otros accesorios de servicio", parent_id: nil,
    children: [
      { id: 61, name: "Escobillas",     description: "Escobillas limpiaparabrisas para todo clima",         parent_id: 6 },
      { id: 62, name: "Tapones y Juntas", description: "Tapones de carter, juntas de aceite y similares",   parent_id: 6 }
    ]
  },
  {
    id: 7, name: "Estética Vehicular", description: "Productos de limpieza interior, exterior y lavado de motor", parent_id: nil,
    children: [
      { id: 71, name: "Limpieza Interior", description: "Limpiadores y acondicionadores para el interior del vehículo", parent_id: 7 },
      { id: 72, name: "Limpieza Exterior", description: "Shampoos, ceras y protectores para la carrocería",             parent_id: 7 },
      { id: 73, name: "Lavado de Motor",   description: "Desengrasantes y productos para limpiar el compartimento del motor", parent_id: 7 }
    ]
  }
]

def upsert_category(attrs)
  children = attrs.delete(:children) || []
  Category.find_or_initialize_by(id: attrs[:id]).tap do |cat|
    cat.assign_attributes(attrs)
    cat.save!
  end
  children.each { |child| upsert_category(child) }
end

categories_data.each { |cat| upsert_category(cat) }

puts "   ✅ #{Category.count} categorías creadas"
