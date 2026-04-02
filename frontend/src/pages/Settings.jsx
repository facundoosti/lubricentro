import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Settings as SettingsIcon, Save, MapPin, Clock, Phone, User, FileText } from "lucide-react";
import { useSetting, useUpdateSetting } from "@services/settingsService";
import { showSettingSuccess, showSettingError } from "@services/notificationService";
import PageHeader from "@ui/PageHeader";
import PageError from "@ui/PageError";

const DAYS = [
  { key: "lunes", label: "Lunes" },
  { key: "martes", label: "Martes" },
  { key: "miercoles", label: "Miércoles" },
  { key: "jueves", label: "Jueves" },
  { key: "viernes", label: "Viernes" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

const DEFAULT_OPENING_HOURS = DAYS.reduce((acc, { key }) => {
  acc[key] = { open: false, from: "09:00", to: "18:00" };
  return acc;
}, {});

const schema = yup.object({
  lubricentro_name: yup.string().max(150),
  phone: yup.string().max(30),
  mobile: yup.string().max(30),
  address: yup.string(),
  latitude: yup
    .number()
    .transform((v, o) => (o === "" ? undefined : v))
    .min(-90)
    .max(90)
    .nullable(),
  longitude: yup
    .number()
    .transform((v, o) => (o === "" ? undefined : v))
    .min(-180)
    .max(180)
    .nullable(),
  cuit: yup.string().max(20),
  owner_name: yup.string().max(150),
});

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon className="w-4 h-4 text-primary" />
    <h2 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">
      {title}
    </h2>
  </div>
);

const Field = ({ label, error, children }) => (
  <div className="space-y-1">
    <label className="block text-sm text-secondary">{label}</label>
    {children}
    {error && <p className="text-xs text-error">{error}</p>}
  </div>
);

const inputCls =
  "w-full px-3 py-2 bg-surface-container border border-outline-variant text-on-surface placeholder:text-secondary rounded-lg text-sm focus:outline-none focus:border-primary transition-colors";

const Settings = () => {
  const { data, isLoading, error } = useSetting();
  const updateMutation = useUpdateSetting();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      lubricentro_name: "",
      phone: "",
      mobile: "",
      address: "",
      latitude: "",
      longitude: "",
      cuit: "",
      owner_name: "",
      opening_hours: DEFAULT_OPENING_HOURS,
    },
  });

  const openingHours = watch("opening_hours") || DEFAULT_OPENING_HOURS;

  useEffect(() => {
    if (data?.data) {
      const s = data.data;
      reset({
        lubricentro_name: s.lubricentro_name || "",
        phone: s.phone || "",
        mobile: s.mobile || "",
        address: s.address || "",
        latitude: s.latitude || "",
        longitude: s.longitude || "",
        cuit: s.cuit || "",
        owner_name: s.owner_name || "",
        opening_hours: s.opening_hours && Object.keys(s.opening_hours).length > 0
          ? s.opening_hours
          : DEFAULT_OPENING_HOURS,
      });
    }
  }, [data, reset]);

  const toggleDay = (dayKey) => {
    const current = openingHours[dayKey] || { open: false, from: "09:00", to: "18:00" };
    setValue(
      `opening_hours.${dayKey}`,
      { ...current, open: !current.open },
      { shouldDirty: true }
    );
  };

  const setDayTime = (dayKey, field, value) => {
    const current = openingHours[dayKey] || { open: true, from: "09:00", to: "18:00" };
    setValue(`opening_hours.${dayKey}`, { ...current, [field]: value }, { shouldDirty: true });
  };

  const onSubmit = async (values) => {
    try {
      await updateMutation.mutateAsync(values);
      showSettingSuccess("UPDATED");
    } catch (err) {
      showSettingError("ERROR_UPDATE", err.response?.data?.message || err.message);
    }
  };

  if (error) {
    return (
      <PageError
        title="Error al cargar la configuración"
        message={error.message || "Ha ocurrido un error inesperado"}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="Configuración"
        description="Datos del lubricentro y horarios de atención"
      />

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-surface-container rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Datos del Lubricentro */}
          <div className="bg-surface-container border border-outline-variant rounded-lg p-5">
            <SectionTitle icon={SettingsIcon} title="Datos del Lubricentro" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Field label="Nombre del Lubricentro" error={errors.lubricentro_name?.message}>
                  <input
                    {...register("lubricentro_name")}
                    placeholder="Ej: Lubricentro El Rápido"
                    className={inputCls}
                  />
                </Field>
              </div>
              <Field label="CUIT / CUIL" error={errors.cuit?.message}>
                <input
                  {...register("cuit")}
                  placeholder="20-12345678-9"
                  className={inputCls}
                />
              </Field>
              <Field label="Nombre del Dueño" error={errors.owner_name?.message}>
                <input
                  {...register("owner_name")}
                  placeholder="Nombre completo"
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          {/* Contacto */}
          <div className="bg-surface-container border border-outline-variant rounded-lg p-5">
            <SectionTitle icon={Phone} title="Contacto" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Teléfono fijo" error={errors.phone?.message}>
                <input
                  {...register("phone")}
                  placeholder="Ej: 011-4523-1234"
                  className={inputCls}
                />
              </Field>
              <Field label="Celular / WhatsApp" error={errors.mobile?.message}>
                <input
                  {...register("mobile")}
                  placeholder="Ej: 11-5678-9012"
                  className={inputCls}
                />
              </Field>
            </div>
          </div>

          {/* Dirección */}
          <div className="bg-surface-container border border-outline-variant rounded-lg p-5">
            <SectionTitle icon={MapPin} title="Ubicación" />
            <div className="space-y-4">
              <Field label="Dirección" error={errors.address?.message}>
                <input
                  {...register("address")}
                  placeholder="Ej: Av. Corrientes 1234, CABA"
                  className={inputCls}
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Latitud" error={errors.latitude?.message}>
                  <input
                    {...register("latitude")}
                    type="number"
                    step="any"
                    placeholder="-34.603722"
                    className={inputCls}
                  />
                </Field>
                <Field label="Longitud" error={errors.longitude?.message}>
                  <input
                    {...register("longitude")}
                    type="number"
                    step="any"
                    placeholder="-58.381592"
                    className={inputCls}
                  />
                </Field>
              </div>
              <p className="text-xs text-secondary">
                Podés obtener las coordenadas desde Google Maps haciendo clic derecho sobre la ubicación.
              </p>
            </div>
          </div>

          {/* Horarios */}
          <div className="bg-surface-container border border-outline-variant rounded-lg p-5">
            <SectionTitle icon={Clock} title="Días y Horario de Atención" />
            <div className="space-y-2">
              {DAYS.map(({ key, label }) => {
                const day = openingHours[key] || { open: false, from: "09:00", to: "18:00" };
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-colors ${
                      day.open
                        ? "border-primary/40 bg-primary-container/10"
                        : "border-outline-variant bg-surface-container-high"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleDay(key)}
                      className={`relative inline-flex w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-200 overflow-hidden ${
                        day.open ? "bg-primary-container" : "bg-outline"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                          day.open ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span
                      className={`w-24 text-sm font-medium ${
                        day.open ? "text-on-surface" : "text-secondary"
                      }`}
                    >
                      {label}
                    </span>
                    {day.open ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="time"
                          value={day.from}
                          onChange={(e) => setDayTime(key, "from", e.target.value)}
                          className="px-2 py-1 bg-surface-container border border-outline-variant text-on-surface rounded text-sm focus:outline-none focus:border-primary"
                        />
                        <span className="text-secondary text-sm">a</span>
                        <input
                          type="time"
                          value={day.to}
                          onChange={(e) => setDayTime(key, "to", e.target.value)}
                          className="px-2 py-1 bg-surface-container border border-outline-variant text-on-surface rounded text-sm focus:outline-none focus:border-primary"
                        />
                      </div>
                    ) : (
                      <span className="text-secondary text-sm">Cerrado</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateMutation.isPending || !isDirty}
              className="flex items-center gap-2 px-5 py-2 bg-primary-container text-on-primary rounded-lg font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Settings;
