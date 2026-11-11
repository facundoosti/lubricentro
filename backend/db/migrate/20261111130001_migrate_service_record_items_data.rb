# Copia service_record_services y service_record_products a service_record_items.
# Sin IVA (iva_rate NULL) para que los total_amount históricos no cambien.
# Posición por atención: servicios primero (como se veían en pantalla), luego productos.
class MigrateServiceRecordItemsData < ActiveRecord::Migration[8.1]
  def up
    execute <<~SQL
      INSERT INTO service_record_items
        (service_record_id, position, quantity, description, unit_price, iva_rate, total,
         product_id, service_id, created_at, updated_at)
      SELECT service_record_id,
             ROW_NUMBER() OVER (PARTITION BY service_record_id ORDER BY kind, source_id) - 1,
             quantity, LEFT(name, 500), unit_price, NULL, ROUND(quantity * unit_price, 2),
             product_id, service_id, created_at, updated_at
      FROM (
        SELECT srs.service_record_id, 0 AS kind, srs.id AS source_id, srs.quantity, s.name,
               srs.unit_price, NULL::bigint AS product_id, srs.service_id, srs.created_at, srs.updated_at
        FROM service_record_services srs
        JOIN services s ON s.id = srs.service_id
        UNION ALL
        SELECT srp.service_record_id, 1, srp.id, srp.quantity, p.name,
               srp.unit_price, srp.product_id, NULL::bigint, srp.created_at, srp.updated_at
        FROM service_record_products srp
        JOIN products p ON p.id = srp.product_id
      ) source
    SQL
  end

  # ATENCIÓN: ROLLBACK NO SEGURO una vez que se cargaron atenciones nuevas después del deploy:
  # se pierden los ítems de texto libre (sin servicio ni producto), el % de IVA de cada ítem
  # y el detalle por línea de los ítems posteriores (quedan agrupados por catálogo).
  # Solo usarlo inmediatamente después de migrar, antes de que se use la app.
  #
  # Camino inverso con pérdida: reagrupa por (atención, servicio/producto) sumando cantidades
  # (redondeadas a entero, mínimo 1) con precio unitario promedio ponderado. Los ítems sin
  # servicio ni producto (texto libre) y el % de IVA no tienen lugar en las tablas viejas y se pierden.
  # service_record_items es la fuente: las tablas viejas se vacían antes de recargarlas.
  def down
    %w[service product].each do |kind|
      execute "DELETE FROM service_record_#{kind}s"
      execute <<~SQL
        INSERT INTO service_record_#{kind}s (service_record_id, #{kind}_id, quantity, unit_price, created_at, updated_at)
        SELECT service_record_id, #{kind}_id,
               GREATEST(ROUND(SUM(quantity)), 1)::integer,
               ROUND(COALESCE(SUM(quantity * unit_price) / NULLIF(SUM(quantity), 0), 0), 2),
               MIN(created_at), MAX(updated_at)
        FROM service_record_items
        WHERE #{kind}_id IS NOT NULL
        GROUP BY service_record_id, #{kind}_id
      SQL
    end
    execute "DELETE FROM service_record_items"
  end
end
