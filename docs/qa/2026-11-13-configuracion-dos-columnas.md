# QA: Configuración en dos columnas

## Riesgo: bajo — layout de una sola pantalla, sin lógica nueva

- [x] **TC-01** · must · script · desktop-dark,desktop-light · A 1440 la form queda a la izquierda y horarios+planes a la derecha, lado a lado, sin scroll horizontal — *origen: diff* ✅ formX 322 w531 · asideX 877 w531 · sin overflow
- [x] **TC-02** · must · vitest · Guardar sigue enviando los horarios (aside fuera del `<form>`) — *Settings.test.jsx "tipear 0830…" + "columna lateral"* ✅
- [x] **TC-03** · must · script · desktop-dark,desktop-light · Guardar queda debajo de ambas columnas, alineado a la derecha — *origen: diff*
